import type { Command } from '../../types/command.js';
import { formatNumber, styleText } from '../../utils/helpers.js';
import { getCurrencyName, getDefaultEconomy } from '../../utils/economy.js';

const command: Command = {
    name: 'deposit',
    aliases: ['dep', 'depositar'],
    description: 'Deposita monedas en el banco',
    category: 'economy',
    async execute(ctx) {
        if (ctx.args.length === 0) {
            return await ctx.message.reply({ text: styleText('ꕢ Uso: *#deposit* <cantidad|all>') });
        }
        
        const jid = ctx.sender;
        if (!jid) return;

        let userData = await ctx.db.getUser(jid);
        if (!userData) {
            userData = await ctx.db.upsertUser({ jid, lid: ctx.sender, lastSeen: Date.now() });
        }
        
        const economy = userData.economy || getDefaultEconomy();

        let amount: number;
        if (ctx.args[0].toLowerCase() === 'all') {
            amount = economy.coins || 0;
        } else {
            amount = parseInt(ctx.args[0]);
        }

        if (isNaN(amount) || amount <= 0) {
            return await ctx.message.reply({ text: styleText('ꕢ La cantidad debe ser un número mayor a 0.') });
        }

        if ((economy.coins || 0) < amount) {
            return await ctx.message.reply({ text: styleText('ꕢ No tienes suficientes coins en tu billetera.') });
        }

        const currencyName = await getCurrencyName(ctx);
        const coins = economy.coins || 0;
        const bank = economy.bank || 0;

        await ctx.db.updateUserEconomy(jid, {
            'economy.coins': coins - amount,
            'economy.bank': bank + amount
        });
        
        await ctx.message.reply({ text: styleText(`ꕣ Depositaste *¥${formatNumber(amount)}* ${currencyName} en el banco.`) });
    }
};

export default command;