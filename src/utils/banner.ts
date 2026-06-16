import figlet from 'figlet';
import gradient from 'gradient-string';
import boxen from 'boxen';
import chalk from 'chalk';
import { appConfig } from '../config/index.js';

const brandGradient = gradient(['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3']);

export function printBanner(): void {
  console.clear();

  const title = figlet.textSync('Alya ForNew', {
    font: 'Standard',
    horizontalLayout: 'default',
  });

  const subtitle = brandGradient.multiline('By Tzar | Yeah');

  console.log(
    boxen(`${brandGradient.multiline(title)}\n\n${subtitle}`, {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'magenta',
      title: chalk.bold.white(' WhatsApp Bot '),
      titleAlignment: 'center',
    }),
  );

  console.log(
    chalk.dim(
      `  ${chalk.cyan('Creator:')} ${chalk.white.bold(appConfig.creator)}  ${chalk.gray('|')}  ${chalk.cyan('Version:')} ${chalk.white(appConfig.version)}`,
    ),
  );
  console.log();
}

export function printQrHeader(): void {
  console.log(chalk.bold.cyan('\n  Escanea el código QR con WhatsApp:\n'));
}

export function printOtpHeader(code: string): void {
  console.log(
    boxen(chalk.bold.white(`Código OTP: ${chalk.green(code)}`), {
      padding: 1,
      borderColor: 'green',
      title: ' Pairing Code ',
      titleAlignment: 'center',
    }),
  );
}

export function printConnected(userName?: string | null): void {
  console.log(
    chalk.green.bold(
      `\n  ✔ Bot conectado${userName ? ` como ${chalk.white(userName)}` : ''}\n`,
    ),
  );
}

export function printError(message: string, error?: unknown): void {
  console.error(chalk.red.bold(`\n  ✖ ${message}`));
  if (error) console.error(error);
}
