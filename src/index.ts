import { createBot } from './core/index.js';
import { printError } from './utils/banner.js';

async function main(): Promise<void> {
  const alya = createBot();
  await alya.bootstrap();
}

main().catch((error: unknown) => {
  printError('Fallo fatal al iniciar Alya ForNew', error);
  process.exit(1);
});
