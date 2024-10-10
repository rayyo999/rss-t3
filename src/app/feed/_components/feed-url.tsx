"use client";

import { useFormContext } from "react-hook-form";
import type { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useFeedKeys } from "~/hooks/use-feed-keys";
import type { feedCreateSchema } from "~/server/api/schema/feed";

export function FeedUrl() {
  const { control, trigger } =
    useFormContext<z.infer<typeof feedCreateSchema>>();
  const { syncKeys, isSyncing } = useFeedKeys();

  async function handleOnClick() {
    const isURLValid = await trigger("url");
    if (isURLValid) {
      await syncKeys();
    }
  }
  return (
    <FormField
      control={control}
      name="url"
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor="url">URL</FormLabel>
          <FormControl>
            <div className="flex gap-2">
              <Input
                id="url"
                placeholder="https://example.com/feed.xml"
                {...field}
                disabled={isSyncing}
              />
              <Button
                type="button"
                onClick={handleOnClick}
                disabled={isSyncing}
                className="h-10"
              >
                Get Preview
              </Button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
