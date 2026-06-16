import type { Command } from '../../types/command.js';
import { formatNumberLarge, styleText } from '../../utils/helpers.js';
import { getCurrencyName, getDefaultEconomy } from '../../utils/economy.js';

const command: Command = {
    name: 'balance',
    aliases: ['bal', 'saldo'],
    description: 'Muestra tu balance económico',
    category: 'economy',
    async execute(ctx) {
        const jid = ctx.sender;
        if (!jid) return;

        const currencyName = await getCurrencyName(ctx);
        
        let userData = await ctx.db.getUser(jid);
        if (!userData) {
            userData = await ctx.db.upsertUser({ jid, lid: ctx.sender, lastSeen: Date.now() });
        }
        
        const economy = userData.economy || getDefaultEconomy();
        const coins = economy.coins || 0;
        const bank = economy.bank || 0;
        const total = coins + bank;

        await ctx.message.reply({ text: styleText(
            `ꕣ *Balance de Usuario*\n\n` +
            `⟡ Billetera: *¥${formatNumberLarge(coins)}* ${currencyName}\n` +
            `⟡ Banco: *¥${formatNumberLarge(bank)}* ${currencyName}\n` +
            `⟡ Total: *¥${formatNumberLarge(total)}* ${currencyName}`
        ) });
    }
};

export default command;