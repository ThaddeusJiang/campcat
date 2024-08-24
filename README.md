# Camp Cat

ふもとっぱらキャンプ場には土曜日に空いていますか？

[![License: GPL--3.0](https://img.shields.io/badge/License-GPL--3.0-yellow.svg)](./License.md)

予約カレンダー

![fumotoppara-calendar](./docs/fumotoppara-calendar.png)

監視ロボット

![telegram-text](./docs/telegram-text.png)

## Usage

1. Send a message to https://t.me/campcatbot
2. Just wait for the available days

![campcatbot QRCode](./docs/campcatbot.JPG)

## Develop

install

```sh
npm install
```

crawl

```
npm start
```

send message to telegram

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

## Refs

- https://reserve.fumotoppara.net/reserved/reserved-calendar-list
