import Link from "next/link";
import ThemeToggle from "~/components/theme/theme-select";
import { Separator } from "~/components/ui/separator";
import AuthButtonContainer from "../auth/auth-button-container";

export default function Nav() {
  return (
    <nav className="sticky top-0 z-40 flex w-full flex-col gap-1 bg-background pt-1">
      <div className="flex items-center justify-between px-5 py-1">
        <Link href="/">
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
            <p>Rss-Telegram</p>
          </div>
        </Link>
        <div className="flex items-center justify-center gap-3">
          <AuthButtonContainer />
          <ThemeToggle />
        </div>
      </div>
      <Separator />
    </nav>
  );
}
