import TelegramBot from "node-telegram-bot-api";

export function createTelegramBot(
  token: string,
  options?: TelegramBot.ConstructorOptions,
): TelegramBot {
  return new TelegramBot(token, options);
}
