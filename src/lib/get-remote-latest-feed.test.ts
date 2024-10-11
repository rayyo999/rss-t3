import { describe, expect, it } from "vitest";
import { getRemoteLatestFeed } from "./get-remote-latest-feed";

describe("getRemoteLatestFeed", () => {
  it("should throw an error for an invalid URL", async () => {
    const invalidUrl = "invalid-url";

    await expect(getRemoteLatestFeed(invalidUrl)).rejects.toThrowError(
      new Error("Invalid URL provided"),
    );
  });
});
