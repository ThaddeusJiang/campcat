import * as dotenv from "dotenv"
dotenv.config()

import TelegramBot from "node-telegram-bot-api"
import fetch from "node-fetch"

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_TOKEN!
const bot = new TelegramBot(token)

const getChatIds = async () => {
  const url = `https://api.telegram.org/bot${token}/getUpdates`

  type GetUpdatesResponse = {
    result: {
      message?: { chat: { id: number } }
      channel_post?: { chat: { id: number } }
    }[]
  }
  const chatIds = await fetch(url)
    .then((res) => res.json())
    .then((res) => {
      const result = (res as GetUpdatesResponse).result as {
        message?: { chat: { id: number } }
        channel_post?: { chat: { id: number } }
      }[]
      return result.map((item: { message?: { chat: { id: number } }; channel_post?: { chat: { id: number } } }) => {
        if (item.message) {
          return item.message.chat.id
        }
        if (item.channel_post) {
          return item.channel_post.chat.id
        }
        return null
      })
    })
  return Array.from(new Set(chatIds)).filter(Boolean) as number[]
}

export async function send_message(message: string) {
  try {
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
