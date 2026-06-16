import type { Command } from '../../types/command.js';
import { formatNumber, styleText } from '../../utils/helpers.js';
import { checkGroupEconomy, getCurrencyName, getDefaultEconomy } from '../../utils/economy.js';

const command: Command = {
    name: 'roulette',
    aliases: ['rt'],
    description: 'Apuesta en la ruleta',
    category: 'economy',
    async execute(ctx) {
        if (ctx.isGroup && !(await checkGroupEconomy(ctx))) {
            return await ctx.message.reply({ text: styleText('ꕢ El sistema de economía está desactivado en este grupo.') });
        }

        const jid = ctx.sender;
        if (!jid) return;

        let userData = await ctx.db.getUser(jid);
        if (!userData) {
            userData = await ctx.db.upsertUser({ jid, lid: ctx.sender, lastSeen: Date.now() });
        }
        const economy = userData.economy || getDefaultEconomy();
        const userCoins = economy.coins || 0;
        const currencyName = await getCurrencyName(ctx);

        if (!ctx.args[0] || !ctx.args[1]) {
            return await ctx.message.reply({ text: styleText('ꕢ Uso incorrecto.\n> Uso: *#roulette* `<red/black>` `<cantidad>`') });
        }

        const choice = ctx.args[0].toLowerCase();
        const amount = parseInt(ctx.args[1]);

        if (!['red', 'black'].includes(choice)) {
            return await ctx.message.reply({ text: styleText('ꕢ Debes elegir: red o black') });
        }
        if (isNaN(amount) || amount <= 0) {
            return await ctx.message.reply({ text: styleText('ꕢ Cantidad inválida.') });
        }
        if (amount > userCoins) {
            return await ctx.message.reply({ text: styleText(`ꕢ No tienes suficientes ${currencyName}.`) });
        }

        const result = Math.random() < 0.5 ? 'red' : 'black';
        const won = result === choice;

        if (won) {
            const winAmount = Math.floor(amount * 1.8);
            const newBalance = userCoins + winAmount;
            await ctx.db.updateUserEconomy(jid, {
                'economy.coins': newBalance
            });
            await ctx.message.reply({ text: styleText(
                `ꕣ *¡Ganaste!*\n\n` +
                `Salió: ${result} ${result === 'red' ? '🔴' : '⚫'}\n` +
                `Ganancia: +${formatNumber(winAmount)} ${currencyName}\n` +
                `Balance: ${formatNumber(newBalance)} ${currencyName}`
            ) });
        } else {
            const newBalance = Math.max(0, userCoins - amount);
            await ctx.db.updateUserEconomy(jid, {
                'economy.coins': newBalance
            });
            await ctx.message.reply({ text: styleText(
                `ꕣ *Perdiste*\n\n` +
                `Salió: ${result} ${result === 'red' ? '🔴' : '⚫'}\n` +
                `Pérdida: -${formatNumber(amount)} ${currencyName}\n` +
                `Balance: ${formatNumber(newBalance)} ${currencyName}`
            ) });
        }
    }
};

export default command;