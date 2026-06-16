import type { Command } from '../../types/command.js';
import { requireGroupAdmin } from '../../utils/admin.js';
import { styleText } from '../../utils/helpers.js';
import { resolvePnJid } from '../../utils/jid.js';

const command: Command = {
  name: 'tagall',
  aliases: ['everyone', 'todos', 'hidetag'],
  description: 'Menciona a todos los miembros del grupo',
  category: 'admin',
  groupOnly: true,
  adminOnly: true,
  async execute(ctx) {
    if (!(await requireGroupAdmin(ctx))) return;

    try {
      const metadata = await ctx.bot.sock.groupMetadata(ctx.chatId);
      const text = ctx.args.join(' ').trim() || '👋 Atención a todos';
      const mentions = metadata.participants
        .map((participant) => resolvePnJid(ctx.bot, participant.phoneNumber ?? participant.id))
        .filter((jid): jid is string => Boolean(jid));

      await ctx.message.reply({ text: styleText(text), mentions });
    } catch {
      await ctx.message.reply({ text: styleText('ꕢ No pude mencionar a todos.') });
    }
  },
};

export default command;
