import type { Command } from '../../types/command.js';

const command: Command = {
  name: 'mediafire',
  aliases: ['mf'],
  description: 'Descarga archivos de Mediafire',
  category: 'downloads',
  async execute(ctx) {
    await ctx.message.reply({ text: '✦ El comando mediafire está pendiente de implementación.' });
  },
};

export default command;
