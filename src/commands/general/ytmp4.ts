import type { Command } from '../../types/command.js';

const command: Command = {
  name: 'ytmp4',
  aliases: ['ytv', 'ytvideo'],
  description: 'Descarga video de YouTube',
  category: 'downloads',
  async execute(ctx) {
    await ctx.message.reply({ text: '✦ El comando ytmp4 está pendiente de implementación.' });
  },
};

export default command;
