import chalk from 'chalk';
import { Utils } from '@jzszdznzzl/wabotjs';
import type { Bot, Message } from '../types/command.js';
import type { CommandContext } from '../types/command.js';
import { getCommand, getMiddlewareCommands } from './CommandRegistry.js';
import { getDatabase } from '../database/index.js';
import { parseCommand } from '../utils/index.js';
import { isAdmin, isOwner, styleText } from '../utils/helpers.js';
import { resolvePnJid } from '../utils/jid.js';
import { appConfig } from '../config/index.js';
import { UploadService } from './UploadService.js';
import { CharacterService } from './CharacterService.js';

export class CommandHandler {
  readonly #bot: Bot;
  readonly #owners = new Set<string>();
  readonly #cooldowns = new Map<string, number>();
  readonly #db = getDatabase();

  constructor(bot: Bot) {
    this.#bot = bot;
  }

  get owners(): Set<string> {
    return this.#owners;
  }

  get db() {
    return this.#db;
  }

  addOwner(lid: string): void {
    this.#owners.add(lid);
  }

  async runMiddleware(message: Message): Promise<void> {
    await this.#trackEntities(message);
    await this.#autoImportCharacter(message);

    const ctx = this.#buildContext(message, '', '', []);
    const middleware = getMiddlewareCommands();

    for (const command of middleware) {
      if (!command.before) continue;
      try {
        await command.before(ctx);
      } catch (error) {
        console.error(Utils.toError(error));
      }
    }
  }

  async #autoImportCharacter(message: Message): Promise<void> {
    const text = message.text || '';
    // Patrón para detectar la plantilla
    const pattern = /❀ Nombre » (.*?)\n⚥ Genero » (.*?)\n✰ Valor » (.*?)\n♡ Estado » (.*?)\n❖ Fuente » (.*)/s;
    
    if (pattern.test(text) && message.type === 'imageMessage') { 
      const match = text.match(pattern);
      if (!match) return;

      try {
        console.log('[AutoImport] Detectada plantilla de personaje, procesando...');
        
        // Extraer y limpiar datos (quitar asteriscos y espacios)
        const clean = (str: string) => str.replace(/\*/g, '').trim();
        
        const name = clean(match[1]);
        const gender = clean(match[2]);
        const value = clean(match[3]);
        const source = clean(match[5]);

        // Descargar imagen
        const buffer = await message.download();
        if (!buffer) return;

        // Subir a R2
        const imageUrl = await UploadService.uploadToSoblendR2(buffer);

        // Guardar en JSON
        const newCharacterId = await CharacterService.addCharacter({ // CharacterService ahora devuelve el ID
            name,
            gender,
            value,
            source,
            img: [imageUrl],
            status: 'Libre' // Forzamos a Libre como solicitaste
        });

        await message.reply({ 
            text: styleText(`✅ *Personaje importado con éxito*\n\n> ❀ *Nombre:* ${name}\n> ✰ *ID asignado:* ${newCharacterId}\n> ❖ *URL:* ${imageUrl}`) 
        }).catch(() => undefined);

      } catch (error) {
        console.error('[AutoImport] Error:', error);
      }
    }
  }

  // El método #getLastId() se ha movido a CharacterService

  async handle(message: Message, prefixes: readonly string[] = appConfig.prefixes): Promise<boolean> {
    const parsed = parseCommand(message.text, prefixes);
    if (!parsed) return false;

    return this.dispatch(message, parsed.prefix, parsed.name, parsed.args);
  }

  async dispatch(
    message: Message,
    prefix: string,
    name: string,
    args: string[],
  ): Promise<boolean> {
    const command = getCommand(name);
    if (!command) {
      await message
        .reply({ text: `❌ El comando *${prefix}${name}* no existe.` })
        .catch(() => undefined);
      return true;
    }

    console.log(
      chalk.dim(
        `  ↳ Comando: ${chalk.cyan(`${prefix}${name}`)} ${args.length ? chalk.gray(args.join(' ')) : ''}`,
      ),
    );

    const ctx = this.#buildContext(message, prefix, name, args);

    if (command.groupOnly && !ctx.isGroup) {
      await message.reply({ text: styleText('ꕢ Este comando solo funciona en grupos.') }).catch(() => undefined);
      return true;
    }

    if (command.adminOnly) {
      const allowed =
        isOwner(ctx.sender, this.#owners) ||
        (ctx.isGroup && (await isAdmin(this.#bot.sock, ctx.chatId, ctx.sender)));

      if (!allowed) {
        await message.reply({ text: styleText('ꕢ Solo los administradores pueden usar este comando.') }).catch(() => undefined);
        return true;
      }
    }

    const cooldownKey = `${message.sender ?? message.chat}:${command.name}`;
    const now = Date.now();
    const expiresAt = this.#cooldowns.get(cooldownKey) ?? 0;

    if (command.cooldown && now < expiresAt) {
      const remaining = Math.ceil((expiresAt - now) / 1000);
      await message.reply({
        text: styleText(`⏳ Espera *${remaining}s* antes de usar *${prefix}${command.name}* de nuevo.`),
      }).catch(() => undefined);
      return true;
    }

    try {
      await message.read().catch(() => undefined);
      await command.execute(ctx);

      if (command.cooldown) {
        this.#cooldowns.set(cooldownKey, now + command.cooldown);
      }
    } catch (error) {
      console.error(Utils.toError(error));
      await message.reply({ text: styleText('❌ Ocurrió un error al ejecutar el comando.') }).catch(() => undefined);
    }

    return true;
  }

  #buildContext(
    message: Message,
    prefix: string,
    name: string,
    args: string[],
  ): CommandContext {
    const senderPn = resolvePnJid(this.#bot, message.sender);

    return {
      message,
      prefix,
      name,
      args,
      bot: this.#bot,
      owners: this.#owners,
      db: this.#db,
      isGroup: message.isGroup() ?? false,
      chatId: message.chat,
      sender: message.sender,
      senderPn,
      body: message.text,
    };
  }

  async #trackEntities(message: Message): Promise<void> {
    const senderPn = resolvePnJid(this.#bot, message.sender);

    if (senderPn) {
      await this.#db.upsertUser({
        jid: senderPn,
        lid: message.sender,
        lastSeen: Date.now(),
      });
    }

    if (!message.isGroup()) return;

    try {
      const metadata = await this.#bot.sock.groupMetadata(message.chat);
      const memberJids = (metadata.participants as any[])
        .map((participant: any) => resolvePnJid(this.#bot, participant.phoneNumber ?? participant.id))
        .filter((jid: any): jid is string => Boolean(jid));

      await this.#db.syncGroupMembers(message.chat, memberJids, metadata.subject);
    } catch (error) {
      console.error('[DB] Error sincronizando grupo:', Utils.toError(error));
    }
  }
}
