import { getDatabaseName, getDatabaseURI } from '../config/index.js';
import { DatabaseService } from './DatabaseService.js';

let instance: DatabaseService | null = null;

export function getDatabase(): DatabaseService {
  if (!instance) {
    instance = new DatabaseService(getDatabaseURI(), getDatabaseName());
  }
  return instance;
}

export async function initDatabase(): Promise<DatabaseService> {
  const db = getDatabase();
  await db.init();
  return db;
}

export type { GroupDocument, UserDocument } from './types.js';
export { DatabaseService };
