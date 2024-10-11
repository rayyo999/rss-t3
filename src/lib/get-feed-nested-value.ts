import type { RemoteFeed } from "~/types";

export function getFeedNestedValue<T>(feed: T, keyPath: string): unknown {
  return keyPath.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      const value = (acc as RemoteFeed)[part];

      if (Array.isArray(value)) {
        return value
          .flat()
          .map((item) =>
            typeof item === "string" ? item.trim() : JSON.stringify(item),
          )
          .join(", ");
      }

      return typeof value === "string" ? value.trim() : value;
    }
    return undefined;
  }, feed);
}
