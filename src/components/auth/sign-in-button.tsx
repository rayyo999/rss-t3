"use client";

import { LoginButton } from "@telegram-auth/react";
import { signIn } from "next-auth/react";

export default function SignInButton({ botUsername }: { botUsername: string }) {
  return (
    <LoginButton
      botUsername={botUsername}
      onAuthCallback={(data) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        void signIn("telegram-login", { callbackUrl: "/" }, data as any);
      }}
    />
  );
}
