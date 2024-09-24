import type { Cookie } from "@playwright/test";
import { chromium } from "@playwright/test";
import { eq } from "drizzle-orm";
import { encode } from "next-auth/jwt";
import path from "node:path";
import { dirname } from "path";
import { fileURLToPath } from "url";

import { env } from "~/env";
import { db } from "~/server/db";
import { accounts, sessions, users } from "~/server/db/schema";

export const TEST_USER = {
  id: "99b76d25-1cbc-4f79-83a3-4cb9a678de0d",
  name: "Test User",
  email: "test.user@example.com",
  image: null,
};

//infer type user from db excluding emailVerified
type TestUser = Omit<typeof users.$inferSelect, "emailVerified">;

const NEXTAUTH_SECRET = env.NEXTAUTH_SECRET ?? "secret";

const PLAYWRIGHT_TEST_BASE_URL =
  env.PLAYWRIGHT_TEST_BASE_URL ?? "http://localhost:3000";
const PLAYWRIGHT_TEST_DOMAIN =
  PLAYWRIGHT_TEST_BASE_URL.split("//")[1] ?? "localhost:3000";

export default async function globalSetup() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const storageState = path.resolve(__dirname, "storage-state.json");
  const browser = await chromium.launch();
  // const context = await browser.newContext({ storageState });
  const context = await browser.newContext();
  // Clear existing cookies
  await context.clearCookies();

  // get or create test user and create test cookie
  const user = await getOrCreateTestUser(TEST_USER);
  const cookies = await createTestCookie(user);
  await context.addCookies(cookies);
  await context.storageState({ path: storageState });
  await browser.close();
}

async function getOrCreateTestUser(testUser: TestUser) {
  const [user] = await db.select().from(users).where(eq(users.id, testUser.id));

  if (user) return user;

  // if testUser is not found, create one in db
  return await db.transaction(async (trx) => {
    const [newUser] = await trx
      .insert(users)
      .values({
        ...testUser,
      })
      .returning();

    await trx.insert(accounts).values({
      userId: newUser?.id ?? testUser.id,
      type: "credentials",
      provider: "localTest",
      providerAccountId: `${Math.floor(1e9 + Math.random() * 9e9)}`, // create random 10-digit account id
    });

    // create a session in db that hasn't expired yet, with the same id as the cookie
    const now = new Date();

    await trx.insert(sessions).values({
      sessionToken: crypto.randomUUID(),
      userId: newUser?.id ?? testUser.id,
      expires: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    });

    if (!newUser) return undefined;

    const { emailVerified, ...data } = newUser;
    return data;
  });
}

async function createTestCookie(user: TestUser | undefined): Promise<Cookie[]> {
  if (!user) {
    throw new Error("User not found");
  }

  const encodedToken = await encode({
    token: {
      ...user,
      sub: user.id,
    },
    secret: NEXTAUTH_SECRET,
  });

  return [
    {
      name: "__Secure-next-auth.session-token",
      value: encodedToken,
      domain: PLAYWRIGHT_TEST_DOMAIN,
      path: "/",
      httpOnly: true,
      secure: true,
      expires: -1,
      sameSite: "Lax",
    },

    // bypass ngrok interstitial
    {
      name: "abuse_interstitial",
      value: PLAYWRIGHT_TEST_DOMAIN,
      domain: PLAYWRIGHT_TEST_DOMAIN,
      path: "/",
      httpOnly: false,
      secure: true,
      sameSite: "None",
      expires: -1,
    },
  ];
}
