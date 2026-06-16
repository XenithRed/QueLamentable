import type { Command } from '../../types/command.js';
import balance from './balance.js';
import beg from './beg.js';
import work from './work.js';
import daily from './daily.js';
import crime from './crime.js';
import slut from './slut.js';
import steal from './steal.js';
import fish from './fish.js';
import givecoins from './givecoins.js';
import blackjack from './blackjack.js';
import roulette from './roulette.js';
import deposit from './deposit.js';
import withdraw from './withdraw.js';
import coinflip from './coinflip.js';
import shop from './shop.js';
import inventory from './inventory.js';
import settings from './settings.js';
import setcoins from './setcoins.js';
import info from './info.js';
import board from './board.js';

export const economyCommands: Command[] = [
    balance,
    beg,
    work,
    daily,
    crime,
    slut,
    steal,
    fish,
    givecoins,
    blackjack,
    roulette,
    deposit,
    withdraw,
    coinflip,
    shop,
    inventory,
    settings,
    setcoins,
    info,
    board
];

export default economyCommands;