import * as dotenv from "dotenv"
dotenv.config()

import TelegramBot from "node-telegram-bot-api"
import { readFileSync } from "fs"
import path from "path"
import fetch from "node-fetch"

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_TOKEN

const bot = new TelegramBot(token)

const __dirname = new URL(import.meta.url).pathname

const getChatIds = async () => {
  const url = `https://api.telegram.org/bot${token}/getUpdates`

  const chatIds = await fetch(url)
    .then((res) => res.json())
    .then((res) => {
      const { result } = res
      return result.map((item) => item.message.chat.id)
    })
  return Array.from(new Set(chatIds))
}

async function main() {
  try {
    const resultStr = readFileSync(path.resolve(__dirname, "../../storage/datasets/default/000000001.json"), "utf8")
    const { months, availableDays, url } = JSON.parse(resultStr)

    const message = availableDays.length
      ? [
          `The available days:`,
          `${availableDays.map(({ day, dayOfWeek }) => `${day} (${dayOfWeek})`).join("\n")}`,
          `Book: ${url}`,
        ].join("\n\n")
      : null

    if (message) {
      const chatIds = await getChatIds()
      chatIds.forEach((chatId) => bot.sendMessage(chatId, message))
      console.log(`Has sent to ${chatIds.length} clients!!!`)
    } else {
      console.log("No available days, no message sent")
    }
  } catch (err) {
    console.error(err)
  }
}

await main()
