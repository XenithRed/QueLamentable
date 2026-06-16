import type { Command } from '../types/command.js';
import help from './help.js';
import { adminCommands } from './admin/index.js';
import { economyCommands } from './economy/index.js';
import { generalCommands } from './general/index.js';

export const downloadCommands: Command[] = generalCommands.filter(
  (command) => command.category === 'downloads',
);

export const commands: Command[] = [
  help,
  ...adminCommands,
  ...economyCommands,
  ...generalCommands,
];

export default commands;
