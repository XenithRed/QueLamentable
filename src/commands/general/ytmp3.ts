import type { Command } from '../../types/command.js';

const command: Command = {
  name: 'ytmp3',
  aliases: ['yta', 'ytaudio'],
  description: 'Descarga audio de YouTube',
  category: 'downloads',
  async execute(ctx) {
    await ctx.message.reply({ text: '✦ El comando ytmp3 está pendiente de implementación.' });
  },
};

export default command;
