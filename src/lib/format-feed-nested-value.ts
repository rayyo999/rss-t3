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
    // eslint error: Error: 'value' will use Object's default stringification format ('[object Object]') when stringified.  @typescript-eslint/no-base-to-string
    // formattedValue = String(value);
  
    formattedValue = JSON.stringify(value);
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
