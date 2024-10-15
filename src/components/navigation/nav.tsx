import {
  CircleIcon,
  HomeIcon,
  QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";

import ThemeToggle from "~/components/theme/theme-select";
import { Separator } from "~/components/ui/separator";
import AuthButtonContainer from "../auth/auth-button-container";
import MobileHomeIcon from "./mobile-home-icon";

export default function Nav() {
  return (
    <nav className="sticky top-0 z-40 flex w-full flex-col gap-1 bg-background pt-1">
      <div className="flex items-center justify-between px-5 py-1">
        <div className="hidden sm:flex sm:gap-4">
          <Link href="/">
            <div className="flex items-center gap-1">
              <CircleIcon className="h-6 w-6" />
              <p>Rss-Telegram</p>
            </div>
          </Link>

          <Link href="/">
            <div className="flex items-center gap-1">
              <HomeIcon className="h-6 w-6" />
              <span>Home</span>
            </div>
          </Link>

          <Link href="/faq">
            <div className="flex items-center gap-1">
              <QuestionMarkCircledIcon className="h-6 w-6" />
              <span>FAQ</span>
            </div>
          </Link>
        </div>

        <MobileHomeIcon />

        <div className="flex items-center justify-center gap-3">
          <AuthButtonContainer />
          <ThemeToggle />
        </div>
      </div>
      <Separator />
    </nav>
  );
}
