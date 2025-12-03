import "dotenv/config";
import { Telegraf } from "telegraf";
import { syncModels } from "./database/models";
import { eventView } from "./responses/eventView";
import { marketListView, marketView } from "./responses/marketView";
import { welcomeView } from "./responses/welcomeView";
import { generateCommentAnalysis } from "./services/ai";
import { deposit } from "./services/polygon-router";
import { getClobClient, getOpenOrders } from "./services/polymarket";
import {
  getEventById,
  getFromPolymarketUrl,
  getMarketById,
  getTrendingMarkets,
  searchMarkets,
} from "./services/polymarket-gamma";
import { BotContext, userCreator } from "./services/telegram";
import { PolymarketEvent } from "./types/polymarketEvent";
import { TELEGRAM_BOT_TOKEN } from "./utils/constants";
import { logger } from "./utils/logger";

const bot = new Telegraf<BotContext>(TELEGRAM_BOT_TOKEN || "");

bot.use(userCreator);
bot.start(async (ctx) => {
  logger.info(`User ${ctx.from?.id} started the bot.`);
  await welcomeView(ctx.user!, ctx);
});

const allowedTags = ["crypto", "politics", "sports"];
bot.command("trending", async (ctx) => {
  logger.info(`User ${ctx.from?.id} requested trending markets.`);
  const messageParts = ctx.text.split(" ");
  const tag = messageParts.length > 1 ? messageParts[1] : undefined;
  logger.info(`Fetching trending markets with tag: ${tag}`);
  const result = await getTrendingMarkets({ tag_slug: tag });
  await eventView(result, ctx);
});

bot.command("search", async (ctx) => {
  const result = await searchMarkets(ctx.text.replace("/search", "").trim());

  console.dir(result, { depth: null });
  if (!result || !result.events || result.events.length === 0) {
    await ctx.reply("No results found for your search query.");
    return;
  }
  await eventView(result.events as PolymarketEvent[], ctx);
  // await ctx.reply(`Search Results:\n${JSON.stringify(result, null, 2)}`);
});

bot.command("url", async (ctx) => {
  const url = ctx.text.replace("/url", "").trim();
  logger.info(`User ${ctx.from?.id} requested data from URL: ${url}`);
  try {
    const result = await getFromPolymarketUrl(url);
    if (result.type === "event") {
      await marketListView(result.data as PolymarketEvent, ctx);
    } else if (result.type === "market") {
      await marketView(result.data, ctx);
    }
  } catch (error) {
    await ctx.reply(
      "There was an error processing the URL. Please ensure it is a valid Polymarket event or market URL."
    );
  }
});

bot.command("fund", async (ctx) => {
  if (!ctx.user) {
    await ctx.reply("User not found. Please start the bot again.");
    return;
  }
  logger.info(`User ${ctx.from?.id} requested funding info.`);

  await deposit(ctx);
});

bot.action(/trending_page_(.*)/, async (ctx) => {
  const offset = parseInt(ctx.match[1], 10) || 0;
  logger.info(
    `User ${ctx.from?.id} requested trending markets page with offset ${offset}.`
  );
  await ctx.answerCbQuery(); // Acknowledge the button press
  const result = await getTrendingMarkets({ offset });
  await eventView(result, ctx);
});

bot.action(/view_event_(.+)/, async (ctx) => {
  const eventId = ctx.match[1];
  logger.info(`User ${ctx.from?.id} requested to view event ${eventId}.`);
  await ctx.answerCbQuery(); // Acknowledge the button press
  const event = await getEventById(eventId);
  await marketListView(event, ctx);
});

bot.action(/view_market_(.+)/, async (ctx) => {
  const marketId = ctx.match[1];
  logger.info(`User ${ctx.from?.id} requested to view market ${marketId}.`);
  await ctx.answerCbQuery(); // Acknowledge the button press
  const market = await getMarketById(marketId);
  if (market) {
    await marketView(market, ctx);
  }
});

bot.action(/analyze_event_(.+)/, async (ctx) => {
  const eventId = ctx.match[1];
  logger.info(`User ${ctx.from?.id} requested analysis for event ${eventId}.`);
  await ctx.answerCbQuery(); // Acknowledge the button press

  const analysis = await generateCommentAnalysis(Number(eventId), "Series");
  await ctx.reply(`*🧠 AI Analysis:*\n\n${analysis}`, {
    parse_mode: "MarkdownV2",
  });
});

(async () => {
  // Any async initialization logic can go here
  await syncModels();
  await getClobClient();
  await getOpenOrders();
  await bot.launch();

  logger.info("Started telegram bot.");
})();
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
