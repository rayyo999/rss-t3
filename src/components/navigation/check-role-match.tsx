"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { useRoleStore } from "~/stores";

export default function CheckRoleMatch() {
  const { isRoleMismatch, reset } = useRoleStore();

  function handleCancel() {
    reset();
  }

  async function handleSignOut() {
    reset();
    await signIn("telegram-login", { callbackUrl: "/" });
  }

  return (
    <AlertDialog open={isRoleMismatch}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Role Update Required</AlertDialogTitle>
          <AlertDialogDescription>
            Your role has been updated. Please sign out and sign in again to
            continue using the application with your new permissions.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSignOut}>
            <Link href="/api/auth/signout">
              <div className="flex items-center gap-2">
                <span>Sign Out</span>
              </div>
            </Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
