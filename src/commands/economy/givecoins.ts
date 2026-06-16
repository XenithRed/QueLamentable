import type { Command } from '../../types/command.js';
import { formatNumber, styleText } from '../../utils/helpers.js';
import { getCurrencyName, getDefaultEconomy } from '../../utils/economy.js';

const command: Command = {
    name: 'givecoins',
    aliases: ['darcoins', 'pay', 'transfer'],
    description: 'Transfiere monedas a otro usuario',
    category: 'economy',
    async execute(ctx) {
        if (ctx.args.length < 2) {
            return await ctx.message.reply({ text: styleText('ꕢ Uso: *#givecoins* `<@usuario>` `<cantidad>`') });
        }

        const extractCleanNumber = (id: string) => {
            if (!id) return '';
            let num = id.split('@')[0];
            if (num.includes(':')) {
                num = num.split(':')[1] || num.split(':')[0];
            }
            return num.replace(/\D/g, '');
        };

        const jid = ctx.sender;
        if (!jid) return;

        let mentions = ctx.message?.mentions ?? [];

        if (mentions.length === 0) {
            return await ctx.message.reply({ text: styleText('ꕢ Debes mencionar a un usuario.') });
        }

        const targetLid = mentions[0];
        let target = targetLid;

        if (target.includes('@lid')) {
            const phoneNumber = target.split('@')[0].split(':')[0];
            if (phoneNumber && /^\d+$/.test(phoneNumber)) {
                target = `${phoneNumber}@s.whatsapp.net`;
            }
        }

        if (!target.includes('@s.whatsapp.net') && !target.includes('@lid')) {
            target = `${target}@s.whatsapp.net`;
        }

        const amount = parseInt(ctx.args[1]);
        if (isNaN(amount) || amount <= 0) {
            return await ctx.message.reply({ text: styleText('ꕢ La cantidad debe ser un número mayor a 0.') });
        }

        const senderNumber = extractCleanNumber(jid);
        const targetNumber = extractCleanNumber(target);

        if (senderNumber === targetNumber) {
            return await ctx.message.reply({ text: styleText('ꕢ No puedes transferirte coins a ti mismo.') });
        }

        let senderData = await ctx.db.getUser(jid);
        if (!senderData) {
            senderData = await ctx.db.upsertUser({ jid, lid: ctx.sender, lastSeen: Date.now() });
        }
        const economy = senderData.economy || getDefaultEconomy();
        const senderCoins = economy.coins || 0;

        if (senderCoins < amount) {
            return await ctx.message.reply({ text: styleText(`ꕢ No tienes suficientes coins. Tienes: ¥${formatNumber(senderCoins)}`) });
        }

        let targetData = await ctx.db.getUser(target);
        if (!targetData) {
            targetData = await ctx.db.upsertUser({ jid: target, lastSeen: Date.now() });
        }
        const targetEconomy = targetData.economy || getDefaultEconomy();

        await ctx.db.updateUserEconomy(jid, {
            'economy.coins': senderCoins - amount
        });
        await ctx.db.updateUserEconomy(target, {
            'economy.coins': (targetEconomy.coins || 0) + amount
        });

        const currencyName = await getCurrencyName(ctx);
        const displayName = targetData.name || targetNumber;

        await ctx.message.reply({
            text: styleText(`ꕣ Transferiste ¥${formatNumber(amount)} ${currencyName} a @${displayName}\n\n` +
                `Tu saldo: ¥${formatNumber(senderCoins - amount)}`)
        });
    }
};

export default command;