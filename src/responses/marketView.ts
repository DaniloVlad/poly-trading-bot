import { Markup } from "telegraf";
import { BotContext } from "../services/telegram";
import { PolymarketEvent, PolymarketMarket } from "../types/polymarketEvent";

const marketViewMessage = (market: PolymarketMarket) => `
<b>${market.question}</b>

📊 Volume: $${market.volume}
⏰ Ends: ${new Date(market.endDate).toDateString()}

Description:
${
  market.description.length > 500
    ? market.description.slice(0, 500) + "..."
    : market.description
}
`;

export async function marketListView(event: PolymarketEvent, ctx: BotContext) {
  try {
    let count = 1;
    const markets = event.markets;

    const text = `📌<b>${event.title}</b>
📊 Volume: $${event.volume}
⏰ Ends: ${new Date(event.endDate).toDateString()}

The list of available markets is below. Press the button to view details and place a bet!
`;
    const inlineKeyboard = [
      ...markets.map((market) => [
        Markup.button.callback(
          `${market.question}`,
          `view_market_${market.id}`
        ),
      ]),
    ];

    if (event && event.series && event.series.length > 0) {
      const analysisId = event.series[0]?.id || "";
      if (analysisId) {
        inlineKeyboard.unshift([
          Markup.button.callback(
            "AI Sentiment Analysis",
            `analyze_event_${analysisId}`
          ),
        ]);
      }
    }
    await ctx.reply(text, {
      parse_mode: "HTML",
      reply_markup: Markup.inlineKeyboard(inlineKeyboard).reply_markup,
    });
  } catch (error) {
    console.error("Error sending market view:", error);
    await ctx.reply("There was an error displaying the market list.");
  }
}

export async function marketView(market: PolymarketMarket, ctx: BotContext) {
  try {
    const outcomes = JSON.parse(market.outcomes) as string[];
    const outcomePrices = JSON.parse(market.outcomePrices) as string[];
    await ctx.replyWithPhoto(market.image, {
      caption: marketViewMessage(market),
      parse_mode: "HTML",
      reply_markup: Markup.inlineKeyboard([
        outcomes.map((outcome, index) =>
          Markup.button.callback(
            `${outcome} - $${outcomePrices[index]}`,
            `bet_${market.id}_${outcome}`
          )
        ),
      ]).reply_markup,
    });
  } catch (error) {
    console.error("Error sending market view:", error);
    await ctx.reply("There was an error displaying the market details.");
  }
}
