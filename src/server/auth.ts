import { AuthDataValidator, objectToAuthDataMap } from "@telegram-auth/server";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import DiscordProvider from "next-auth/providers/discord";

import { env } from "~/env";
import { db } from "~/server/db";
import { accounts, sessions, users } from "~/server/db/schema";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  callbacks: {
    // session: ({ session, user }) => ({
    //   ...session,
    //   user: {
    //     ...session.user,
    //     id: user.id,
    //   },
    // }),
    session({ session, token }) {
      // if (session.user) {
      //   session.user.id = user.id;
      // }
      session.user.id = token.id as string;
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  // adapter: DrizzleAdapter(db, {
  //   usersTable: users,
  //   accountsTable: accounts,
  //   sessionsTable: sessions,
  //   verificationTokensTable: verificationTokens,
  // }) as Adapter,
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
    CredentialsProvider({
      id: "telegram-login",
      name: "Telegram Login",
      credentials: {},
      async authorize(
        _credentials,
        req,
      ): Promise<typeof users.$inferSelect | null> {
        const validator = new AuthDataValidator({
          botToken: env.TELEGRAM_BOT_TOKEN,
        });
        const data = objectToAuthDataMap(req.query ?? {});
        const validatedUser = await validator.validate(data);

        if (validatedUser.id && validatedUser.first_name) {
          const telegramUser = {
            id: validatedUser.id.toString(),
            email: `${validatedUser.id}@telegram-mail.org`, // telegram will not return email, so we use placeholder for now
            name: `${validatedUser.first_name} ${validatedUser.last_name ?? ""}`,
            image: validatedUser.photo_url,
          };

          // Check if user exists
          let dbUser = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, telegramUser.email),
          });

          if (!dbUser) {
            // Create new user if not exists
            const [newUser] = await db
              .insert(users)
              .values({
                name: telegramUser.name,
                email: telegramUser.email,
                image: telegramUser.image,
              })
              .returning();
            dbUser = newUser;
          }

          if (!dbUser) {
            throw new Error("User creation failed");
          }

          // Ensure Telegram account is linked
          const existingAccount = await db.query.accounts.findFirst({
            where: (accounts, { eq, and }) =>
              and(
                eq(accounts.providerAccountId, telegramUser.id),
                eq(accounts.provider, "telegram"),
              ),
          });

          if (!existingAccount) {
            await db.insert(accounts).values({
              userId: dbUser.id,
              type: "credentials",
              provider: "telegram",
              providerAccountId: telegramUser.id,
            });
          }

          // Check if session exists, create if not
          const existingSession = await db.query.sessions.findFirst({
            where: (sessions, { eq }) => eq(sessions.userId, dbUser.id),
          });

          if (!existingSession) {
            await db.insert(sessions).values({
              userId: dbUser.id,
              expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
              sessionToken: crypto.randomUUID(),
            });
          }

          return dbUser;
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
