"use client";

import { api } from "~/trpc/react";
import FeedCard from "./feed-card";

export function FeedCardList() {
  const [feeds] = api.feed.getAll.useSuspenseQuery();

  if (feeds.length === 0) {
    return (
      <div className="relative flex w-full flex-col items-center gap-4">
        <p className="text-2xl font-bold text-white">No feeds yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:px-20 md:py-8">
      {feeds.map((p) => {
        return <FeedCard key={p.id} feed={p} />;
      })}
    </div>
  );
}
