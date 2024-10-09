import { useCallback } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { z } from "zod";

import type { feedCreateSchema } from "~/server/api/schema/feed";
import { useRemoteLatestFeed } from "./use-remote-latest-feed";

// custom hook to manage the selected keys, cuurently native useFieldArray is not shared data between components, this is a workaround, trade off is that setValue will trigger a rerender of the entire form, if the keys array is large, it will cause performance issues
// watch the issue https://github.com/react-hook-form/react-hook-form/pull/7544

//TODO: check rerender issue, maybe use useFieldArray and prop the fields to the components
export const useFeedKeys = () => {
  const formKey = "keys";
  const { setValue } = useFormContext<z.infer<typeof feedCreateSchema>>();
  const keys = useWatch<z.infer<typeof feedCreateSchema>, typeof formKey>({
    name: formKey,
  });
  const selectedKeys = keys.filter((key) => key.isSelected);

  const url = useWatch<z.infer<typeof feedCreateSchema>, "url">({
    name: "url",
  });
  const { syncCurrentKeys, isFetching, isError } = useRemoteLatestFeed(url);

  return {
    keys,
    selectedKeys,
    toggleSelectedKey: useCallback(
      (id: string) => {
        const newKeys = keys.map((key) =>
          key.id === id ? { ...key, isSelected: !key.isSelected } : key,
        );
        setValue(formKey, newKeys, { shouldDirty: true });
      },
      [formKey, keys, setValue],
    ),

    syncKeys: useCallback(async () => {
      await syncCurrentKeys(keys, (updatedKeys) =>
        setValue(formKey, updatedKeys, { shouldDirty: true }),
      );
    }, [keys, setValue, syncCurrentKeys]),
    isSyncing: isFetching,
    isSyncError: isError,
  };
};
