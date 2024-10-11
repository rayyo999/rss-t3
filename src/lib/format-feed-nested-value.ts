import type { z } from "zod";
import type { replacementSchema } from "~/server/api/schema/feed";

export function formatFeedNestedValue(
  value: unknown,
  replacements?: z.infer<typeof replacementSchema>[],
): string {
  if (value === null || value === undefined) {
    return "...";
  }

  let formattedValue: string;

  if (typeof value === "object" && value !== null) {
    if (Array.isArray(value)) {
      formattedValue = value.join(", ");
    } else {
      formattedValue = JSON.stringify(value);
    }
  } else {
    formattedValue = String(value);
  }

  if (replacements && replacements.length > 0) {
    replacements.forEach(({ target, value }) => {
      if (!target || !value) return;
      const regex = new RegExp(target, "g");
      formattedValue = formattedValue.replace(regex, value);
    });
  }

  return formattedValue;
}
