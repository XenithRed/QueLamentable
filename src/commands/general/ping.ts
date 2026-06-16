import type { Command } from '../../types/command.js';

const command: Command = {
    name: 'ping',
    aliases: ['p'],
    description: 'Comprueba la latencia del bot',
    category: 'general',
    async execute(ctx) {
        const latency = Math.max(0, Date.now() - (ctx.message.timestamp * 1000));
        await ctx.message.reply({ text: `${latency} ms` });
    }
};

export default command;
