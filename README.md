# RSS Feed Creator with Telegram Integration

This project is an RSS feed creator that integrates with Telegram, allowing users to customize and receive feeds directly in their Telegram app. The application is built on top of the [T3 Stack](https://create.t3.gg/), which includes Next.js, Tailwind CSS, Shadcn UI, react-hook-form, tRPC, zod, Drizzle ORM, PostgreSQL and Docker.

## Features

- **Telegram Integration**: Users can create a Telegram bot and input the bot token to receive customized RSS feeds.
- **Feed Customization**: Users can select specific keys from the feed to customize the content they receive.
- **Real-time Notifications**: The system sends notifications to the user's Telegram when new feed items are available.

## Technologies Used

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn UI](https://ui.shadcn.com)
- [react-hook-form](https://react-hook-form.com)
- [zod](https://zod.dev/)
- [tRPC](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [Docker](https://www.docker.com/)
- [Node Telegram Bot API](https://github.com/yagop/node-telegram-bot-api)
- [Ngrok](https://ngrok.com/)

## Getting Started

### Prerequisites

- Node.js
- Docker
- Telegram Bot and its API Token
- [ngrok](https://ngrok.com/) (for local development with Telegram)

### Creating Telegram Bot API Token for Login

To enable Telegram login functionality, you need to create a Telegram bot for this application and obtain an API token. Follow these steps:

1. **Open Telegram and search for BotFather**: BotFather is the official bot for managing Telegram bots.

2. **Start a chat with BotFather**: Click on the "Start" button or type `/start` to begin the conversation.

3. **Create a new bot**: Type `/newbot` and follow the instructions to set a name and username for your bot. The username must end with "bot" (e.g., `my_rss_feed_login_bot`).

4. **Obtain the API token**: After creating the bot, BotFather will provide you with an API token. This token is required for your application to interact with the Telegram API.

5. **Store the API token securely**: Add the API token to your `.env` file as `TELEGRAM_BOT_TOKEN`.

### Setting Up ngrok

To facilitate local development and testing with Telegram, this project uses ngrok to expose your local server to the internet. This allows Telegram to communicate with your local development environment.

1. Follow the [ngrok quickstart guide](https://ngrok.com/docs/getting-started/) to install and setup the ngrok CLI.

2. After completing ngrok account setup, start ngrok to expose your local server:

   ```bash
   ngrok http 3000
   ```

3. Copy the forwarding URL provided by ngrok (e.g., `https://7ac7-2ad2-8084-6121-1781-f40b-ca25-78b7-77ff.ngrok-free.app`).

4. Linking your domain to the telegram bot

   1. Send the `/setdomain` command to @Botfather
   2. Select the bot you just created (e.g., `@my_rss_feed_login_bot`)
   3. Paste the ngrok URL (e.g., `https://7ac7-2ad2-8084-6121-1781-f40b-ca25-78b7-77ff.ngrok-free.app`) into the `URL` field.

5. Ensure that your `.env` file is updated with the ngrok URL if required by your application configuration.

By following these steps, you can test Telegram integration locally without deploying your application to a live server.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/rss-feed-creator.git
   cd rss-feed-creator
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   Create a `.env` file in the root directory and add your environment variables. Refer to `.env.example` for the required variables.

   ```bash
   cp .env.example .env
   ```

   configure the `.env` file with your own values.

   replace `http://localhost:3000` with the ngrok url in the `.env` file.
   make sure to update the `NEXTAUTH_URL` with the ngrok url.
   TELEGRAM_BOT_TOKEN is the token you got from telegram bot.
   TELEGRAM_BOT_USERNAME is the username of the telegram bot.
   TELEGRAM_TEST_BOT_TOKEN is recommended to create a new bot for testing, but if you are lazy, you can use the same bot token as the login bot.

4. Start the database container

   ```bash
   ./start-database.sh
   ```

5. Initialize the database

   ```bash
   pnpm db:push
   ```

6. Run the development server:

   ```bash
   pnpm dev
   ```

7. Open the link you get from the ngrok and paste it in your browser to see the application.

## Usage

1. **Create a new Telegram Bot**: Use [BotFather](https://core.telegram.org/bots#botfather) to create a new bot and obtain the bot token. Not the same as login bot or test bot. (e.g., `my_rss_feed_bot`)

2. **Send a random message to the bot**: To enable the app to send messages to the bot, we need the chat ID and bot token. Simply send any random message to the bot in the chat room. This will allow the app to retrieve the chat ID using the bot token, without needing to manually find the chat ID from the Telegram API.

3. **Input Bot Token**: Enter the bot token in the application.

4. **Enter Feed URL**: Enter the feed url in the application and click on `Preview`.

5. **Customize Feed**: Select the keys you want to include in your feed notifications. You can also add some replacements for the values.

6. **Add Feed**: Click on `Create Feed` to save the feed.

7. **Receive Notifications**: Once set up, you can manually trigger the endpoint `/api/cron` to simulate the cron job with proper `X-Cron-Token` in the request header, value should be identical to `CRON_TOKEN` in `.env`.

## Deployment

Follow the deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify), and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
