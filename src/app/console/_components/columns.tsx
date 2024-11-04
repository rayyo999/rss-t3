"use client";

import { Pencil1Icon } from "@radix-ui/react-icons";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import type { users } from "~/server/db/schema";

type User = typeof users.$inferSelect;

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "feedLimit",
    header: "Feed Limit",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <Link href={`/console/user/${user.id}`}>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Inspect user</span>
            <Pencil1Icon />
          </Button>
        </Link>
      );
    },
  },
];
