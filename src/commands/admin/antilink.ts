import type { Command } from '../../types/command.js';
import { isAdmin, isBotAdmin, isOwner, styleText, WHATSAPP_LINK_REGEX } from '../../utils/helpers.js';
import { findParticipant } from '../../utils/permissions.js';
import { buildMentionText } from '../../utils/admin.js';
import { extractPhoneNumber } from '../../utils/jid.js';

const botAdminCache = new Map<string, boolean>();

export const ANTILINK_SENDER_TAG = '@antilink';

const command: Command = {
  name: 'antilink',
  aliases: ['anti-link', 'nolink'],
  description: 'Activa o desactiva el antilink de WhatsApp',
  category: 'admin',
  groupOnly: true,
  adminOnly: true,
  async before(ctx) {
    const { isGroup, body, sender, chatId, db, bot, message } = ctx;
    if (!isGroup) return;
    if (!body) return;

    const groupData = await db.getGroup(chatId);
    if (!groupData?.settings?.antilink) return;
    if (!WHATSAPP_LINK_REGEX.test(body)) return;
    if (await isAdmin(bot.sock, chatId, sender) || isOwner(sender, ctx.owners)) return;

    let botIsAdmin = botAdminCache.get(chatId);
    if (botIsAdmin === undefined) {
      botIsAdmin = await isBotAdmin(bot.sock, chatId);
      botAdminCache.set(chatId, botIsAdmin);
      setTimeout(() => botAdminCache.delete(chatId), 5 * 60 * 1000);
    }

    if (!botIsAdmin) return;

    try {
      await bot.sock.sendMessage(chatId, { delete: message.toRaw().key });
    } catch (error) {
      console.error('[Antilink] Error al eliminar mensaje:', error);
    }

    try {
      if (!sender) return;
      const participant = await findParticipant(bot.sock, chatId, sender);
      if (!participant?.id) return;

      const via = bot.sock as unknown as { getContactFromJid?: (jid: string) => Promise<{ name?: string } | undefined> };
      let senderName = extractPhoneNumber(sender) ?? sender.split('@')[0]?.split(':')[0];
      try {
        const contact = await via.getContactFromJid?.(sender);
        if (contact?.name) senderName = contact.name;
      } catch {}

      await bot.sock.groupParticipantsUpdate(chatId, [participant.id], 'remove');

      const text = senderName ? `@${senderName} eliminado por enviar enlaces prohibidos (¬_¬")` : 'eliminado por enviar enlaces prohibidos (¬_¬")';
      const mention = buildMentionText(bot, sender, styleText(text));
      await bot.sock.sendMessage(chatId, { text: mention.text, mentions: mention.mentions });
    } catch (error) {
      console.error('[Antilink] Error al eliminar usuario:', error);
    }
  },
  async execute(ctx) {
    if (!ctx.isGroup) {
      await ctx.message.reply({ text: styleText('ꕢ Este comando solo funciona en grupos.') });
      return;
    }

    if (!ctx.args[0] || !['on', 'off'].includes(ctx.args[0].toLowerCase())) {
      await ctx.message.reply({ text: styleText('ꕢ Uso: */antilink* `<on/off>`') });
      return;
    }

    try {
      const enable = ctx.args[0].toLowerCase() === 'on';
      await ctx.db.updateGroup(ctx.chatId, { 'settings.antilink': enable });
      botAdminCache.delete(ctx.chatId);
      await ctx.message.reply({ text: styleText(`ꕣ Antilink ${enable ? 'activado ✅' : 'desactivado ❌'}.`) });
    } catch {
      await ctx.message.reply({ text: styleText('ꕢ Error al cambiar la configuración.') });
    }
  },
};

export default command;
