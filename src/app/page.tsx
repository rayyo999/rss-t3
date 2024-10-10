import Link from "next/link";
import { Suspense } from "react";

import { Button } from "~/components/ui/button";
import { getServerAuthSession } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { FeedCardSkeleton, FeedList } from "./_components/feed-list";

export default async function Home() {
  const session = await getServerAuthSession();
  void api.feed.getAll.prefetch();

  if (!session || !session.user) {
    return (
      <div className="grid min-h-screen w-full place-items-center">
        Login First
      </div>
    );
  }

  return (
    <HydrateClient>
      <main className="drak:from-[#2e026d] drak:to-[#15162c] drak:text-white flex min-h-screen flex-col items-center justify-center bg-gradient-to-b">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <Link href="/feed/create">
            <Button variant="outline">Add Feed</Button>
          </Link>
          <div className="w-full overflow-y-scroll">
            <Suspense
              fallback={
                <div className="flex flex-col gap-4">
                  <FeedCardSkeleton />
                  <FeedCardSkeleton />
                  <FeedCardSkeleton />
                </div>
              }
            >
              <FeedList />
            </Suspense>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
