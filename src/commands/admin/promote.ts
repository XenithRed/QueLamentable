import type { Command } from '../../types/command.js';
import { requireBotAdmin, requireGroupAdmin, resolveParticipantIds } from '../../utils/admin.js';
import { styleText } from '../../utils/helpers.js';

const command: Command = {
  name: 'promote',
  aliases: ['admin', 'daradmin'],
  description: 'Promueve a un usuario como admin',
  category: 'admin',
  groupOnly: true,
  adminOnly: true,
  async execute(ctx) {
    if (!(await requireGroupAdmin(ctx))) return;
    if (!(await requireBotAdmin(ctx))) return;

    const participantIds = await resolveParticipantIds(ctx);
    if (participantIds.length === 0) {
      await ctx.message.reply({ text: styleText('ꕢ Menciona o responde al usuario. Uso: */promote* `@usuario`') });
      return;
    }

    try {
      await ctx.bot.sock.groupParticipantsUpdate(ctx.chatId, participantIds, 'promote');
      await ctx.message.reply({ text: styleText(`ꕣ ${participantIds.length} usuario(s) promovido(s) ✅`) });
    } catch {
      await ctx.message.reply({ text: styleText('ꕢ No pude promover al usuario.') });
    }
  },
};

export default command;
