import type { Bot } from '../types/command.js';
import { extractPhoneNumber } from './jid.js';

export type BotSocket = Bot['sock'];

export function styleText(text: string): string {
  return text;
}

export function isOwner(sender: string | undefined, owners: Set<string>): boolean {
  if (!sender) return false;
  return owners.has(sender);
}

export async function isAdmin(
  sock: BotSocket,
  groupId: string,
  sender?: string,
): Promise<boolean> {
  if (!sender) return false;

  const metadata = await sock.groupMetadata(groupId);

  return metadata.participants.some((participant) => {
    if (participant.admin !== 'admin' && participant.admin !== 'superadmin') {
      return false;
    }

    const normalizedSender = sender.toLowerCase();
    const senderNumber = extractPhoneNumber(sender);

    const ids = [participant.id, participant.lid, participant.phoneNumber]
      .filter(Boolean)
      .map((value) => value!.toLowerCase());

    if (ids.includes(normalizedSender)) return true;

    if (!senderNumber) return false;

    return ids.some((id) => extractPhoneNumber(id) === senderNumber);
  });
}

export async function isBotAdmin(sock: BotSocket, groupId: string): Promise<boolean> {
  if (!sock.user) return false;

  const adminCheckId = sock.user.lid ?? sock.user.id ?? sock.user.phoneNumber;
  if (!adminCheckId) return false;

  return isAdmin(sock, groupId, adminCheckId);
}

export const WHATSAPP_LINK_REGEX =
  /(chat\.whatsapp\.com\/[a-zA-Z0-9]+)|(whatsapp\.com\/channel\/[a-zA-Z0-9]+)|(wa\.me\/[0-9]+)|(api\.whatsapp\.com\/send\?phone=[0-9]+)/i;

export function formatNumber(num: number): string {
  return num.toLocaleString('es-ES');
}

export function formatNumberLarge(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toLocaleString('es-ES');
}

export function formatTime(ms: number): string {
  if (ms <= 0) return '0s';
  const seconds = Math.floor(ms / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export function getCooldown(lastAction: number, cooldownMs: number): number {
  const remaining = cooldownMs - (Date.now() - lastAction);
  return remaining > 0 ? remaining : 0;
}

export function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function extractMentions(ctx: { message: { message?: any }; args?: string[] }): string[] {
  const mentions: string[] = [];
  const msg = ctx.message?.message;
  if (msg?.extendedTextMessage?.contextInfo?.mentionedJid) {
    for (const jid of msg.extendedTextMessage.contextInfo.mentionedJid) {
      mentions.push(jid);
    }
  }
  return mentions;
}
