import * as dotenv from "dotenv";
dotenv.config();

import TelegramBot from "node-telegram-bot-api";
import { readFileSync } from "fs";
import path from "path";

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_TOKEN;
const to = process.env.TELEGRAM_TO;

const bot = new TelegramBot(token);

const __dirname = new URL(import.meta.url).pathname;

function main() {
  try {
    const data = readFileSync(path.resolve(__dirname, "../../storage/datasets/default/000000001.json"), "utf8");
    bot.sendMessage(to, data);
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

main();
