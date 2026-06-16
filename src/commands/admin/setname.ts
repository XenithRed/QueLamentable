import type { Command } from '../../types/command.js';
import { requireBotAdmin, requireGroupAdmin } from '../../utils/admin.js';
import { styleText } from '../../utils/helpers.js';

const command: Command = {
  name: 'setname',
  aliases: ['nombre', 'nameset'],
  description: 'Cambia el nombre del grupo',
  category: 'admin',
  groupOnly: true,
  adminOnly: true,
  async execute(ctx) {
    if (!(await requireGroupAdmin(ctx))) return;
    if (!(await requireBotAdmin(ctx))) return;

    const subject = ctx.args.join(' ').trim();
    if (!subject) {
      await ctx.message.reply({ text: styleText('ꕢ Uso: */setname* `<nuevo nombre>`') });
      return;
    }

    try {
      await ctx.bot.sock.groupUpdateSubject(ctx.chatId, subject);
      await ctx.db.updateGroup(ctx.chatId, { name: subject });
      await ctx.message.reply({ text: styleText(`ꕣ Nombre del grupo actualizado a: *${subject}*`) });
    } catch {
      await ctx.message.reply({ text: styleText('ꕢ No pude cambiar el nombre del grupo.') });
    }
  },
};

export default command;
