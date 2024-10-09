"use client";

import { CheckIcon, PlusIcon } from "@radix-ui/react-icons";
import { useFormContext } from "react-hook-form";
import type { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { useFeedKeys } from "~/hooks/use-feed-keys";
import { cn } from "~/lib/utils";
import type { feedCreateSchema } from "~/server/api/schema/feed";
import { ReplacementField } from "./replacement-field";

export function SelectedKeysField() {
  const { control } = useFormContext<z.infer<typeof feedCreateSchema>>();
  const { keys, toggleSelectedKey, isSyncing, isSyncError } = useFeedKeys();

  // loading state
  if (isSyncing) {
    return (
      <div>
        <h3 className="font-semibold">Keys</h3>
        <div className="mt-2 space-y-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="rounded-lg border p-4">
              <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-2">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="mt-2 h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // error state
  if (isSyncError) {
    return (
      <div className="text-destructive">
        <h3 className="font-semibold">Keys</h3>
        <p className="mt-2 text-sm">
          No keys available. Please try another feed.
        </p>
      </div>
    );
  }

  // initial state
  if (!keys.length) {
    return (
      <div>
        <h3 className="font-semibold">Keys</h3>
        <p className="mt-2 text-sm text-gray-500">
          Please click Get Preview to see the keys
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold">Keys</h3>
      <ul className="mt-2 grid gap-4">
        {keys.map(({ id, key, isSelected }, index) => (
          <li key={id} className="rounded-lg border p-4">
            <div className="space-y-2">
              <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "focus:ring-primary-500 rounded border-gray-300",
                    isSelected ? "border-input" : "bg-transparent",
                  )}
                  onClick={() => toggleSelectedKey(id)}
                >
                  {isSelected ? <CheckIcon /> : <PlusIcon />}
                </Button>
                <Label
                  htmlFor={`keys.${index}.customKey`}
                  className="flex h-full items-center pl-3"
                >
                  {key}
                </Label>
                <FormField
                  control={control}
                  name={`keys.${index}.customKey`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          id={`keys.${index}.customKey`}
                          placeholder={
                            "custom " +
                            key.charAt(0).toUpperCase() +
                            key.slice(1)
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <ReplacementField index={index} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
