"use client";

import { useFormContext } from "react-hook-form";
import type { z } from "zod";

import { Skeleton } from "~/components/ui/skeleton";
import { useFeedKeys } from "~/hooks/use-feed-keys";
import { useRemoteLatestFeed } from "~/hooks/use-remote-latest-feed";
import { formatFeedNestedValue } from "~/lib/format-feed-nested-value";
import { getFeedNestedValue } from "~/lib/get-feed-nested-value";
import type { feedCreateSchema } from "~/server/api/schema/feed";

export function FeedPreview() {
  const { watch } = useFormContext<z.infer<typeof feedCreateSchema>>();
  const { feed } = useRemoteLatestFeed(watch("url"));
  const { selectedKeys, isSyncing, isSyncError } = useFeedKeys();

  // loading state
  if (isSyncing) {
    return (
      <div>
        <h3 className="text-lg font-semibold">Preview</h3>
        <ul className="mt-2 space-y-4 rounded-lg p-4 dark:bg-gray-800">
          {Array.from({ length: 3 }).map((_, index) => (
            <li key={index}>
              <Skeleton className="h-6 w-full" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // error state
  if (isSyncError) {
    return (
      <div className="text-destructive">
        <h3 className="text-lg font-semibold">Preview</h3>
        <p className="mt-2 text-sm">
          Message not available. Please try another feed.
        </p>
      </div>
    );
  }

  // initial state
  if (!feed) {
    return (
      <div>
        <h3 className="text-lg font-semibold">Preview</h3>
        {/* <ul className="mt-2 list-disc space-y-4 rounded-lg p-4 pl-7 dark:bg-gray-800">
          {selectedKeys.map(({ key, id }) => (
            <li key={id} className="text-sm">
              <div className="flex gap-3">
                <p className="min-w-fit font-medium">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  <span> : </span>
                  ...
                </p>
              </div>
            </li>
          ))}
        </ul> */}
        <p className="mt-2 text-sm text-gray-500">
          Please click Get Preview to see the preview
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold">Preview</h3>
      <ul className="mt-2 list-disc space-y-4 rounded-lg p-4 pl-7 dark:bg-gray-800">
        {selectedKeys.map(({ key, id, customKey, replacements }) => (
          <li key={id} className="text-sm">
            <p className="min-w-fit break-all font-medium">
              {!!customKey
                ? customKey
                : key.charAt(0).toUpperCase() + key.slice(1)}
              <span> : </span>
              {formatFeedNestedValue(
                getFeedNestedValue(feed, key),
                replacements,
              )}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
