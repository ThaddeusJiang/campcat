# Camp Cat

[![License: GPL--3.0](https://img.shields.io/badge/License-GPL--3.0-yellow.svg)](#)
[![Twitter: ThaddeusJiang](https://img.shields.io/twitter/follow/ThaddeusJiang.svg?style=social)](https://twitter.com/ThaddeusJiang)

> Crawl camp sites and alert the available Saturdays.

source:
![fumotoppara-calendar](./docs/fumotoppara-calendar.png)

to:
![telegram-text](./docs/telegram-text.png)

## Usage

Send a message to https://t.me/campcatbot, wait for the available days of [ふもとっぱらキャンプ宿泊](https://reserve.fumotoppara.net/reserved/reserved-calendar-list).

<details>
<summary>
Scan QRCode
</summary>

![campcatbot QRCode](./docs/campcatbot.JPG)

</details>

## Install

```sh
npm install
```

## Usage

```
npm start
```

## Telegram Integration

```
export TELEGRAM_TOKEN=<token>

npm run send:telegram
```

## Scheduled Runner

[GitHub Actions](.github/workflows/telegram.yml)

## Author

👤 **Thaddeus Jiang**

- Website: https://thaddeusjiang.com/
- Twitter: [@ThaddeusJiang](https://twitter.com/ThaddeusJiang)
- Github: [@ThaddeusJiang](https://github.com/ThaddeusJiang)

## Show your support

Give a ⭐️ if this project helped you!

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
