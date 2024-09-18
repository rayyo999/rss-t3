"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { api, type RouterOutputs } from "~/trpc/react";

export function FeedList() {
  const [feeds] = api.feed.getAll.useSuspenseQuery();

  if (feeds.length === 0) {
    return (
      <div className="relative flex w-full flex-col gap-4">
        <FeedCardSkeleton pulse={false} />
        <FeedCardSkeleton pulse={false} />
        <FeedCardSkeleton pulse={false} />

        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
          <p className="text-2xl font-bold text-white">No feeds yet</p>
        </div>
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

export function FeedCard(props: {
  feed: RouterOutputs["feed"]["getAll"][number];
}) {
  return (
    <Link href={`/feed/${props.feed.id}`}>
      <Card className="transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg">
        <CardHeader>
          <CardTitle>{props.feed.title}</CardTitle>
          <CardDescription>
            <a
              href={props.feed.url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-sm text-blue-500 hover:underline"
              onClick={(e) => e.stopPropagation()} // Prevent navigation to feed page when clicking the URL
            >
              {props.feed.url}
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Add any additional content here if needed */}
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <span>
            Updated:{" "}
            {props.feed.userUpdatedAt
              ? new Date(props.feed.userUpdatedAt).toLocaleString()
              : "Never"}
          </span>
          <span>
            Last Notified:{" "}
            {props.feed.lastNotifiedAt
              ? new Date(props.feed.lastNotifiedAt).toLocaleString()
              : "Never"}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}

export function FeedCardSkeleton(props: { pulse?: boolean }) {
  const { pulse = true } = props;
  return (
    <div className="flex flex-row rounded-lg bg-muted p-4">
      <div className="flex-grow">
        <h2
          className={cn(
            "w-1/4 rounded bg-primary text-2xl font-bold",
            pulse && "animate-pulse",
          )}
        >
          &nbsp;
        </h2>
        <p
          className={cn(
            "mt-2 w-1/3 rounded bg-current text-sm",
            pulse && "animate-pulse",
          )}
        >
          &nbsp;
        </p>
      </div>
    </div>
  );
}
