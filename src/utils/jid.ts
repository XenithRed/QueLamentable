import { jidNormalizedUser } from 'baileys';
import type { Bot } from '../types/command.js';

export function isGroupJid(jid: string): boolean {
  return jid.endsWith('@g.us');
}

export function isPnJid(jid: string): boolean {
  return jid.endsWith('@s.whatsapp.net');
}

export function toPnJid(raw: string): string | undefined {
  if (isPnJid(raw)) return jidNormalizedUser(raw);
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 8) return undefined;
  return `${digits}@s.whatsapp.net`;
}

export function resolvePnJid(bot: Bot, value?: string): string | undefined {
  if (!value) return undefined;
  if (isPnJid(value)) return jidNormalizedUser(value);

  const resolved = bot.cache.jid.resolve(value);
  if (resolved?.pn) return jidNormalizedUser(resolved.pn);

  return toPnJid(value);
}

export function resolveLidJid(bot: Bot, value?: string): string | undefined {
  if (!value) return undefined;
  if (value.endsWith('@lid')) return jidNormalizedUser(value);

  const resolved = bot.cache.jid.resolve(value);
  if (resolved?.lid) return jidNormalizedUser(resolved.lid);

  return jidNormalizedUser(value);
}

export function extractPhoneNumber(jid?: string): string | undefined {
  if (!jid) return undefined;
  return jid.split('@')[0]?.split(':')[0];
}

export function normalizeParticipantId(value?: string): string | undefined {
  if (!value) return undefined;
  return jidNormalizedUser(value);
}
