import type { Command } from '../types/command.js';
import { normalizeCommandName } from '../utils/index.js';
import { commands } from '../commands/index.js';

const registry = new Map<string, Command>();

function register(command: Command): void {
  registry.set(normalizeCommandName(command.name), command);

  for (const alias of command.aliases ?? []) {
    registry.set(normalizeCommandName(alias), command);
  }
}

export function loadCommands(): Command[] {
  registry.clear();

  for (const command of commands) {
    register(command);
  }

  return getAllCommands();
}

export function getCommand(name: string): Command | undefined {
  return registry.get(normalizeCommandName(name));
}

export function getAllCommands(): Command[] {
  const unique = new Map<string, Command>();

  for (const command of registry.values()) {
    unique.set(command.name, command);
  }

  return [...unique.values()];
}

export function getCommandCount(): number {
  return getAllCommands().length;
}

export function getMiddlewareCommands(): Command[] {
  return getAllCommands().filter((command) => typeof command.before === 'function');
}
