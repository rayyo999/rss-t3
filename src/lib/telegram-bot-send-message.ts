import { createTelegramBot } from "./create-telegram-bot";

export async function telegramBotSendMessage({
  botToken,
  chatId,
  message,
}: {
  botToken: string;
  chatId: string;
  message: string;
}) {
  try {
    const bot = createTelegramBot(botToken);
    return await bot.sendMessage(chatId, message);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to send message", { cause: error });
  }
}
