import type { Command } from '../../types/command.js';
import { formatNumber, styleText } from '../../utils/helpers.js';
import { checkGroupEconomy, getCurrencyName, getDefaultEconomy } from '../../utils/economy.js';

const command: Command = {
    name: 'withdraw',
    aliases: ['wd'],
    description: 'Retira monedas del banco',
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

        if (!ctx.args[0]) {
            return await ctx.message.reply({ text: styleText('ꕢ Debes especificar una cantidad.\nUso: #withdraw <cantidad>') });
        }

        const bank = economy.bank || 0;
        const coins = economy.coins || 0;

        const amount = ctx.args[0].toLowerCase() === 'all' ? bank : parseInt(ctx.args[0]);

        if (isNaN(amount) || amount <= 0) {
            return await ctx.message.reply({ text: styleText('ꕢ Cantidad inválida.') });
        }
        if (amount > bank) {
            return await ctx.message.reply({ text: styleText('ꕢ No tienes suficientes coins en el banco.') });
        }

        const currencyName = await getCurrencyName(ctx);

        await ctx.db.updateUserEconomy(jid, {
            'economy.bank': bank - amount,
            'economy.coins': coins + amount
        });

        await ctx.message.reply({ text: styleText(
            `ꕣ *Retiro Exitoso*\n\n` +
            `> ✿ Retiraste » *¥${formatNumber(amount)}* ${currencyName}\n` +
            `> ✿ ${currencyName} » *¥${formatNumber(coins + amount)}*\n` +
            `> ✿ Banco » *¥${formatNumber(bank - amount)}*`
        ) });
    }
};

export default command;