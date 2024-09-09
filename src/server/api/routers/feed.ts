import axios, { AxiosError } from "axios";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { env } from "~/env";
import { decryptToken, encryptToken } from "~/lib/encrypt-decrypt-token";
import { telegramBotSendMessage } from "~/lib/telegram-bot-send-message";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { feeds } from "~/server/db/schema";
import { createCaller } from "../root";
import { feedCreateSchema, feedUpdateSchema } from "../schema/feed";

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

      return feed;
    }),

  create: protectedProcedure
    .input(feedCreateSchema)
    .mutation(async ({ ctx, input }) => {
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
      const result = await ctx.db.insert(feeds).values({
        title: input.title,
        description: input.description,
        url: input.url,
        createdById: ctx.session.user.id,
        shouldNotify: input.shouldNotify,
        botToken: encryptToken(input.botToken), // Store the encrypted token
        chatId: encryptToken(chatId), // Store the encrypted chat id
      });
      //how to get the id of the feed

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
});
