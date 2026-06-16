import type { CommandContext } from '../types/command.js';

const DEFAULT_CURRENCY = 'coins';

export async function getCurrencyName(ctx: CommandContext): Promise<string> {
  if (!ctx.isGroup) return DEFAULT_CURRENCY;
  const group = await ctx.db.getGroup(ctx.chatId);
  return (group?.settings as any)?.currencyName || DEFAULT_CURRENCY;
}

export async function checkGroupEconomy(ctx: CommandContext): Promise<boolean> {
  if (!ctx.isGroup) return true;
  const group = await ctx.db.getGroup(ctx.chatId);
  return (group?.settings as any)?.economy ?? false;
}

export function getDefaultEconomy() {
  return {
    coins: 0,
    bank: 0,
    lastWork: 0,
    lastDaily: 0,
    lastCrime: 0,
    lastFish: 0,
    lastBeg: 0,
    lastSlut: 0,
    dailyStreak: 0,
    fishCaught: 0
  };
}