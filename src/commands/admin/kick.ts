import type { Command } from '../../types/command.js';
import {
  buildMentionText,
  requireBotAdmin,
  requireGroupAdmin,
  resolveParticipantIds,
  resolveTargets,
} from '../../utils/admin.js';
import { styleText } from '../../utils/helpers.js';

const command: Command = {
  name: 'kick',
  aliases: ['remove', 'echar'],
  description: 'Expulsa a un usuario del grupo',
  category: 'admin',
  groupOnly: true,
  adminOnly: true,
  async execute(ctx) {
    if (!(await requireGroupAdmin(ctx))) return;
    if (!(await requireBotAdmin(ctx))) return;

    const targets = resolveTargets(ctx);
    const participantIds = await resolveParticipantIds(ctx, targets);

    if (participantIds.length === 0) {
      await ctx.message.reply({ text: styleText('ꕢ Menciona o responde al usuario. Uso: */kick* `@usuario`') });
      return;
    }

    try {
      await ctx.bot.sock.groupParticipantsUpdate(ctx.chatId, participantIds, 'remove');
      const target = targets[0] ?? participantIds[0]!;
      const mention = buildMentionText(ctx.bot, target, styleText('ꕣ Usuario expulsado del grupo.'));
      await ctx.message.reply({ text: mention.text, mentions: mention.mentions });
    } catch {
      await ctx.message.reply({ text: styleText('ꕢ No pude expulsar al usuario. Verifica permisos.') });
    }
  },
};

export default command;
