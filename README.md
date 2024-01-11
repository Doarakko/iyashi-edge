# iyashi-edge

"iyashi" is a slack bot that randomly returns the pictures of animals you posted.

When you post a picture of an animal, it will be automatically classified and registered.

![example](./example.gif)

## What is "iyashi"

"iyashi" is a Japanese word meaning "soothing" or "healing" mentally and physically.

We need "iyashi", let's get "iyashi"!

## Requirements

- Slack
- Cloudflare
- wrangler CLI
- Microsoft Azure Custom Vision API

## Supported animals

- cat
  - にゃーん
  - ニャーン
- chinchilla
  - チンチラ
  - ちんちら
- dog
  - わんわん
  - ワンワン
- hedgehog
  - ハリネズミ
  - はりねずみ
- owl
  - フクロウ
  - ふくろう
  - ほーほー
  - ホーホー

Please create an issue if you have any animals you would like to see supported!

## Usage

1. Copy env file and enter your environment variables.

    ```shell
    cp .dev.vars.example .dev.vars
    ```

1. Create database and tables

    ```shell
    npx wrangler d1 create iyashi
    npx wrangler d1 execute iyashi --file=./schema.sql
    ```

1. Edit wrangler.toml

    ```toml
    [[d1_databases]]
    binding = "DB" # i.e. available in your Worker on env.DB
    database_name = "iyashi"
    database_id = "xxxx-yyyy-zzzz"
    ```

1. Deploy to Cloudflare

    ```shell
    wrangler deploy
    ```

1. Set environmental variables to Cloudflare

    ```shell
    wrangler secret put SLACK_BOT_TOKEN
    wrangler secret put SLACK_SIGNING_SECRET
    wrangler secret put ANIMAL_PREDICTION_API
    wrangler secret put ANIMAL_PREDICTION_API_KEY
    wrangler secret put IMAGE_UPLOADED_CHANNEL
    ```
