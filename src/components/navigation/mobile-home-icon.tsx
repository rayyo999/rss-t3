"use client";

import {
  CircleIcon,
  HomeIcon,
  QuestionMarkCircledIcon,
  TextAlignJustifyIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";

export default function MobileHomeIcon() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 sm:hidden"
        >
          <TextAlignJustifyIcon className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="flex flex-col gap-4 sm:hidden">
          <Link href="/">
            <div
              className="flex items-center gap-1"
              onClick={() => setOpen(false)}
            >
              <CircleIcon className="h-6 w-6" />
              <p>Rss-Telegram</p>
            </div>
          </Link>

          <Link href="/">
            <div
              className="flex items-center gap-1"
              onClick={() => setOpen(false)}
            >
              <HomeIcon className="h-6 w-6" />
              <span>Home</span>
            </div>
          </Link>

          <Link href="/faq">
            <div
              className="flex items-center gap-1"
              onClick={() => setOpen(false)}
            >
              <QuestionMarkCircledIcon className="h-6 w-6" />
              <span>FAQ</span>
            </div>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
