import { User } from "../database/models";
import { BotContext } from "../services/telegram";

const welcomeMessage = (user: User) => `
Welcome to PolyStrategy - Trade on Polymarket with ease! 🎯

To get started, please fund your wallet using the /fund command.

💡 Quick Trading Tips:
• Use /search <string> to search for any markets (e.g., 'Trump', 'Bitcoin', 'NBA Finals')
• Use /trending to browse popular markets
• Send a Polymarket URL to trade directly (coming soon!)

Your Polygon wallet address: ${user.ethAddress}
Your Solana wallet address: ${user.solAddress}
To start trading:
1. Send at least 0.1 SOL to your Solana wallet address.

You need at least 0.1 SOL in your Solana wallet to bridge to Polygon. Use the /fund command.

Your balances:
• SOL: 0.0000 SOL
• POL: 0.0000 POL
• USDC: $0.00`;

export async function welcomeView(user: User, ctx: BotContext) {
  try {
    const messageText = welcomeMessage(user);
    await ctx.reply(messageText, {
      parse_mode: "HTML",
    });
  } catch (error) {
    console.error("Error sending welcome view:", error);
    throw error;
  }
}
