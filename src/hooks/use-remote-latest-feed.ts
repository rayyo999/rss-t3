import { useCallback, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import type { z } from "zod";

import type { feedCreateSchema } from "~/server/api/schema/feed";
import { api } from "~/trpc/react";
import type { RemoteFeed } from "~/types";
import { useToast } from "./use-toast";

type Key = z.infer<typeof feedCreateSchema>["keys"][number];

export const useRemoteLatestFeed = (url: string) => {
  const { toast } = useToast();
  const [feed, setFeed] = useLocalStorage<RemoteFeed | undefined>(
    url,
    undefined,
  );

  const { data, refetch, isError, isFetching } =
    api.feed.getRemoteLatest.useQuery(
      {
        url,
      },
      { enabled: false, retry: 2 },
    );

  // set feed to local storage
  useEffect(() => {
    if (!data) return;

    setFeed(data);
  }, [data, setFeed]);

  useEffect(() => {
    if (!isError) return;

    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to get feed, please check the URL and try again",
    });
  }, [isError, toast]);

  return {
    feed,
    syncCurrentKeys: useCallback(
      async (
        oldKeys: Key[],
        //this is a callback to set the updated keys to the form state
        setValueCallback: (keys: Key[]) => void,
      ) => {
        const { data: newFeed } = await refetch();
        if (!newFeed) {
          toast({
            variant: "destructive",
            title: "Error",
            description:
              "Failed to get feed, please check the URL and try again",
          });
          return;
        }

        const newKeys = getKeysFromRemoteFeed(newFeed);
        const oldKeysMap = new Map(oldKeys.map((key) => [key.key, key]));
        const updatedKeys = newKeys.map(
          (key) => oldKeysMap.get(key.key) ?? key,
        );
        setValueCallback(updatedKeys);
      },
      [refetch, toast],
    ),
    isFetching,
    isError,
  };
};

function getKeysFromRemoteFeed(feed: RemoteFeed) {
  return createObjectKeysFromStringKeys(
    extractStringKeysFromRemoteLatestFeed(feed),
  );
}

// Helper function to extract keys from an object
function extractStringKeysFromRemoteLatestFeed(obj: RemoteFeed, prefix = "") {
  return Object.keys(obj).reduce((res: string[], key: string) => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      res.push(
        ...extractStringKeysFromRemoteLatestFeed(value as RemoteFeed, newKey),
      );
    } else {
      res.push(newKey);
    }
    return res;
  }, []);
}

function createObjectKeysFromStringKeys(strings: string[]) {
  return strings.map(
    (key) =>
      ({
        id: crypto.randomUUID(),
        key,
        customKey: undefined,
        replacements: undefined,
        type: "string", // default, can be "string" or "date"
        isSelected: true,
      }) satisfies Key,
  );
}
