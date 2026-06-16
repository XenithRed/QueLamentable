import type { Command } from '../../types/command.js';
import { formatNumber, styleText } from '../../utils/helpers.js';
import { checkGroupEconomy, getCurrencyName, getDefaultEconomy } from '../../utils/economy.js';

function extractTarget(args: string[], mentions: string[]): string | null {
    const mention = mentions.find((jid) => jid.includes('@s.whatsapp.net') || jid.includes('@lid'));
    if (mention) return mention;

    const potentialNumber = args[0]?.replace(/[@\s]/g, '');
    if (potentialNumber && /^\d+$/.test(potentialNumber)) {
        return `${potentialNumber}@s.whatsapp.net`;
    }

    return null;
}

const command: Command = {
    name: 'steal',
    aliases: ['robar'],
    description: 'Roba monedas a otro usuario',
    category: 'economy',
    async execute(ctx) {
        if (ctx.isGroup && !(await checkGroupEconomy(ctx))) {
            return await ctx.message.reply({ text: styleText('ꕢ El sistema de economía está desactivado en este grupo.') });
        }

        const jid = ctx.sender;
        if (!jid) return;

        let target = extractTarget(ctx.args, ctx.message.mentions);

        if (!target) {
            return await ctx.message.reply({ text: styleText('ꕢ Debes mencionar a un usuario.\nUso: *#steal* @usuario') });
        }

        if (target === jid) {
            return await ctx.message.reply({ text: styleText('ꕢ No puedes robarte a ti mismo.') });
        }

        let userData = await ctx.db.getUser(jid);
        if (!userData) {
            userData = await ctx.db.upsertUser({ jid, lid: ctx.sender, lastSeen: Date.now() });
        }
        const economy = userData.economy || getDefaultEconomy();

        let targetData = await ctx.db.getUser(target);
        if (!targetData) {
            targetData = await ctx.db.upsertUser({ jid: target, lastSeen: Date.now() });
        }
        const targetEconomy = targetData.economy || getDefaultEconomy();

        const currencyName = await getCurrencyName(ctx);

        const SUCCESS_RATE = 0.5;
        const success = Math.random() < SUCCESS_RATE;

        if (success) {
            const targetCoins = targetEconomy.coins || 0;
            const maxSteal = Math.floor(targetCoins * 0.3);
            const stolen = targetCoins > 0 ? Math.floor(Math.random() * maxSteal) + 1 : 0;

            await ctx.db.updateUserEconomy(target, {
                'economy.coins': Math.max(0, targetCoins - stolen)
            });
            await ctx.db.updateUserEconomy(jid, {
                'economy.coins': (economy.coins || 0) + stolen
            });

            await ctx.message.reply({
                text: styleText(`ꕣ Robaste *¥${formatNumber(stolen)}* ${currencyName} a @${target.split('@')[0]}`)
            });
        } else {
            const fine = Math.floor(Math.random() * 1000) + 500;
            const userCoins = economy.coins || 0;
            const lostAmount = Math.min(userCoins, fine);

            await ctx.db.updateUserEconomy(jid, {
                'economy.coins': Math.max(0, userCoins - lostAmount)
            });

            await ctx.message.reply({
                text: styleText(`ꕢ *Te atraparon!*\n\n` +
                    `Intentaste robar a @${target.split('@')[0]} pero te atraparon.\n` +
                    `> ✿ Multa » *¥${formatNumber(fine)}* ${currencyName}\n` +
                    `> ✿ Tu balance » *¥${formatNumber(Math.max(0, userCoins - fine))}* ${currencyName}`)
            });
        }
    }
};

export default command;