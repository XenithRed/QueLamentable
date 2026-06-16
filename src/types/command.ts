import type { Contact } from 'baileys';
import type { Bot, Message } from '@jzszdznzzl/wabotjs';
export type { Bot, Message };
import type { DatabaseService } from '../database/DatabaseService.js';

export interface CommandContext {
  message: Message;
  prefix: string;
  name: string;
  args: string[];
  bot: Bot;
  owners: Set<string>;
  db: DatabaseService;
  isGroup: boolean;
  chatId: string;
  sender?: string;
  senderPn?: string;
  body?: string;
}

export interface CommandMeta {
  name: string;
  aliases?: string[];
  description?: string;
  category?: string;
  cooldown?: number;
  groupOnly?: boolean;
  adminOnly?: boolean;
}

export type CommandExecute = (ctx: CommandContext) => Promise<void | unknown>;
export type CommandBefore = (ctx: CommandContext) => Promise<void | unknown>;

export interface Command extends CommandMeta {
  execute: CommandExecute;
  before?: CommandBefore;
}

export interface AlyaBotEvents {
  onReady?: (user: Contact) => void | Promise<void>;
  onClose?: (err: unknown) => void | Promise<void>;
}