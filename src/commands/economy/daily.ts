import type { Command } from '../../types/command.js';
import { formatNumber, getCooldown, formatTime, styleText } from '../../utils/helpers.js';
import { checkGroupEconomy, getCurrencyName, getDefaultEconomy } from '../../utils/economy.js';

const command: Command = {
    name: 'daily',
    aliases: ['diario'],
    description: 'Reclama tu recompensa diaria',
    category: 'economy',
    async execute(ctx) {
        if (ctx.isGroup && !(await checkGroupEconomy(ctx))) {
            return await ctx.message.reply({ text: styleText('ꕢ El sistema de economía está desactivado en este grupo.') });
        }
        
        const jid = ctx.sender;
        if (!jid) return;

        const currencyName = await getCurrencyName(ctx);
        let userData = await ctx.db.getUser(jid);
        if (!userData) {
            userData = await ctx.db.upsertUser({ jid, lid: ctx.sender, lastSeen: Date.now() });
        }
        
        const now = Date.now();
        const COOLDOWN = 24 * 60 * 60 * 1000;
        
        const economy = userData.economy || getDefaultEconomy();
        const lastDaily = economy.lastDaily || 0;
        const cooldown = getCooldown(lastDaily, COOLDOWN);
        
        if (cooldown > 0) {
            return await ctx.message.reply({ text: styleText(`ꕢ Ya reclamaste tu recompensa diaria.\nVuelve en: *${formatTime(cooldown)}*`) });
        }

        const timeSinceLast = now - lastDaily;
        const streakTimeLimit = 48 * 60 * 60 * 1000;
        let streak = economy.dailyStreak || 0;
        
        if (timeSinceLast < streakTimeLimit && lastDaily !== 0) {
            streak += 1;
        } else {
            streak = 1;
        }

        const reward = streak * 10000;
        const currentCoins = economy.coins || 0;
        
        await ctx.db.updateUserEconomy(jid, {
            'economy.coins': currentCoins + reward,
            'economy.lastDaily': now,
            'economy.dailyStreak': streak
        });

        let message = `ꕣ *RECOMPENSA DIARIA*\n\n`;
        message += `> Día » ¥${streak}\n`;
        message += `> Recompensa » *¥${formatNumber(reward)}* ${currencyName}\n`;
        
        if (streak > 1) {
            message += `\n_¡Mantén la racha para ganar más!_`;
        } else if (lastDaily !== 0) {
            message += `\n_¡Perdiste tu racha! Vuelve mañana para continuar._`;
        }
        
        await ctx.message.reply({ text: styleText(message) });
    }
};

export default command;