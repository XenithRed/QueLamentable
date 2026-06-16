import type { Command } from '../../types/command.js';
import { styleText } from '../../utils/helpers.js';
import { checkGroupEconomy, getCurrencyName, getDefaultEconomy } from '../../utils/economy.js';

interface Card {
    suit: string;
    value: string;
}

const SUITS = ['♠️', '♥️', '♣️', '♦️'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function drawCard(): Card {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const value = VALUES[Math.floor(Math.random() * VALUES.length)];
    return { suit, value };
}

function calculateScore(hand: Card[]): number {
    let score = 0;
    let aces = 0;
    for (const card of hand) {
        if (['J', 'Q', 'K'].includes(card.value)) {
            score += 10;
        } else if (card.value === 'A') {
            aces += 1;
            score += 11;
        } else {
            score += parseInt(card.value);
        }
    }
    while (score > 21 && aces > 0) {
        score -= 10;
        aces -= 1;
    }
    return score;
}

function formatHand(hand: Card[], hideFirst = false): string {
    if (hideFirst) {
        return `[🎴] ${hand.slice(1).map(c => `[${c.value}${c.suit}]`).join(' ')}`;
    }
    return hand.map(c => `[${c.value}${c.suit}]`).join(' ');
}

const command: Command = {
    name: 'blackjack',
    aliases: ['bj', '21'],
    description: 'Juego de blackjack',
    category: 'economy',
    async execute(ctx) {
        const jid = ctx.sender;
        if (!jid) return;

        const bet = parseInt(ctx.args[0]);
        if (!bet || isNaN(bet) || bet <= 0) {
            return await ctx.message.reply({ text: styleText(`ꕢ Uso: *#bj <apuesta>*`) });
        }

        if (ctx.isGroup && !(await checkGroupEconomy(ctx))) {
            return await ctx.message.reply({ text: styleText('ꕢ El sistema de economía está desactivado en este grupo.') });
        }

        let userData = await ctx.db.getUser(jid);
        if (!userData) {
            userData = await ctx.db.upsertUser({ jid, lid: ctx.sender, lastSeen: Date.now() });
        }
        
        const economy = userData.economy || getDefaultEconomy();
        const currencyName = await getCurrencyName(ctx);
        const currentCoins = economy.coins || 0;

        if (currentCoins < bet) {
            return await ctx.message.reply({ text: styleText(`ꕢ No tienes suficientes ${currencyName}.`) });
        }

        const playerHand = [drawCard(), drawCard()];
        const dealerHand = [drawCard(), drawCard()];
        
        const playerScore = calculateScore(playerHand);
        const dealerScore = calculateScore(dealerHand);

        const dealerPlay = (pScore: number, dScore: number, dealerCards: Card[]) => {
            let d = dScore;
            while (d < 17) {
                dealerCards.push(drawCard());
                d = calculateScore(dealerCards);
            }
            
            if (d > 21) {
                return { result: 'win', message: 'ꕣ ¡El dealer se pasó! Ganas.', score: d };
            } else if (pScore > d) {
                return { result: 'win', message: 'ꕣ ¡Tienes mejor mano! Ganas.', score: d };
            } else if (d > pScore) {
                return { result: 'lose', message: 'ꕢ El dealer gana.', score: d };
            } else {
                return { result: 'tie', message: 'ꕢ Empate. Recuperas tu apuesta.', score: d };
            }
        };

        let pScore = playerScore;
        let dScore = dealerScore;

        while (pScore < 21 && Math.random() > 0.3) {
            playerHand.push(drawCard());
            pScore = calculateScore(playerHand);
        }

        let winnings = 0;
        let result = '';
        let message = '';
        let finalDealerScore = dScore;

        if (pScore > 21) {
            result = 'lose';
            message = 'ꕢ ¡Te pasaste de 21!';
            winnings = -bet;
        } else {
            const dealerResult = dealerPlay(pScore, dScore, dealerHand);
            result = dealerResult.result;
            message = dealerResult.message;
            finalDealerScore = dealerResult.score;
            
            if (result === 'blackjack') winnings = Math.floor(bet * 2.5);
            else if (result === 'win') winnings = bet * 2;
            else if (result === 'tie') winnings = bet;
        }

        const newBalance = currentCoins - bet + winnings;
        await ctx.db.updateUserEconomy(jid, { 'economy.coins': newBalance });

        let finalMsg = `╭────── ೀ ──────╮\n│ *BlackJack*\n╰────────────────╯\n\n`;
        finalMsg += `› *Dealer* (${finalDealerScore})\n> ${formatHand(dealerHand, false)}\n\n`;
        finalMsg += `› *Tú* (${pScore})\n> ${formatHand(playerHand)}\n\n`;
        finalMsg += `╭────────────────╮\n│ ${message}\n`;
        if (winnings > 0) finalMsg += `│ 💰 +${winnings.toLocaleString()} ${currencyName}\n`;
        else if (winnings < 0) finalMsg += `│ 💰 -${Math.abs(winnings).toLocaleString()} ${currencyName}\n`;
        finalMsg += `╰────────────────╯`;
        
        await ctx.message.reply({ text: styleText(finalMsg) });
    }
};

export default command;