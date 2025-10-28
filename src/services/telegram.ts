import { Context } from "telegraf";
import { User } from "../database/models";
import { getOrCreateUser } from "../database/repository/user";
import { logger } from "../utils/logger";

export interface BotContext extends Context {
  user: User | null;
}

export async function userCreator(ctx: BotContext, next: () => Promise<void>) {
  logger.info(`Processing user with Telegram ID: ${ctx.from?.id}`);
  if (ctx.from && ctx.from.id) {
    ctx.user = await getOrCreateUser(ctx.from.id);
  }
  await next();
}
