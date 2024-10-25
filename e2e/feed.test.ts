import { expect, test, type Page } from "@playwright/test";
import { eq } from "drizzle-orm";

import { env } from "~/env";
import { db } from "~/server/db";
import { feeds } from "~/server/db/schema";
import type { RouterInputs } from "~/trpc/react";
import { TEST_USER } from "./setup/global";

const TELEGRAM_TEST_BOT_TOKEN =
  env.TELEGRAM_TEST_BOT_TOKEN ?? "EMPTY_TELEGRAM_TEST_BOT_TOKEN";

const validFeedURL = "https://www.freecodecamp.org/news/rss";

test.beforeEach(async () => {
  await clearFeeds();
});

test.describe("Feed", () => {
  test.describe("Preview URL", () => {
    test("should not get preview content and should display error text when url is not valid", async ({
      page,
    }) => {
      await page.goto("/feed/create");

      await page
        .getByRole("textbox", { name: "URL", exact: true })
        .fill("asdlfkjalsdfjs.cc");
      await page.getByRole("button", { name: "Get Preview" }).click();

      await expect(
        page.getByText("Invalid URL format", {
          exact: true,
        }),
      ).toBeVisible();
    });

    test("should display error text and error toast when get preview failed", async ({
      page,
    }) => {
      await page.goto("/feed/create");
      await getPreview({ url: "https://example.com/rss" }, page);

      //error text
      await expect(
        page.getByText("No keys available. Please try another feed.", {
          exact: true,
        }),
      ).toBeVisible({ timeout: 15000 });
      await expect(
        page.getByText("Message not available. Please try another feed.", {
          exact: true,
        }),
      ).toBeVisible({ timeout: 15000 });

      //error toast
      await expect(
        page.getByText(
          "Failed to get feed, please check the URL and try again",
          {
            exact: true,
          },
        ),
      ).toBeVisible({ timeout: 15000 });
    });

    test("should get preview content and keys with a valid feed url", async ({
      page,
    }) => {
      await page.goto("/feed/create");
      await getPreview({ url: validFeedURL }, page);

      const previewSection = page
        .locator('div:has(h3:has-text("Preview"))')
        .first();

      //wait for values in preview content to be set
      await expect(
        previewSection
          .getByRole("listitem")
          .filter({ hasText: "Title", hasNotText: "Add Replace Target/Value" }),
      ).toBeVisible();

      //expect more than 3 items(default keys has 3 items)
      expect(
        await previewSection.getByRole("listitem").count(),
      ).toBeGreaterThan(3);
    });

    test("should display custom key in preview section after user input valid feed url and customize keys", async ({
      page,
    }) => {
      await page.goto("/feed/create");
      await getPreview({ url: validFeedURL }, page);
      await customizeKeys(
        [
          {
            id: "",
            key: "title",
            customKey: "Custom Title",
            replacements: [],
            isSelected: true,
          },
          {
            id: "",
            key: "isoDate",
            customKey: "",
            replacements: [
              {
                id: "",
                target: "T",
                value: "@T@",
              },
              {
                id: "",
                target: "Z",
                value: "@Z@",
              },
            ],
            isSelected: true,
          },
        ],
        page,
      );
      const previewSection = page
        .locator('div:has(h3:has-text("Preview"))')
        .first();

      await expect(
        previewSection
          .getByRole("listitem")
          .filter({ hasText: "Custom Title" }),
      ).toBeVisible();

      // Check isoDate in preview section has the correct content text
      const isoDateElement = previewSection
        .getByRole("listitem")
        .filter({ hasText: "IsoDate", hasNotText: "Add Replace Target/Value" });
      await isoDateElement.scrollIntoViewIfNeeded();
      await expect(isoDateElement).toBeVisible();
      await expect(isoDateElement).toHaveText(/@T@.*@Z@/);
    });
  });

  test.describe("Get, Create, Update, Delete Feed", () => {
    test("should navigate to /feed/create when click 'Add Feed' button in the home page", async ({
      page,
    }) => {
      await page.goto("/");
      await clickAddFeedButtonAndNavigate(page);
      await expect(page).toHaveURL("/feed/create");
    });
    test("should not click create button before getting preview", async ({
      page,
    }) => {
      await page.goto("/");
      await clickAddFeedButtonAndNavigate(page);

      await expect(
        page.getByRole("button", { name: "Create Feed", exact: true }),
      ).toBeDisabled();

      await getPreview({ url: validFeedURL }, page);

      await expect(
        page.getByRole("button", { name: "Create Feed", exact: true }),
      ).not.toBeDisabled();
    });

    test("should not create a new feed with all empty fields", async ({
      page,
    }) => {
      await page.goto("/");
      await clickAddFeedButtonAndNavigate(page);
      await createFeed(
        {
          botToken: "",
          title: "",
          description: "",
          url: validFeedURL,
        },
        page,
      );
      await expect(
        page.getByText("Title is required", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText("Bot token is required", { exact: true }),
      ).toBeVisible();
    });

    test("should not create a new feed with invalid bot token", async ({
      page,
    }) => {
      await page.goto("/");
      await clickAddFeedButtonAndNavigate(page);
      await createFeed(
        {
          botToken: "1234567890",
          title: "Test Feed",
          description: "Test Description",
          url: validFeedURL,
        },
        page,
      );
      await expect(
        page.getByText(
          "Invalid bot token, not found, please check your bot token again",
          { exact: true },
        ),
      ).toBeVisible();

      await page.goto("/");
      await expect(page.getByText("Test Feed")).not.toBeVisible();
    });

    test("should create a new feed", async ({ page }) => {
      await page.goto("/");
      await clickAddFeedButtonAndNavigate(page);
      await createFeed(
        {
          botToken: TELEGRAM_TEST_BOT_TOKEN,
          title: "Test Feed",
          url: validFeedURL,
        },
        page,
      );

      await expect(
        page.getByText("Feed created successfully", { exact: true }),
      ).toBeVisible();

      await page.goto("/");
      await expect(page.getByText("Test Feed")).toBeVisible();
    });

    test("should create a new feed with custom keys", async ({ page }) => {
      await page.goto("/");
      await clickAddFeedButtonAndNavigate(page);
      await createFeed(
        {
          botToken: TELEGRAM_TEST_BOT_TOKEN,
          title: "Test Feed",
          url: validFeedURL,
          keys: [
            {
              id: "",
              key: "title",
              customKey: "Custom Title",
              replacements: [],
              isSelected: true,
            },
            {
              id: "",
              key: "isoDate",
              customKey: "",
              replacements: [
                {
                  id: "",
                  target: "T",
                  value: "@T@",
                },
                {
                  id: "",
                  target: "Z",
                  value: "@Z@",
                },
              ],
              isSelected: true,
            },
          ],
        },
        page,
      );

      await expect(
        page.getByText("Feed created successfully", { exact: true }),
      ).toBeVisible();

      await page.goto("/");
      await expect(page.getByText("Test Feed")).toBeVisible();
    });

    test("should update feed", async ({ page }) => {
      await page.goto("/");
      await clickAddFeedButtonAndNavigate(page);
      await createFeed(
        {
          botToken: TELEGRAM_TEST_BOT_TOKEN,
          title: "Test Feed 2",
          description: "Test Description",
          url: validFeedURL,
        },
        page,
      );

      // navigate back to / after feed created successfully, if not, newly created feed will not display
      await expect(
        page.getByText("Feed created successfully", { exact: true }),
      ).toBeVisible();
      await page.goto("/");
      await page.getByText("Test Feed 2").click();
      // wait for page to change /feed/random+id
      await page.waitForURL(/\/feed\/.+/);

      await page
        .getByRole("textbox", { name: "Title", exact: true })
        .fill("Updated Test Feed 2");
      await page.getByRole("button", { name: "Update feed" }).click();
      await expect(
        page.getByText("Feed updated successfully", { exact: true }),
      ).toBeVisible();

      await page.goto("/");
      await expect(page.getByText("Updated Test Feed 2")).toBeVisible();
    });

    test("should delete a feed and be redirected to /", async ({ page }) => {
      await page.goto("/");
      await clickAddFeedButtonAndNavigate(page);
      await createFeed(
        {
          botToken: TELEGRAM_TEST_BOT_TOKEN,
          title: "Test Feed To be Deleted",
          description: "Test Description",
          url: validFeedURL,
        },
        page,
      );

      // navigate back to / after feed created successfully, if not, newly created feed will not display
      await expect(
        page.getByText("Feed created successfully", { exact: true }),
      ).toBeVisible();
      await page.goto("/");
      await page.getByText("Test Feed To be Deleted").click();
      // wait for page to change /feed/random+id
      await page.waitForURL(/\/feed\/.+/);

      await page.getByRole("button", { name: "Delete Feed" }).click();
      await page.getByRole("button", { name: "Delete" }).click();
      await expect(
        page.getByText("Feed deleted successfully", { exact: true }),
      ).toBeVisible();

      //expect be redirected to /
      await page.waitForURL("/");
      expect(page.url()).not.toContain("/feed");
      await expect(page.getByText("Test Feed To be Deleted")).not.toBeVisible();
    });

    //test should fail if user create more than feed limit
    test("should fail if user create more than feed limit", async ({
      page,
    }) => {
      await page.goto("/");
      const feedLimit = Number(env.DEFAULT_FEED_LIMIT_PER_USER);

      // Assuming 3 feeds have already been created
      for (let i = 0; i < feedLimit; i++) {
        await clickAddFeedButtonAndNavigate(page);
        await createFeed(
          {
            botToken: TELEGRAM_TEST_BOT_TOKEN,
            title: `Test Feed ${i + 1}`,
            description: "Test Description",
            url: validFeedURL,
          },
          page,
        );

        // navigate back to / after feed created successfully, if not, newly created feed will not display
        await expect(
          page.getByText("Feed created successfully", { exact: true }),
        ).toBeVisible();
        await page.goto("/");
        await expect(page.getByText(`Test Feed ${i + 1}`)).toBeVisible();
      }

      // Attempt to create a feed beyond the limit
      await clickAddFeedButtonAndNavigate(page);
      await createFeed(
        {
          botToken: TELEGRAM_TEST_BOT_TOKEN,
          title: "Test Feed Beyond Limit",
          description: "Test Description",
          url: validFeedURL,
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

      await page.goto("/");
      await expect(page.getByText("Test Feed Beyond Limit")).not.toBeVisible();
    });
  });
});

async function clickAddFeedButtonAndNavigate(page: Page) {
  await page.getByRole("button", { name: "Add Feed", exact: true }).click();
  await page.waitForURL("/feed/create");
}

async function getPreview(
  { url }: { url: RouterInputs["feed"]["create"]["url"] },
  page: Page,
) {
  await page.getByRole("textbox", { name: "URL", exact: true }).fill(url);

  const listenResponsePromise = page.waitForResponse(
    (response) => response.url().includes("api/trpc/feed.getRemoteLatest"),
    { timeout: 15000 },
  );

  await page.getByRole("button", { name: "Get Preview" }).click();
  await listenResponsePromise;
}

async function fillTokenTitleDescription(
  feed: Omit<RouterInputs["feed"]["create"], "url" | "keys">,
  page: Page,
) {
  const { botToken, title, description } = feed;
  await page
    .getByRole("textbox", { name: "Telegram Bot Token", exact: true })
    .fill(botToken);
  await page.getByRole("textbox", { name: "Title", exact: true }).fill(title);

  if (description) {
    await page
      .getByRole("textbox", { name: "Description", exact: true })
      .fill(description);
  }
}

async function customizeKeys(
  keys: RouterInputs["feed"]["create"]["keys"],
  page: Page,
) {
  const KeysSection = page.locator('div:has(h3:has-text("Keys"))').first();

  for (const [, key] of keys.entries()) {
    const { customKey = "", replacements } = key;
    if (!customKey && (!replacements || replacements.length === 0)) {
      continue;
    }

    const keySection = KeysSection.getByRole("listitem").filter({
      hasText: `${key.key}Add Replace Target/Value`,
    });

    // Fill the custom key input
    if (customKey) {
      await keySection.getByLabel(key.key).fill(customKey);
    }

    // Fill the replacement fields
    if (replacements) {
      for (const [, replacement] of replacements.entries()) {
        //get button
        const addReplaceButtonbutton = keySection.getByRole("button", {
          name: "Add Replace Target/Value",
          exact: true,
        });
        await addReplaceButtonbutton.click();

        // Fill the replacement fields
        await keySection
          .getByPlaceholder("target")
          .first()
          .fill(replacement.target);
        await keySection
          .getByPlaceholder("value")
          .first()
          .fill(replacement.value);
      }
    }
  }
}

async function createFeed(
  feed: Omit<RouterInputs["feed"]["create"], "keys"> & {
    keys?: RouterInputs["feed"]["create"]["keys"];
  },
  page: Page,
) {
  const { botToken, title, description, url, keys } = feed;
  await getPreview({ url }, page);
  await fillTokenTitleDescription(
    {
      botToken,
      title,
      description,
    },
    page,
  );

  if (keys && keys.length > 0) {
    await customizeKeys(keys, page);
  }

  await page.getByRole("button", { name: "Create Feed", exact: true }).click();
}

async function clearFeeds() {
  await db.delete(feeds).where(eq(feeds.createdById, TEST_USER.id));
}
