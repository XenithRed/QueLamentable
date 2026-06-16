import type { Command, CommandContext } from '../../types/command.js';
import { requireBotAdmin, requireGroupAdmin } from '../../utils/admin.js';
import { styleText } from '../../utils/helpers.js';

async function getImageMessage(ctx: CommandContext) {
  if (ctx.message.mimetype?.startsWith('image/')) return ctx.message;
  if (ctx.message.quoted?.mimetype?.startsWith('image/')) return ctx.message.quoted;
  return undefined;
}

const command: Command = {
  name: 'setpp',
  aliases: ['seticon', 'icon', 'pp'],
  description: 'Cambia la imagen del grupo',
  category: 'admin',
  groupOnly: true,
  adminOnly: true,
  async execute(ctx) {
    if (!(await requireGroupAdmin(ctx))) return;
    if (!(await requireBotAdmin(ctx))) return;

    try {
      const target = await getImageMessage(ctx);
      if (!target) {
        await ctx.message.reply({
          text: styleText('ꕢ Envía una imagen con el comando o responde a una imagen. Uso: */setpp*'),
        });
        return;
      }

      const buffer = await target.download();
      await ctx.bot.sock.updateProfilePicture(ctx.chatId, buffer);
      await ctx.message.reply({ text: styleText('ꕣ Imagen del grupo actualizada ✅') });
    } catch {
      await ctx.message.reply({ text: styleText('ꕢ No pude cambiar la imagen del grupo.') });
    }
  },
};

export default command;
