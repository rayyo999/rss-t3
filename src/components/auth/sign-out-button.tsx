import { ExitIcon } from "@radix-ui/react-icons";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { getServerAuthSession } from "~/server/auth";

export default async function SignOutButton() {
  const session = await getServerAuthSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <Avatar>
            <AvatarImage
              src={session?.user?.image ?? "/default.webp"}
              alt="@ray"
            />
            <AvatarFallback>{session?.user?.name}</AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>{session?.user?.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/api/auth/signout">
            <div className="flex items-center gap-2">
              <ExitIcon className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </div>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
