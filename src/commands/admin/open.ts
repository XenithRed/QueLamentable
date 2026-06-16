import type { Command } from '../../types/command.js';
import { requireBotAdmin, requireGroupAdmin } from '../../utils/admin.js';
import { styleText } from '../../utils/helpers.js';

const command: Command = {
  name: 'open',
  aliases: ['abrir', 'unlock'],
  description: 'Abre el grupo para que todos escriban',
  category: 'admin',
  groupOnly: true,
  adminOnly: true,
  async execute(ctx) {
    if (!(await requireGroupAdmin(ctx))) return;
    if (!(await requireBotAdmin(ctx))) return;

    try {
      await ctx.bot.sock.groupSettingUpdate(ctx.chatId, 'not_announcement');
      await ctx.message.reply({ text: styleText('ꕣ Grupo abierto. Todos pueden escribir ✅') });
    } catch {
      await ctx.message.reply({ text: styleText('ꕢ No pude abrir el grupo.') });
    }
  },
};

export default command;
