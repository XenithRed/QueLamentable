import type { Command } from '../../types/command.js';
import { formatNumberLarge, styleText } from '../../utils/helpers.js';
import { getCurrencyName } from '../../utils/economy.js';

const command: Command = {
    name: 'board',
    aliases: ['leaderboard', 'top', 'baltop'],
    description: 'Muestra el ranking de economía',
    category: 'economy',
    async execute(ctx) {
        const users = await ctx.db.getTopUsers(10);

        if (users.length === 0) {
            return ctx.message.reply({ text: styleText('ꕢ No hay usuarios con coins en este ranking.') });
        }

        const currencyName = await getCurrencyName(ctx);
        
        let message = 'ꕣ Ranking Global de Economía\n\n';
        message += '➭ Top 10 Ricachones\n\n';

        users.forEach((user, i) => {
            const medal = i === 0 ? '❶' : i === 1 ? '❷' : i === 2 ? '❸' : `${i + 1}.`;
            const userNumber = user.jid.split('@')[0];
            
            message += `${medal} @${userNumber}\n`;
            message += `> ⛃ Coins » *¥${formatNumberLarge(user.coins)}* ${currencyName}\n`;
            message += `> ❖ Banco » *¥${formatNumberLarge(user.bank)}* ${currencyName}\n`;
            message += `> ✧ Total » *¥${formatNumberLarge(user.total)}* ${currencyName}\n\n`;
        });

        message += '💫 _Sigue esforzándote!_';
        await ctx.message.reply({ text: styleText(message) });
    }
};

export default command;