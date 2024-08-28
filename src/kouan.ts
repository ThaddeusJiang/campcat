// For more information, see https://crawlee.dev/
import { PlaywrightCrawler, ProxyConfiguration, Dataset } from "crawlee"
import { readFileSync } from "fs"
import path from "path"

import { send_message } from "./telegram"

const base_url = "https://kouan-motosuko.com/reserve/Reserve/input/?type=camp&ym="

function ymFormat(date: Date): string {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`
}

const now = new Date()

const months = []
months.push(ymFormat(now))
now.setDate(now.getDate() + 30)
months.push(ymFormat(now))
now.setDate(now.getDate() + 30)
months.push(ymFormat(now))

const startUrls = months.map((ym) => base_url + ym)

const crawler = new PlaywrightCrawler({
  // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
  async requestHandler({ page, request }) {
    // This function is called to extract data from a single web page
    // 'page' is an instance of Playwright.Page with page.goto(request.url) already called
    // 'request' is an instance of Request class with information about the page to load
    await page.waitForSelector(".table-responsive")

    const availableDays = await page.$$eval("tr > td:nth-child(7)", (days) => {
      return days
        .map((day) => {
          const dateStr = day.querySelector(".dateStr") as HTMLInputElement
          return dateStr?.value
        })
        .filter(Boolean)
    })

    const crawledAt = new Date().toLocaleString("ja-JP")

    await Dataset.pushData({
      title: await page.title(),
      url: request.url,
      // months,
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

async function getKouanDataset(
  filename: string
): Promise<{ title: string; url: string; availableDays: string[] } | null> {
  const __dirname = new URL(import.meta.url).pathname
  const resultStr = readFileSync(path.resolve(__dirname, `../../storage/datasets/kouan/${filename}`), "utf8")
  const { title, url, availableDays } = JSON.parse(resultStr)

  return availableDays.length ? { title, url, availableDays } : null
}

async function genKouanMessage() {
  const datasets = (await Promise.all([
    getKouanDataset("000000001.json"),
    getKouanDataset("000000002.json"),
    getKouanDataset("000000003.json"),
  ]).then((items) => items.filter(Boolean))) as {
    title: string
    url: string
    availableDays: string[]
  }[]

  const message = datasets.length
    ? [
        `浩庵キャンプ場（土曜日）`,
        `${datasets
          .map(({ availableDays, url }) => [availableDays.join("\n"), `予約：${url}`].join("\n\n"))
          .join("\n\n")}`,
      ].join("\n\n")
    : null

  return message
}

async function main() {
  await crawler.run(startUrls)
  const message = await genKouanMessage()
  if (message) {
    await send_message(message)
  } else {
    console.log("No available days, no message sent")
  }
}

main().catch(console.error)
