import type { Command } from '../../types/command.js';
import { formatNumber, getCooldown, formatTime, styleText } from '../../utils/helpers.js';
import { checkGroupEconomy, getCurrencyName, getDefaultEconomy } from '../../utils/economy.js';

interface CrimeAction {
    text: string;
    risk: number;
    reward: number;
}

const ACTIONS: CrimeAction[] = [
    { text: 'Robar', risk: 5, reward: 100 }, { text: 'Hackear', risk: 15, reward: 500 },
    { text: 'Estafar a', risk: 10, reward: 300 }, { text: 'Secuestrar', risk: 30, reward: 1000 },
    { text: 'Asaltar', risk: 20, reward: 600 }, { text: 'Falsificar', risk: 15, reward: 400 },
    { text: 'Traficar con', risk: 35, reward: 1500 }, { text: 'Vandalizar', risk: 5, reward: 150 },
    { text: 'Extorsionar a', risk: 25, reward: 700 }, { text: 'Invadir', risk: 30, reward: 900 },
    { text: 'Saquear', risk: 15, reward: 350 }, { text: 'Infiltrarse en', risk: 40, reward: 2000 },
    { text: 'Sabotear', risk: 20, reward: 550 }, { text: 'Contrabandear', risk: 30, reward: 800 },
    { text: 'Plagiar', risk: 5, reward: 50 }, { text: 'Lavar dinero de', risk: 50, reward: 2500 }
];

const TARGETS: CrimeAction[] = [
    { text: 'un banco', risk: 25, reward: 5000 }, { text: 'una tienda de dulces', risk: 5, reward: 50 },
    { text: 'la NASA', risk: 40, reward: 10000 }, { text: 'un anciano', risk: 5, reward: 200 },
    { text: 'un servidor de Discord', risk: 10, reward: 1000 }, { text: 'la billetera de Elon Musk', risk: 35, reward: 8000 },
    { text: 'un camión de helados', risk: 10, reward: 150 }, { text: 'el Pentágono', risk: 50, reward: 15000 },
    { text: 'un McDonald\'s', risk: 5, reward: 100 }, { text: 'una convención de Furros', risk: 15, reward: 500 },
    { text: 'la Deep Web', risk: 30, reward: 2000 }, { text: 'un casino ilegal', risk: 35, reward: 4000 },
    { text: 'la fábrica de chocolate', risk: 15, reward: 800 }, { text: 'un hospital', risk: 20, reward: 1200 },
    { text: 'una escuela primaria', risk: 5, reward: 20 }, { text: 'la casa blanca', risk: 60, reward: 20000 },
    { text: 'un youtuber famoso', risk: 15, reward: 2000 }, { text: 'una granja de bitcoins', risk: 25, reward: 6000 },
    { text: 'la mafia rusa', risk: 70, reward: 30000 }, { text: 'un puesto de tacos', risk: 5, reward: 80 },
    { text: 'la cuenta de OnlyFans de tu tía', risk: 10, reward: 300 }, { text: 'un satélite espía', risk: 45, reward: 12000 },
    { text: 'el Área 51', risk: 65, reward: 25000 }, { text: 'un museo de arte', risk: 35, reward: 9000 },
    { text: 'un yate de lujo', risk: 30, reward: 7000 }, { text: 'la base de datos de la policía', risk: 40, reward: 5000 }
];

const FAILURE_REASONS = [
    'Te resbalaste con una cáscara de plátano.', 'Llegó la policía y te orinaste del miedo.', 'Tu mamá te llamó en medio del acto.', 'Te dio un calambre en la pierna.',
    'Se te olvidó la máscara en casa.', 'El guardia de seguridad era tu ex.', 'Te distrajiste viendo TikToks.', 'Te atacó un perro callejero.',
    'Sonó la alarma de tu celular.', 'Te quedaste dormido en la escena.', 'Un niño te delató por un dulce.', 'El auto de huida no arrancó.',
    'Te confundiste de dirección.', 'Te dio un ataque de risa.', 'Apareció Batman.', 'Se te cayó el internet.',
    'Te hackearon a ti.', 'Te enamoraste de la víctima.', 'Te dio hambre y fuiste a comer.', 'Te dio ansiedad.',
    'Te tropezaste con tu propio pie.', 'Se te cayeron los pantalones.', 'Te reconoció un fan.', 'Te olvidaste qué ibas a hacer.',
    'Te atacaron abejas asesinas.'
];

const SUCCESS_MESSAGES = [
    'Te escapaste con el botín', 'Nadie sospechó nada', 'Fue el crimen perfecto', 'Corriste como Naruto y escapaste', 'Sobornaste al guardia con un café',
    'Hiciste hackear el sistema en segundos', 'Usaste bombas de humo para huir', 'Te hiciste pasar por estatua', 'Engañaste a todos con tu carisma', 'Entraste y saliste como un fantasma'
];

const COOLDOWN_TIME = 10 * 60 * 1000;

const command: Command = {
    name: 'crime',
    aliases: ['crimen', 'rob'],
    description: 'Comete un crimen para ganar monedas',
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
        
        const economy = userData.economy || getDefaultEconomy();
        const lastCrime = economy.lastCrime || 0;
        const cooldown = getCooldown(lastCrime, COOLDOWN_TIME);
        
        if (cooldown > 0) {
            return await ctx.message.reply({ text: styleText(
                `👮 ¡Alto ahí criminal! La policía te está buscando.\n` +
                `Debes esconderte por *${formatTime(cooldown)}* antes de cometer otro crimen.`
            ) });
        }

        const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
        const target = TARGETS[Math.floor(Math.random() * TARGETS.length)];
        const crimeName = `${action.text} ${target.text}`;
        
        const totalRisk = Math.min(90, action.risk + target.risk + Math.floor(Math.random() * 10));
        const baseReward = action.reward + target.reward;
        const variation = (Math.random() * 0.4) + 0.8;
        const finalReward = Math.floor(baseReward * variation);
        
        const roll = Math.floor(Math.random() * 100) + 1;
        const successChance = 100 - totalRisk;
        
        if (roll <= successChance) {
            const successMsg = SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)];
            const currentCoins = economy.coins || 0;
            
            await ctx.db.updateUserEconomy(jid, {
                'economy.coins': currentCoins + finalReward,
                'economy.lastCrime': Date.now()
            });
            
            const message = styleText(
                `🔫 *¡CRIMEN EXITOSO!*\n\n` +
                `> Actividad » ${crimeName}\n` +
                `> Riesgo » ${totalRisk}%\n` +
                `> Ganancia » +${formatNumber(finalReward)} ${currencyName}\n\n` +
                `_${successMsg}_`
            );
            await ctx.message.reply({ text: message });
        } else {
            const failReason = FAILURE_REASONS[Math.floor(Math.random() * FAILURE_REASONS.length)];
            const fine = Math.floor(finalReward * 0.2);
            const currentCoins = economy.coins || 0;
            const lostAmount = Math.min(currentCoins, fine);
            
            await ctx.db.updateUserEconomy(jid, {
                'economy.coins': currentCoins - lostAmount,
                'economy.lastCrime': Date.now()
            });
            
            const message = styleText(
                `🚔 *¡TE ATRAPARON!*\n\n` +
                `> Actividad » ${crimeName}\n` +
                `> Causa » ${failReason}\n` +
                `> Pérdida » -${formatNumber(lostAmount)} ${currencyName}\n\n` +
                `_La próxima vez ten más cuidado_`
            );
            await ctx.message.reply({ text: message });
        }
    }
};

export default command;