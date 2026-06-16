import ora, { type Ora } from 'ora';
import chalk from 'chalk';

export interface BootStep {
  label: string;
  task: () => void | Promise<void>;
}

export class BootLoader {
  #spinner: Ora;

  constructor(text = 'Iniciando Alya ForNew...') {
    this.#spinner = ora({
      text,
      color: 'magenta',
      spinner: 'dots12',
    });
  }

  async run(steps: BootStep[]): Promise<void> {
    for (const [index, step] of steps.entries()) {
      this.#spinner = ora({
        text: chalk.cyan(step.label),
        color: 'magenta',
        spinner: 'dots12',
      }).start();

      await step.task();
      this.#spinner.succeed(chalk.green(` ${step.label}`));

      if (index === steps.length - 1) {
        this.#spinner.stop();
      }
    }
  }

  fail(message: string): void {
    this.#spinner.fail(chalk.red(message));
  }
}

export function createLoader(text?: string): BootLoader {
  return new BootLoader(text);
}
