import { Markup } from "telegraf";
import { BotContext } from "../services/telegram";
import { PolymarketEvent } from "../types/polymarketEvent";

const eventViewMessage = (events: PolymarketEvent[]) =>
  events
    .map(
      (event, index) => `${index + 1}. <b>${event.title}</b>
📊 Volume: $${event.volume}
⏰ Ends: ${new Date(event.endDate).toDateString()}
Open in browser: <a href="https://polymarket.com/event/${event.slug}">View</a>`
    )
    .join("\n\n");

export async function eventView(event: PolymarketEvent[], ctx: BotContext) {
  try {
    const messageText = eventViewMessage(event);
    // 2 rows, 4 buttons per row
    const inlineKeyboard = [
      event
        .slice(0, 4)
        .map((e, idx) =>
          Markup.button.callback(`#${idx + 1}`, `view_event_${e.id}`)
        ),
      event
        .slice(4, 8)
        .map((e, idx) =>
          Markup.button.callback(`#${idx + 5}`, `view_event_${e.id}`)
        ),
    ];

    await ctx.reply(messageText, {
      parse_mode: "HTML",
      reply_markup: Markup.inlineKeyboard(inlineKeyboard).reply_markup,
    });
  } catch (error) {
    console.error("Error sending market view:", error);
    throw error;
  }
}
