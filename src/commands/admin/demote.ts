import type { Command } from '../../types/command.js';
import { requireBotAdmin, requireGroupAdmin, resolveParticipantIds } from '../../utils/admin.js';
import { styleText } from '../../utils/helpers.js';

const command: Command = {
  name: 'demote',
  aliases: ['unadmin', 'quitaradmin'],
  description: 'Quita admin a un usuario',
  category: 'admin',
  groupOnly: true,
  adminOnly: true,
  async execute(ctx) {
    if (!(await requireGroupAdmin(ctx))) return;
    if (!(await requireBotAdmin(ctx))) return;

    const participantIds = await resolveParticipantIds(ctx);
    if (participantIds.length === 0) {
      await ctx.message.reply({ text: styleText('ꕢ Menciona o responde al usuario. Uso: */demote* `@usuario`') });
      return;
    }

    try {
      await ctx.bot.sock.groupParticipantsUpdate(ctx.chatId, participantIds, 'demote');
      await ctx.message.reply({ text: styleText(`ꕣ ${participantIds.length} usuario(s) degradado(s) ✅`) });
    } catch {
      await ctx.message.reply({ text: styleText('ꕢ No pude degradar al usuario.') });
    }
  },
};

export default command;
