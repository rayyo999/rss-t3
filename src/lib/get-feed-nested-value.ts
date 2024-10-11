import type { RemoteFeed } from "~/types";

export function getFeedNestedValue<T>(feed: T, keyPath: string): unknown {
  return keyPath.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as RemoteFeed)[part];
    }
    return undefined;
  }, feed);
}
