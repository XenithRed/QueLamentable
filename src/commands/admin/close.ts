import type { Command } from '../../types/command.js';
import { requireBotAdmin, requireGroupAdmin } from '../../utils/admin.js';
import { styleText } from '../../utils/helpers.js';

const command: Command = {
  name: 'close',
  aliases: ['cerrar', 'lock'],
  description: 'Cierra el grupo (solo admins escriben)',
  category: 'admin',
  groupOnly: true,
  adminOnly: true,
  async execute(ctx) {
    if (!(await requireGroupAdmin(ctx))) return;
    if (!(await requireBotAdmin(ctx))) return;

    try {
      await ctx.bot.sock.groupSettingUpdate(ctx.chatId, 'announcement');
      await ctx.message.reply({ text: styleText('ꕣ Grupo cerrado. Solo admins pueden escribir 🔒') });
    } catch {
      await ctx.message.reply({ text: styleText('ꕢ No pude cerrar el grupo.') });
    }
  },
};

export default command;
