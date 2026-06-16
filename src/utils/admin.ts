import type { CommandContext } from '../types/command.js';
import { isAdmin, isBotAdmin, isOwner, styleText } from './helpers.js';
import { findParticipants } from './permissions.js';
import { resolvePnJid } from './jid.js';

export async function requireGroup(ctx: CommandContext): Promise<boolean> {
  if (ctx.isGroup) return true;
  await ctx.message.reply({ text: styleText('ꕢ Este comando solo funciona en grupos.') }).catch(() => undefined);
  return false;
}

export async function requireGroupAdmin(ctx: CommandContext): Promise<boolean> {
  if (!(await requireGroup(ctx))) return false;

  const admin = await isAdmin(ctx.bot.sock, ctx.chatId, ctx.sender);
  if (admin || isOwner(ctx.sender, ctx.owners)) return true;

  await ctx.message.reply({ text: styleText('ꕢ Solo los administradores pueden usar este comando.') }).catch(() => undefined);
  return false;
}

export async function requireBotAdmin(ctx: CommandContext): Promise<boolean> {
  if (!(await requireGroup(ctx))) return false;

  const botAdmin = await isBotAdmin(ctx.bot.sock, ctx.chatId);
  if (botAdmin) return true;

  await ctx.message.reply({ text: styleText('ꕢ Necesito ser administrador del grupo para hacer esto.') }).catch(() => undefined);
  return false;
}

export function resolveTargets(ctx: CommandContext): string[] {
  const targets = new Set<string>();

  for (const mention of ctx.message.mentions) {
    targets.add(mention);
  }

  if (ctx.message.quoted?.sender) {
    targets.add(ctx.message.quoted.sender);
  }

  for (const arg of ctx.args) {
    const cleaned = arg.replace(/^@/, '').trim();
    if (cleaned) targets.add(cleaned);
  }

  return [...targets];
}

export async function resolveParticipantIds(ctx: CommandContext, targets?: string[]): Promise<string[]> {
  const list = targets ?? resolveTargets(ctx);
  if (list.length === 0) return [];

  const participants = await findParticipants(ctx.bot.sock, ctx.chatId, list);
  return participants.map((participant) => participant.id).filter(Boolean);
}

export function buildMentionText(
  bot: CommandContext['bot'],
  rawTarget: string,
  text: string,
): {
  text: string;
  mentions: string[];
} {
  const pn = resolvePnJid(bot, rawTarget);
  const number = rawTarget.split('@')[0]?.split(':')[0];
  const mentionJid = pn ?? (number ? `${number}@s.whatsapp.net` : rawTarget);

  return {
    text,
    mentions: [mentionJid],
  };
}
