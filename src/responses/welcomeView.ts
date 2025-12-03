import { User } from "../database/models";
import { getUserBalance } from "../services/polygon-router";
import { BotContext } from "../services/telegram";

const welcomeMessage = (user: User, balance: number) => `
Welcome to PolyBot - Trade on Polymarket with ease! 🎯

To get started, please fund your wallet using the /fund command.

💡 Quick Trading Tips:
• Use /search <string> to search for any markets (e.g., 'Trump', 'Bitcoin', 'NBA Finals')
• Use /trending to browse popular markets. Optionally add a keyword to filter (e.g., /trending crypto)
• Use /url <polymarket_url> to fetch a market or event directly from Polymarket

Your Polygon wallet address: ${user.ethAddress}
Your Solana wallet address: ${user.solAddress} (coming soon!)

To start trading:
1. Fund your Polygon wallet with POL
2. Use /fund to swap POL to USDC for trading and deposit into PolyBot

Your balances:
• POL: ${balance / Math.pow(10, 18)} POL`;

export async function welcomeView(user: User, ctx: BotContext) {
  try {
    const balance = await getUserBalance(user.ethAddress);
    const messageText = welcomeMessage(user, balance);
    await ctx.reply(messageText, {});
  } catch (error) {
    console.error("Error sending welcome view:", error);
    throw error;
  }
}
