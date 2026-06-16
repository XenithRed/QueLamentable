import qrcode from 'qrcode-terminal';
import { Bot, Utils } from '@jzszdznzzl/wabotjs';
import type { Contact } from 'baileys';
import { initDatabase } from '../database/index.js';
import { appConfig, paths } from '../config/index.js';
import { CommandHandler } from './CommandHandler.js';
import { getCommandCount, loadCommands } from './CommandRegistry.js';
import { createLoader } from '../utils/loader.js';
import {
  printBanner,
  printConnected,
  printError,
  printOtpHeader,
  printQrHeader,
} from '../utils/banner.js';
import { sleep } from '../utils/index.js';

export class AlyaBot {
  readonly #bot: Bot;
  readonly #handler: CommandHandler;
  #ready = false;

  constructor() {
    loadCommands();
    this.#bot = new Bot(appConfig.botId, paths.session);
    this.#handler = new CommandHandler(this.#bot);
    this.#bindEvents();
  }

  get bot(): Bot {
    return this.#bot;
  }

  get handler(): CommandHandler {
    return this.#handler;
  }

  get isReady(): boolean {
    return this.#ready;
  }

  async bootstrap(): Promise<void> {
    printBanner();

    const loader = createLoader('Preparando sistemas...');

    await loader.run([
      {
        label: 'Cargando configuración del entorno',
        task: async () => {
          await sleep(350);
        },
      },
      {
        label: 'Inicializando base de datos',
        task: async () => {
          await initDatabase();
          await sleep(300);
        },
      },
      {
        label: 'Inicializando núcleo del bot',
        task: async () => {
          await sleep(300);
        },
      },
      {
        label: 'Cargando comandos',
        task: async () => {
          loadCommands();
          await sleep(400);
        },
      },
      {
        label: `Registrando ${getCommandCount()} comando(s) activo(s)`,
        task: async () => {
          await sleep(250);
        },
      },
      {
        label: 'Iniciando sistemas de mensajería',
        task: async () => {
          await sleep(300);
        },
      },
      {
        label: 'Conectando con WhatsApp',
        task: async () => {
          await this.#bot.login(appConfig.phone);
        },
      },
    ]);
  }

  #bindEvents(): void {
    const altPrefixes = appConfig.prefixes.filter((prefix) => prefix !== '/');

    this.#bot
      .setPrefix('/')
      .onError(async (error) => {
        printError('Error del bot', error);
      })
      .onQR(async (qr) => {
        printQrHeader();
        qrcode.generate(qr, { small: true });
        console.log('\n');
      })
      .onOTP(async (code) => {
        printOtpHeader(code);
      })
      .onOpen(async (user: Contact) => {
        const lid = Utils.resolveLID(user.lid, user.id, user.phoneNumber);
        if (lid) {
          this.#handler.addOwner(lid);
        }

        this.#ready = true;
        printConnected(user.name ?? user.notify ?? undefined);
      })
      .onClose(async (err) => {
        this.#ready = false;
        printError('Conexión cerrada', err);
      })
      .onCommand(async (message, prefix, name, args) => {
        await this.#handler.dispatch(message, prefix, name, args);
      })
      .onMessage(async (message) => {
        await this.#handler.runMiddleware(message);
        if (!message.text?.trim()) return;
        await this.#handler.handle(message, altPrefixes);
      });
  }
}

export function createBot(): AlyaBot {
  return new AlyaBot();
}

export { paths, appConfig };
