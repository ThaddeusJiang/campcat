// For more information, see https://crawlee.dev/
import { PlaywrightCrawler, ProxyConfiguration, Dataset } from 'crawlee';

const startUrls = ['https://reserve.fumotoppara.net/reserved/reserved-calendar-list'];

const crawler = new PlaywrightCrawler({
  // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
  async requestHandler({ page, request }) {
    // This function is called to extract data from a single web page
    // 'page' is an instance of Playwright.Page with page.goto(request.url) already called
    // 'request' is an instance of Request class with information about the page to load
    await page.waitForSelector('.calendar-table');

    const months = await page.$$eval('.month-button', (buttons) => {
      return buttons.map((button) => button.textContent);
    });

    const days = await page.$$eval(
      '.el-table__fixed-header-wrapper > .el-table__header > thead > tr > th > .cell',
      (days) => {
        return days.map((day) => {
          const labels = Array.from(day.querySelectorAll('label'));
          return labels.map((label) => label.textContent?.trim());
        });
      }
    );

    const saturdays = days
      .map(([day, dayOfWeek], index) => {
        return dayOfWeek === '土' ? { day, index } : undefined;
      })
      .filter((item) => item !== undefined) as { day: string; index: number }[];

    // values
    const values = await page.$$eval('table.el-table__body > tbody > tr:nth-child(2) > td', (days) => {
      return days.map((day) => {
        const labels = Array.from(day.querySelectorAll('label'));
        return labels.map((label) => label.textContent?.trim());
      });
    });

    const availableDays = saturdays
      .map(({ day, index }) => {
        const [value] = values[index];
        return ['△', '〇'].includes(value ?? '') ? { day } : undefined;
      })
      .filter((item) => item !== undefined);

    const crawledAt = new Date().toLocaleString('ja-JP');

    console.log(availableDays);

    await Dataset.pushData({
      title: await page.title(),
      url: request.url,
      months,
      availableDays,
      crawledAt,
    });
  },
  async failedRequestHandler({ request }) {
    // This function is called when the crawling of a request failed too many times
    await Dataset.pushData({
      url: request.url,
      succeeded: false,
      errors: request.errorMessages,
    });
  },
  // headless: false,
});

await crawler.run(startUrls);
