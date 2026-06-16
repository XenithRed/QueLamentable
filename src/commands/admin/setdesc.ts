import type { Command } from '../../types/command.js';
import { requireBotAdmin, requireGroupAdmin } from '../../utils/admin.js';
import { styleText } from '../../utils/helpers.js';

const command: Command = {
  name: 'setdesc',
  aliases: ['desc', 'descripcion', 'setdescription'],
  description: 'Cambia la descripción del grupo',
  category: 'admin',
  groupOnly: true,
  adminOnly: true,
  async execute(ctx) {
    if (!(await requireGroupAdmin(ctx))) return;
    if (!(await requireBotAdmin(ctx))) return;

    const description = ctx.args.join(' ').trim();
    if (!description) {
      await ctx.message.reply({ text: styleText('ꕢ Uso: */setdesc* `<nueva descripción>`') });
      return;
    }

    try {
      await ctx.bot.sock.groupUpdateDescription(ctx.chatId, description);
      await ctx.message.reply({ text: styleText('ꕣ Descripción del grupo actualizada ✅') });
    } catch {
      await ctx.message.reply({ text: styleText('ꕢ No pude cambiar la descripción del grupo.') });
    }
  },
};

export default command;
