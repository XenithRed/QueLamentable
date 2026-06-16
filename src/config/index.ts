import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import './env.js';

loadEnv();

const DEFAULT_PREFIXES = ['.', '#', '/', ':?'] as const;

function parsePrefixes(raw: string | undefined): string[] {
  if (!raw?.trim()) return [...DEFAULT_PREFIXES];

  const parsed = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : [...DEFAULT_PREFIXES];
}

export const appConfig = {
  name: 'Alya ForNew',
  creator: 'Tzar',
  version: '1.0.0',
  botId: process.env.BOT_ID ?? 'alya-fornew',
  dataDir: path.resolve(process.env.BOT_DATA_DIR ?? './data'),
  phone: process.env.BOT_PHONE?.trim() || undefined,
  prefixes: parsePrefixes(process.env.BOT_PREFIXES),
} as const;

export const paths = {
  root: process.cwd(),
  src: path.join(process.cwd(), 'src'),
  commands: path.join(process.cwd(), 'src', 'commands'),
  data: appConfig.dataDir,
  session: path.join(appConfig.dataDir, appConfig.botId),
} as const;

export { getDatabaseURI, getDatabaseName, maskMongoUri, normalizeMongoUri } from './mongo.js';
