import type { Command } from '../../types/command.js';
import { formatNumber, getCooldown, formatTime, getRandom, styleText } from '../../utils/helpers.js';
import { checkGroupEconomy, getCurrencyName, getDefaultEconomy } from '../../utils/economy.js';

const BEG_SUCCESS = [
    { text: 'Un desconocido te dio', emoji: '👥', multi: 1 },
    { text: 'Encontraste tirado', emoji: '🍀', multi: 1.2 },
    { text: 'Tu abuela te regaló', emoji: '👵', multi: 2 },
    { text: 'Vendiste limonada y ganaste', emoji: '🍋', multi: 1.5 },
    { text: 'Ayudaste a cruzar la calle a una anciana y te dio', emoji: '👵', multi: 1.5 },
    { text: 'Hiciste malabares en el semáforo y te dieron', emoji: '🤹', multi: 1.3 }
];
const BEG_FAIL = [
    'Nadie te dio nada',
    'Te miraron feo y no te dieron nada',
    'Intentaste pedir pero te ignoraron',
    'La policía te dijo que te fueras',
    'Un perro te ladró y saliste corriendo',
    'Se te cayó el vaso de las monedas'
];

const command: Command = {
    name: 'beg',
    aliases: ['pedir', 'mendigar', 'limosna'],
    description: 'Pide monedas a un desconocido',
    category: 'economy',
    async execute(ctx) {
        if (ctx.isGroup && !(await checkGroupEconomy(ctx))) {
            return await ctx.message.reply({ text: styleText('ꕢ El sistema de economía está desactivado en este grupo.') });
        }
        
        const jid = ctx.sender;
        if (!jid) return;

        const currencyName = await getCurrencyName(ctx);
        const COOLDOWN = 45 * 1000;
        const BASE_REWARD = Math.floor(Math.random() * 800) + 200;
        
        let userData = await ctx.db.getUser(jid);
        if (!userData) {
            userData = await ctx.db.upsertUser({ jid, lid: ctx.sender, lastSeen: Date.now() });
        }
        const economy = userData.economy || getDefaultEconomy();
        const lastBeg = economy.lastBeg || 0;
        const cooldown = getCooldown(lastBeg, COOLDOWN);
        
        if (cooldown > 0) {
            return await ctx.message.reply({ text: styleText(
                `ꕢ Ya pediste dinero hace poco.\nVuelve en: ${formatTime(cooldown)}`
            ) });
        }

        const success = Math.random() > 0.25;
        if (success) {
            const result = getRandom(BEG_SUCCESS);
            const reward = Math.floor(BASE_REWARD * result.multi);
            const currentCoins = economy.coins || 0;
            
            await ctx.db.updateUserEconomy(jid, {
                'economy.lastBeg': Date.now(),
                'economy.coins': currentCoins + reward
            });
            
            await ctx.message.reply({ text: styleText(
                `${result.emoji} ${result.text} *¥${formatNumber(reward)}* ${currencyName}!\n` +
                `💰 Balance: ¥${formatNumber(currentCoins + reward)}`
            ) });
        } else {
            await ctx.db.updateUserEconomy(jid, { 'economy.lastBeg': Date.now() });
            const fail = getRandom(BEG_FAIL);
            await ctx.message.reply({ text: styleText(`😔 ${fail}.\nNo ganaste nada esta vez.`) });
        }
    }
};

export default command;