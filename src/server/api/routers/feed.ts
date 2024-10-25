import { TRPCError } from "@trpc/server";
import axios, { AxiosError } from "axios";
import { and, asc, count, desc, eq, gt, or, sql } from "drizzle-orm";
import { z } from "zod";

import { env } from "~/env";
import { decryptToken, encryptToken } from "~/lib/encrypt-decrypt-token";
import { formatFeedNestedValue } from "~/lib/format-feed-nested-value";
import { getFeedNestedValue } from "~/lib/get-feed-nested-value";
import { getRemoteLatestFeed } from "~/lib/get-remote-latest-feed";
import { telegramBotSendMessage } from "~/lib/telegram-bot-send-message";
import {
  createTRPCRouter,
  protectedProcedure,
  protectedProcedureWithCronToken,
} from "~/server/api/trpc";
import { feeds, users } from "~/server/db/schema";
import { createCaller } from "../root";
import { feedCreateSchema, feedUpdateSchema, keySchema } from "../schema/feed";

export const feedRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return await ctx.db
      .select()
      .from(feeds)
      .where(eq(feeds.createdById, userId))
      .orderBy(desc(feeds.updatedAt))
      .limit(10);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const feed = await ctx.db.query.feeds.findFirst({
        where: and(eq(feeds.id, input.id), eq(feeds.createdById, userId)),
      });

      if (!feed) {
        throw new Error("Feed not found or you do not have access to it");
      }

      // Validate the keys field for inferring type as jsonb
      const validatedFeed = {
        ...feed,
        keys: z.array(keySchema).parse(feed.keys),
      };

      return validatedFeed;
    }),

  create: protectedProcedure
    .input(feedCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
          feedLimit: true,
        },
      });

      const feedLimit =
        user?.feedLimit ?? Number(env.DEFAULT_FEED_LIMIT_PER_USER);

      // Check the number of existing feeds for the user
      const [userFeedsCount] = await ctx.db
        .select({ count: count() })
        .from(feeds)
        .where(eq(feeds.createdById, userId));

      if (userFeedsCount?.count && userFeedsCount.count >= feedLimit) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You have reached the maximum limit of ${feedLimit} feeds.`,
        });
      }

      // get chat id
      const exampleResponse = {
        ok: true,
        result: [
          {
            update_id: 698239692,
            message: {
              message_id: 67,
              from: {
                id: 5496724674,
                is_bot: false,
                first_name: "宜睿",
                last_name: "蔡",
                username: "rayyo999",
                language_code: "en",
              },
              chat: {
                id: 5496724674,
                first_name: "宜睿",
                last_name: "蔡",
                username: "rayyo999",
                type: "private",
              },
              date: 1755708866,
              text: "R",
            },
          },
          {
            update_id: 698239693,
            message: {
              message_id: 68,
              from: {
                id: 5496724674,
                is_bot: false,
                first_name: "宜睿",
                last_name: "蔡",
                username: "rayyo999",
                language_code: "en",
              },
              chat: {
                id: 5496724674,
                first_name: "宜睿",
                last_name: "蔡",
                username: "rayyo999",
                type: "private",
              },
              date: 1725758929,
              text: "W",
            },
          },
        ],
      };
      type TelegramResponse = typeof exampleResponse;

      let chatId: string | undefined;
      try {
        const { data } = await axios.get<TelegramResponse>(
          `${env.TELEGRAM_API_URL}/bot${input.botToken}/getUpdates`,
        );
        chatId = data.result[0]?.message.chat.id.toString();
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            throw new Error(
              "Invalid bot token, unauthorized, please check your bot token again",
            );
          }
          if (error.response?.status === 404) {
            throw new Error(
              "Invalid bot token, not found, please check your bot token again",
            );
          }
        }
        throw new Error("Failed to get chat id", { cause: error });
      }

      if (!chatId) {
        throw new Error(
          "Failed to get chat id, make sure you have send random message to the chat first!",
        );
      }

      // check db success
      // const result = await ctx.db.insert(feeds).values({
      //   title: input.title,
      //   description: input.description,
      //   url: input.url,
      //   createdById: ctx.session.user.id,
      //   shouldNotify: input.shouldNotify,
      //   botToken: encryptToken(input.botToken), // Store the encrypted token
      //   chatId: encryptToken(chatId), // Store the encrypted chat id
      //   selectedKeys: input.keys,
      // });
      const result = await ctx.db.insert(feeds).values({
        ...input,
        createdById: ctx.session.user.id,
        botToken: encryptToken(input.botToken), // Store the encrypted token
        chatId: encryptToken(chatId), // Store the encrypted chat id
      });

      //if success, send message to telegram
      if (result) {
        const caller = createCaller(ctx);
        await caller.feed.sendMessage({
          type: "NOT_COUNT",
          botToken: input.botToken,
          chatId,
          message: `Hey ${ctx.session.user.name}, you have successfully created a feed notification: \n\nTitle: ${input.title}\nDescription: ${input.description}\nURL: ${input.url}`,
        });
      }

      return result;
    }),

  update: protectedProcedure
    .input(feedUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      // get feed
      const feed = await ctx.db.query.feeds.findFirst({
        where: eq(feeds.id, id),
      });
      if (!feed) {
        throw new Error("Feed not found");
      }
      const botToken = decryptToken(feed.botToken);
      const chatId = decryptToken(feed.chatId);

      const caller = createCaller(ctx);
      await caller.feed.sendMessage({
        type: "NOT_COUNT",
        botToken,
        chatId,
        message: `Hey ${ctx.session.user.name}, you have successfully updated a feed notification: \n\nTitle: ${input.title}\nDescription: ${input.description}\nURL: ${input.url}\nReceive notification: ${input.shouldNotify ? "on" : "off"}`,
      });
      return await ctx.db
        .update(feeds)
        .set({
          ...updateData,
        })
        .where(eq(feeds.id, id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const feed = await ctx.db.query.feeds.findFirst({
        where: and(eq(feeds.id, input.id), eq(feeds.createdById, userId)),
      });

      if (!feed) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Feed not found or you do not have permission to delete it",
        });
      }

      await ctx.db.delete(feeds).where(eq(feeds.id, input.id));

      return { success: true };
    }),

  sendMessage: protectedProcedure
    .input(
      z.discriminatedUnion("type", [
        z.object({
          type: z.literal("COUNT"),
          id: z.string(),
          botToken: z.string(),
          chatId: z.string(),
          message: z.string(),
        }),
        z.object({
          type: z.literal("NOT_COUNT"),
          botToken: z.string(),
          chatId: z.string(),
          message: z.string(),
        }),
      ]),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await telegramBotSendMessage(input);
      if (!result) {
        throw new Error("Failed to send message");
      }

      if (input.type === "COUNT") {
        await ctx.db
          .update(feeds)
          .set({
            lastNotifiedAt: new Date(),
            totalNotified: sql`${feeds.totalNotified} + 1`,
          })
          .where(eq(feeds.id, input.id));
      }
    }),

  getRemoteLatest: protectedProcedure
    .input(z.object({ url: z.string() }))
    .query(async ({ input }) => {
      return await getRemoteLatestFeed(input.url);
    }),

  compareAndNotify: protectedProcedureWithCronToken.mutation(
    async ({ ctx }) => {
      let processedCount = 0;
      let updatedCount = 0;
      let errorCount = 0;

      try {
        const pageSize = 100; // Adjust based on your needs
        let cursor: { id: string; createdAt: Date } | undefined;

        while (true) {
          const feedBatch = await ctx.db
            .select()
            .from(feeds)
            .where(
              and(
                eq(feeds.shouldNotify, true),
                cursor
                  ? or(
                      gt(feeds.createdAt, cursor.createdAt),
                      and(
                        eq(feeds.createdAt, cursor.createdAt),
                        gt(feeds.id, cursor.id),
                      ),
                    )
                  : undefined,
              ),
            )
            .orderBy(asc(feeds.createdAt), asc(feeds.id))
            .limit(pageSize);

          if (feedBatch.length === 0) break;

          for (const feed of feedBatch) {
            processedCount++;
            try {
              const remoteLatestFeed = await getRemoteLatestFeed(feed.url);

              if (!remoteLatestFeed) {
                console.error(`Failed to fetch remote feed for ${feed.url}`);
                continue;
              }

              if (!remoteLatestFeed.pubDate) {
                console.error(
                  `Failed to fetch remote feed for ${feed.url}, no pubDate`,
                );
                continue;
              }

              const isNewContent = checkIsSameFeed(feed, remoteLatestFeed);

              if (!isNewContent) {
                console.log(
                  `No new content for ${feed.id}(title:${feed.title}), skip sending notification`,
                );
                continue;
              }

              // Construct the message based on selected keys
              const parsedKeys = z.array(keySchema).parse(feed.keys);
              const selectedKeys = parsedKeys.filter((key) => key.isSelected);
              const messageContent = selectedKeys
                .map(({ key, customKey, replacements }) => {
                  const value = getFeedNestedValue(remoteLatestFeed, key);
                  const formattedValue = formatFeedNestedValue(
                    value,
                    replacements,
                  );

                  return `${customKey ?? key} : ${formattedValue}`;
                })
                .join("\n\n");

              const message = `New content for ${feed.title}:\n\n${messageContent}`;

              // Send notification
              const result = await telegramBotSendMessage({
                botToken: decryptToken(feed.botToken),
                chatId: decryptToken(feed.chatId),
                message,
              });

              if (!result) {
                console.error(`Failed to send message for ${feed.title}`);
                continue;
              }

              // Update feed in database
              await ctx.db
                .update(feeds)
                .set({
                  prevFeedPublishedAt: new Date(remoteLatestFeed.pubDate),
                  prevFeedTitle: remoteLatestFeed.title,
                  prevFeedLink: remoteLatestFeed.link,
                  lastNotifiedAt: new Date(),
                  totalNotified: sql`${feeds.totalNotified} + 1`,
                })
                .where(eq(feeds.id, feed.id));

              updatedCount++;
            } catch (error) {
              console.error(`Error feed ${feed.id}:`, error);
              errorCount++;
            }
          }

          return {
            message: "Cron job completed",
            processedCount,
            updatedCount,
            errorCount,
          };
        }
      } catch (error) {
        console.error("Cron job failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process feeds",
        });
      }
    },
  ),
});

function checkIsSameFeed(
  oldFeed: typeof feeds.$inferSelect,
  newFeed: NonNullable<Awaited<ReturnType<typeof getRemoteLatestFeed>>>,
) {
  return (
    !oldFeed.prevFeedPublishedAt ||
    new Date(newFeed.pubDate!) > newFeed.prevFeedPublishedAt ||
    newFeed.title !== oldFeed.prevFeedTitle ||
    newFeed.link !== oldFeed.prevFeedLink
  );
}
