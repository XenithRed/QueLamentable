import type { Command } from '../../types/command.js';

const command: Command = {
  name: 'instagram',
  aliases: ['ig', 'insta'],
  description: 'Descarga contenido de Instagram',
  category: 'downloads',
  async execute(ctx) {
    await ctx.message.reply({ text: '✦ El comando instagram está pendiente de implementación.' });
  },
};

export default command;
