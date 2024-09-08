import { getServerAuthSession } from "~/server/auth";
import SignInButton from "./sign-in-button";
import SignOutButton from "./sign-out-button";
import { env } from "~/env";

export default async function AuthButtonContainer() {
  const session = await getServerAuthSession();

  return !!session ? (
    <SignOutButton />
  ) : (
    <SignInButton botUsername={env.TELEGRAM_BOT_USERNAME} />
  );
}
