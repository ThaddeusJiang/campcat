import * as dotenv from "dotenv";
dotenv.config();

import TelegramBot from "node-telegram-bot-api";
import { readFileSync } from "fs";
import path from "path";
import fetch from "node-fetch";

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(token);

const __dirname = new URL(import.meta.url).pathname;

const getChatIds = async () => {
  const url = `https://api.telegram.org/bot${token}/getUpdates`;

  const chatIds = await fetch(url)
    .then((res) => res.json())
    .then((res) => {
      const { result } = res;
      return result.map((item) => item.message.chat.id);
    });
  return Array.from(new Set(chatIds));
};

async function main() {
  try {
    const result = readFileSync(path.resolve(__dirname, "../../storage/datasets/default/000000001.json"), "utf8");
    const { availableDays } = JSON.parse(result);
    const total = availableDays.length;
    if (total) {
      const chatIds = await getChatIds();
      chatIds.forEach((chatId) => bot.sendMessage(chatId, result));
      console.log(`There are ${total} days available for booking, and it has been sent to ${chatIds.length} clients!!!`);
    } else {
      console.log("No available days, no message sent");
    }
  } catch (err) {
    console.error(err);
  }
}

await main();
