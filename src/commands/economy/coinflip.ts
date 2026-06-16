import type { Command } from '../../types/command.js';
import { formatNumber, styleText } from '../../utils/helpers.js';
import { getCurrencyName, getDefaultEconomy } from '../../utils/economy.js';

const command: Command = {
    name: 'coinflip',
    aliases: ['cf'],
    description: 'Apuesta cara o cruz',
    category: 'economy',
    async execute(ctx) {
        if (ctx.args.length < 2) {
            return await ctx.message.reply({ text: styleText('ꕢ Uso: */coinflip* `<cantidad>` `<cara/cruz>`') });
        }

        const jid = ctx.sender;
        if (!jid) return;

        const amount = parseInt(ctx.args[0]);
        const choice = ctx.args[1].toLowerCase();
        
        if (isNaN(amount) || amount <= 0) {
            return await ctx.message.reply({ text: styleText('ꕢ La cantidad debe ser un número mayor a 0.') });
        }
        if (!['cara', 'cruz'].includes(choice)) {
            return await ctx.message.reply({ text: styleText('ꕢ Debes elegir cara o cruz.') });
        }

        let userData = await ctx.db.getUser(jid);
        if (!userData) {
            userData = await ctx.db.upsertUser({ jid, lid: ctx.sender, lastSeen: Date.now() });
        }
        const economy = userData.economy || getDefaultEconomy();
        const currentCoins = economy.coins || 0;
        const currencyName = await getCurrencyName(ctx);

        if (currentCoins < amount) {
            return await ctx.message.reply({ text: styleText(`ꕢ No tienes suficientes ${currencyName}.`) });
        }

        const result = Math.random() < 0.5 ? 'cara' : 'cruz';
        const won = result === choice;
        
        if (won) {
            await ctx.db.updateUserEconomy(jid, {
                'economy.coins': currentCoins + amount
            });
            await ctx.message.reply({ text: styleText(`ꕣ ¡Salió *${result}*! Ganaste *¥${formatNumber(amount)}* ${currencyName}.`) });
        } else {
            await ctx.db.updateUserEconomy(jid, {
                'economy.coins': currentCoins - amount
            });
            await ctx.message.reply({ text: styleText(`ꕢ Salió *${result}*. Perdiste *¥${formatNumber(amount)}* ${currencyName}.`) });
        }
    }
};

export default command;