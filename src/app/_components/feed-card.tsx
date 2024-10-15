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
import { type RouterOutputs } from "~/trpc/react";

export default function FeedCard(props: {
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
