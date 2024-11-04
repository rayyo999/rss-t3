"use client";

import { useSearchParams } from "next/dist/client/components/navigation";
import { useRouter } from "next/navigation";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function UserList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");

  const { data, isLoading } = api.user.getAll.useQuery({
    q,
    currentPage: page ?? 1,
    pageSize: 2,
  });

  return (
    <div>
      <Input
        placeholder="Search by name"
        value={q}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams);
          params.set("q", e.target.value);
          params.set("page", "1");
          router.replace(`?${params.toString()}`);
        }}
        className="max-w-sm"
      />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        pageCount={data?.pageCount ?? 1}
        isLoading={isLoading}
      />

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.replace(`?page=${page - 1}`)}
          disabled={!data?.hasPreviousPage}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.replace(`?page=${page + 1}`)}
          disabled={!data?.hasNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
