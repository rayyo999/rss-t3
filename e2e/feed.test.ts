import { expect, test, type Page } from "@playwright/test";
import { eq } from "drizzle-orm";

import { env } from "~/env";
import { db } from "~/server/db";
import { feeds } from "~/server/db/schema";
import type { RouterInputs } from "~/trpc/react";
import { TEST_USER } from "./setup/global";

const TELEGRAM_TEST_BOT_TOKEN =
  env.TELEGRAM_TEST_BOT_TOKEN ?? "EMPTY_TELEGRAM_TEST_BOT_TOKEN";

test.beforeEach(async () => {
  await clearFeeds();
});

test.describe("Feed", () => {
  test("should not create a new feed with bot token that does not exist", async ({
    page,
  }) => {
    await page.goto("/");
    await createFeed(
      {
        title: "Test Feed",
        url: "https://example.com/rss",
        botToken: "1234567890",
      },
      page,
    );
    await expect(
      page.getByText(
        "Invalid bot token, not found, please check your bot token again",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(page.getByText("Test Feed")).not.toBeVisible();
  });

  test("should create a new feed", async ({ page }) => {
    await page.goto("/");
    await createFeed(
      {
        title: "Test Feed",
        url: "https://example.com/rss",
      },
      page,
    );
    await expect(
      page.getByText("Feed created successfully", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Test Feed")).toBeVisible();
  });

  test("should update feed", async ({ page }) => {
    await page.goto("/");
    await createFeed(
      {
        title: "Test Feed 2",
        url: "https://example.com/rss",
      },
      page,
    );
    await page.getByText("Test Feed 2").click();
    // wait for page to change /feed/random+id
    await page.waitForURL(/\/feed\/.+/);

    const titleTextbox = page.getByRole("textbox", { name: "Title" });
    await titleTextbox.fill("Updated Test Feed 2");
    await page.getByRole("button", { name: "Update feed" }).click();
    await expect(
      page.getByText("Feed updated successfully", { exact: true }),
    ).toBeVisible();
    // await page.waitForTimeout(5000);

    //expect titleTextBox to have value "Updated Test Feed 2"

    await page.goto("/");
    await expect(page.getByText("Updated Test Feed 2")).toBeVisible();
  });

  test("should delete a feed and be redirected to /", async ({ page }) => {
    await page.goto("/");
    await createFeed(
      {
        title: "Test Feed To be Deleted",
        url: "https://example.com/rss",
      },
      page,
    );
    await page.getByText("Test Feed To be Deleted").click();
    await page.getByRole("button", { name: "Delete Feed" }).click();
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(
      page.getByText("Feed deleted successfully", { exact: true }),
    ).toBeVisible();

    //expect be redirected to /
    expect(page.url()).not.toContain("/feed");
    await expect(page.getByText("Test Feed To be Deleted")).not.toBeVisible();
  });

  //test should fail if user create more than feed limit
  test("should fail if user create more than feed limit", async ({ page }) => {
    await page.goto("/");
    const feedLimit = Number(env.FEED_LIMIT_PER_USER);

    // Assuming 3 feeds have already been created
    for (let i = 0; i < feedLimit; i++) {
      await createFeed(
        {
          title: `Test Feed ${i + 1}`,
          url: "https://example.com/rss",
        },
        page,
      );
      await expect(page.getByText(`Test Feed ${i + 1}`)).toBeVisible();
    }

    // Attempt to create a feed beyond the limit
    await createFeed(
      {
        title: "Test Feed Beyond Limit",
        url: "https://example.com/rss",
      },
      page,
    );

    // Expect the error message for reaching the feed limit
    await expect(
      page.getByText(
        `You have reached the maximum limit of ${feedLimit} feeds.`,
        { exact: true },
      ),
    ).toBeVisible();
    await expect(page.getByText("Test Feed Beyond Limit")).not.toBeVisible();
  });
});

async function createFeed(
  feed: Omit<RouterInputs["feed"]["create"], "botToken"> & {
    botToken?: string;
  },
  page: Page,
) {
  const { title, url, botToken = TELEGRAM_TEST_BOT_TOKEN } = feed;
  await page.getByRole("textbox", { name: "Title" }).fill(title);
  await page.getByRole("textbox", { name: "URL" }).fill(url);
  await page.getByRole("textbox", { name: "Bot Token" }).fill(botToken);
  await page.getByRole("button", { name: "Create Feed" }).click();
}

async function clearFeeds() {
  await db.delete(feeds).where(eq(feeds.createdById, TEST_USER.id));
}
