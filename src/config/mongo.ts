const QUOTE_PATTERN = /^["'“”‘’`]+|["'“”‘’`]+$/g;

export function normalizeMongoUri(raw: string | undefined): string {
  if (!raw?.trim()) {
    throw new Error(
      'MONGODB_URI no está definida. Agrega tu connection string de Atlas en el archivo .env',
    );
  }

  let uri = raw.replace(/^\uFEFF/, '').trim();
  uri = uri.replace(/^`|`$/g, '').trim();
  uri = uri.replace(QUOTE_PATTERN, '').trim();

  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error(
      [
        'MONGODB_URI inválida: debe empezar con mongodb:// o mongodb+srv://',
        `Inicio detectado: ${JSON.stringify(uri.slice(0, 48))}`,
        'Tip: en Atlas usa mongodb+srv:// y pon la URI entre comillas en .env',
      ].join('\n'),
    );
  }

  return uri;
}

export function getDatabaseURI(): string {
  return normalizeMongoUri(process.env.MONGODB_URI);
}

export function getDatabaseName(): string {
  const fromEnv = process.env.MONGODB_DB_NAME?.trim();
  if (fromEnv) return fromEnv;

  const uri = getDatabaseURI();
  const match = uri.match(/mongodb(?:\+srv)?:\/\/[^/]+\/([^/?]+)/);
  const dbName = match?.[1]?.trim();
  if (dbName) return dbName;

  return 'alya';
}

export function maskMongoUri(uri: string): string {
  return uri.replace(/\/\/([^:@/]+):([^@/]+)@/, '//$1:***@');
}
