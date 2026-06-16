import { appConfig } from '../config/index.js';

export interface ParsedCommand {
  prefix: string;
  name: string;
  args: string[];
}

export function normalizeInput(text: string): string {
  return text
    .replace(/@[\d-]{5,}/g, '')
    .replace(/\u200e|\u200f|\u202a|\u202b|\u202c|\u202d|\u202e/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseCommand(text: string | undefined, prefixes: readonly string[]): ParsedCommand | null {
  if (!text) return null;

  const trimmed = normalizeInput(text);
  const sortedPrefixes = [...prefixes].sort((a, b) => b.length - a.length);
  const prefix = sortedPrefixes.find((value) => trimmed.startsWith(value));
  if (!prefix) return null;

  const body = trimmed.slice(prefix.length).trim();
  if (!body) return null;

  const [rawName, ...args] = body.split(/\s+/);
  const name = rawName.toLowerCase();

  if (!name) return null;

  return { prefix, name, args };
}

export function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function normalizeCommandName(name: string): string {
  return name.toLowerCase().trim();
}

export function isOwner(sender: string | undefined, owners: Set<string>): boolean {
  return Boolean(sender && owners.has(sender));
}

export const prefixes = appConfig.prefixes;
