// For more information, see https://crawlee.dev/
import { PlaywrightCrawler, ProxyConfiguration, Dataset } from "crawlee"
import { readFileSync } from "fs"
import path from "path"
import { send_message } from "./telegram"

const startUrls = ["https://reserve.fumotoppara.net/reserved/reserved-calendar-list"]

const crawler = new PlaywrightCrawler({
  // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
  async requestHandler({ page, request }) {
    // This function is called to extract data from a single web page
    // 'page' is an instance of Playwright.Page with page.goto(request.url) already called
    // 'request' is an instance of Request class with information about the page to load
    await page.waitForSelector(".calendar-table")

    const months = await page.$$eval(".month-button", (buttons) => {
      return buttons.map((button) => button.textContent)
    })

    const days = await page.$$eval(
      "div.calendar-area > div.calendar-frame > table > thead > tr > .cell-date",
      (days) => {
        return days.map((day) => {
          const labels = Array.from(day.querySelectorAll("p"))
          return labels.map((label) => label.textContent?.trim())
        })
      }
    )

    const values = await page.$$eval(
      "div.calendar-area > div.calendar-frame > table > tbody > tr:nth-child(2) > td",
      (days) => {
        return days.map((day) => {
          const labels = Array.from(day.querySelectorAll("p"))
          return labels.map((label) => label.textContent?.trim())
        })
      }
    )

    function getDayOfWeekIndexes(days: (string | undefined)[][], targetDays: string[]) {
      const indexes = days
        .map(([day, dayOfWeek], index) => {
          return targetDays.includes(dayOfWeek ?? "") ? { day, index, dayOfWeek } : undefined
        })
        .filter((item) => item !== undefined) as { day: string; index: number; dayOfWeek: string }[]

      return indexes
    }

    const saturdays = getDayOfWeekIndexes(days, ["土"])

    const availableDays = saturdays
      .map(({ day, index, dayOfWeek }) => {
        const [value] = values[index] as string[]
        return ["△", "〇"].includes(value ?? "") ? { day, dayOfWeek } : undefined
      })
      .filter((item) => item !== undefined)

    const crawledAt = new Date().toLocaleString("ja-JP")

    await Dataset.pushData({
      title: await page.title(),
      url: request.url,
      months,
      availableDays,
      crawledAt,
    })
  },
  async failedRequestHandler({ request }) {
    // This function is called when the crawling of a request failed too many times
    await Dataset.pushData({
      url: request.url,
      succeeded: false,
      errors: request.errorMessages,
    })
  },
  // headless: false,
})

await crawler.run(startUrls)

async function genFumotoMessage() {
  const __dirname = new URL(import.meta.url).pathname
  const resultStr = readFileSync(path.resolve(__dirname, "../../storage/datasets/fumoto/000000001.json"), "utf8")
  const { availableDays, url } = JSON.parse(resultStr) as {
    title: string
    url: string
    availableDays: { day: string; dayOfWeek: string }[]
  }

  const message = availableDays.length
    ? [
        `ふもとっぱらキャンプ場（土曜日）`,
        `${availableDays.map(({ day, dayOfWeek }) => `${day} (${dayOfWeek})`).join("\n")}`,
        `予約: ${url}`,
      ].join("\n\n")
    : null

  return message
}

async function main() {
  await crawler.run(startUrls)
  const message = await genFumotoMessage()
  if (message) {
    await send_message(message)
  } else {
    console.log("No available days, no message sent")
  }
}

main().catch(console.error)
