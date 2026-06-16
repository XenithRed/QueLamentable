import type { Command } from '../../types/command.js';
import { formatNumberLarge, styleText, getCooldown, formatTime } from '../../utils/helpers.js';
import { checkGroupEconomy, getCurrencyName, getDefaultEconomy } from '../../utils/economy.js';

const command: Command = {
    name: 'einfo',
    aliases: [],
    description: 'Muestra información económica de un usuario',
    category: 'economy',
    async execute(ctx) {
        if (ctx.isGroup && !(await checkGroupEconomy(ctx))) {
            return await ctx.message.reply({ text: styleText('ꕢ El sistema de economía está desactivado en este grupo.') });
        }

        const jid = ctx.sender;
        if (!jid) return;

        const mentions = ctx.message.mentions;
        let target = mentions.length > 0 ? mentions[0] : jid;

        if (target.includes('@lid')) {
            const phoneNumber = target.split('@')[0].split(':')[0];
            if (phoneNumber && /^\d+$/.test(phoneNumber)) {
                target = `${phoneNumber}@s.whatsapp.net`;
            }
        }

        if (!target.includes('@s.whatsapp.net') && !target.includes('@lid')) {
            target = `${target}@s.whatsapp.net`;
        }

        let userData = await ctx.db.getUser(target);

        if (!userData) {
            return await ctx.message.reply({ text: styleText('ꕢ Usuario no encontrado en la base de datos.') });
        }

        const economy = userData.economy || getDefaultEconomy();
        const total = (economy.coins || 0) + (economy.bank || 0);
        
        const cooldowns = {
            work: getCooldown(economy.lastWork || 0, 1 * 60 * 1000),
            daily: getCooldown(economy.lastDaily || 0, 24 * 60 * 60 * 1000),
            crime: getCooldown(economy.lastCrime || 0, 10 * 60 * 1000),
            slut: getCooldown(economy.lastSlut || 0, 10 * 60 * 1000),
            fish: getCooldown(economy.lastFish || 0, 30 * 1000)
        };

        const currencyName = await getCurrencyName(ctx);

        let message = `╭─────── ୨୧ ───────╮\n`;
        message += `│ *ECONOMY INFO* \n`;
        message += `╰────────────────╯\n`;
        message += `✿ *::* *Usuario* › @${target.split('@')[0]}\n\n`;

        message += `╭─── ⚐ Balance ───╮\n`;
        message += `│ *Efectivo* › ${formatNumberLarge(economy.coins || 0)} ${currencyName}\n`;
        message += `│ *Banco*    › ${formatNumberLarge(economy.bank || 0)} ${currencyName}\n`;
        message += `│ *Total*    › ${formatNumberLarge(total)} ${currencyName}\n`;
        message += `╰────────────────╯\n\n`;

        message += `╭─── ⚐ Cooldowns ───╮\n`;
        message += `│ *Work*  › ${cooldowns.work > 0 ? formatTime(cooldowns.work) : '✔'}\n`;
        message += `│ *Daily* › ${cooldowns.daily > 0 ? formatTime(cooldowns.daily) : '✔'}\n`;
        message += `│ *Crime* › ${cooldowns.crime > 0 ? formatTime(cooldowns.crime) : '✔'}\n`;
        message += `│ *Slut*  › ${cooldowns.slut > 0 ? formatTime(cooldowns.slut) : '✔'}\n`;
        message += `│ *Fish*  › ${cooldowns.fish > 0 ? formatTime(cooldowns.fish) : '✔'}\n`;
        message += `╰────────────────╯`;

        await ctx.message.reply({ text: styleText(message) });
    }
};

export default command;