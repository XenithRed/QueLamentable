import { MongoClient, type Collection, type Document } from 'mongodb';
import { getDatabaseName, maskMongoUri } from '../config/mongo.js';
import type {
  GroupDocument,
  UserDocument,
} from './types.js';

export class DatabaseService {
  readonly #uri: string;
  readonly #dbName: string;
  #client: MongoClient | null = null;
  #users: Collection<UserDocument> | null = null;
  #groups: Collection<GroupDocument> | null = null;

  constructor(uri: string, dbName = getDatabaseName()) {
    this.#uri = uri;
    this.#dbName = dbName;
  }

  async init(): Promise<void> {
    try {
      this.#client = new MongoClient(this.#uri, {
        serverSelectionTimeoutMS: 15_000,
        connectTimeoutMS: 15_000,
      });
      await this.#client.connect();
      const db = this.#client.db(this.#dbName);
      this.#users = db.collection<UserDocument>('users');
      this.#groups = db.collection<GroupDocument>('groups');
      await this.#ensureIndexes();
    } catch (error) {
      const cause = error as Error & { code?: string; cause?: { code?: string } };
      const code = cause.code ?? cause.cause?.code;
      let hint = '';

      if (this.#uri.startsWith('mongodb://') && this.#uri.includes('.mongodb.net')) {
        hint = '\n• Atlas requiere mongodb+srv://, no mongodb://';
      } else if (code === 'ECONNREFUSED' || code === 'ENOTFOUND') {
        hint = [
          '\n• Verifica internet y DNS (prueba cambiar DNS a 8.8.8.8)',
          '\n• En Atlas → Network Access, agrega tu IP o 0.0.0.0/0',
          '\n• Si falla querySrv, usa la connection string estándar de Atlas (sin +srv)',
        ].join('');
      }

      throw new Error(
        `No se pudo conectar a MongoDB (${maskMongoUri(this.#uri)})${hint}`,
        { cause: error },
      );
    }
  }

  async #ensureIndexes(): Promise<void> {
    if (this.#users) {
      await this.#users.createIndex({ jid: 1 }, { unique: true });
    }
    if (this.#groups) {
      await this.#groups.createIndex({ jid: 1 }, { unique: true });
    }
  }

  async getUser(jid: string): Promise<UserDocument | null> {
    if (!this.#users) throw new Error('Database not initialized');
    return this.#users.findOne({ jid }) ?? null;
  }

  async getUserByLid(lid: string): Promise<UserDocument | null> {
    if (!this.#users) throw new Error('Database not initialized');
    return this.#users.findOne({ lid }) ?? null;
  }

  async getUserCount(): Promise<number> {
    if (!this.#users) throw new Error('Database not initialized');
    return this.#users.countDocuments();
  }

  async updateUserEconomy(jid: string, updates: Record<string, unknown>): Promise<UserDocument | null> {
    if (!this.#users) throw new Error('Database not initialized');
    const existing = await this.#users.findOne({ jid });
    if (!existing) return null;

    const now = Date.now();
    const updateData: Document = { updatedAt: now };
    const currentEconomy = existing.economy || {
      coins: 0,
      bank: 0,
      lastWork: 0,
      lastDaily: 0,
      lastCrime: 0,
      lastFish: 0,
      lastBeg: 0,
      lastSlut: 0,
      dailyStreak: 0,
      fishCaught: 0
    };

    for (const [key, value] of Object.entries(updates)) {
      if (key.startsWith('economy.')) {
        const economyKey = key.slice(8) as keyof typeof currentEconomy;
        currentEconomy[economyKey] = value as any;
      } else if (key === 'inventory') {
        updateData.inventory = value;
      } else {
        (updateData as Record<string, unknown>)[key] = value;
      }
    }

    updateData.economy = currentEconomy;
    await this.#users.updateOne({ jid }, { $set: updateData });
    return { ...existing, ...updateData };
  }

  async getTopUsers(limit: number): Promise<Array<{ jid: string; coins: number; bank: number; total: number; name?: string }>> {
    if (!this.#users) throw new Error('Database not initialized');
    const users = await this.#users.find(
      { 'economy.coins': { $exists: true, $gt: 0 } },
      { sort: { 'economy.coins': -1 as const }, limit }
    ).toArray();

    return users.map(u => ({
      jid: u.jid,
      coins: u.economy?.coins ?? 0,
      bank: u.economy?.bank ?? 0,
      total: (u.economy?.coins ?? 0) + (u.economy?.bank ?? 0),
      name: u.name
    }));
  }

  async upsertUser(user: Partial<UserDocument> & { jid: string }): Promise<UserDocument> {
    if (!this.#users) throw new Error('Database not initialized');
    const now = Date.now();
    const existing = await this.#users.findOne({ jid: user.jid });

    if (existing) {
      const update: Document = {};
      if (user.lid !== undefined) update.lid = user.lid;
      if (user.name !== undefined) update.name = user.name;
      if (user.settings !== undefined) {
        update.settings = { ...existing.settings, ...user.settings };
      }
      if (user.lastSeen !== undefined) update.lastSeen = user.lastSeen;
      update.updatedAt = now;

      await this.#users.updateOne({ jid: user.jid }, { $set: update });
      return { ...existing, ...update, jid: user.jid };
    }

    const created: UserDocument = {
      jid: user.jid,
      lid: user.lid,
      name: user.name,
      settings: user.settings ?? {},
      createdAt: now,
      updatedAt: now,
      lastSeen: user.lastSeen ?? now,
    };

    await this.#users.insertOne(created);
    return created;
  }

  async getGroup(jid: string): Promise<GroupDocument | null> {
    if (!this.#groups) throw new Error('Database not initialized');
    return this.#groups.findOne({ jid }) ?? null;
  }

  async ensureGroup(jid: string, name?: string): Promise<GroupDocument> {
    if (!this.#groups) throw new Error('Database not initialized');
    const now = Date.now();
    const existing = await this.#groups.findOne({ jid });

    if (existing) {
      if (name && existing.name !== name) {
        await this.#groups.updateOne(
          { jid },
          { $set: { name, updatedAt: now } }
        );
        existing.name = name;
        existing.updatedAt = now;
      }
      return existing;
    }

    const created: GroupDocument = {
      jid,
      name,
      settings: { antilink: false, economy: false, currencyName: 'coins' },
      members: [],
      createdAt: now,
      updatedAt: now,
    };

    await this.#groups.insertOne(created);
    return created;
  }

  async syncGroupMembers(jid: string, members: string[], name?: string): Promise<void> {
    if (!this.#groups) throw new Error('Database not initialized');
    const now = Date.now();

    await this.#groups.updateOne(
      { jid },
      {
        $set: {
          members,
          updatedAt: now,
          ...(name ? { name } : {}),
        },
        $setOnInsert: {
          createdAt: now,
          settings: { antilink: false, economy: false, currencyName: 'coins' },
        },
      },
      { upsert: true },
    );
  }

  async updateGroup(jid: string, updates: Record<string, unknown>): Promise<GroupDocument> {
    if (!this.#groups) throw new Error('Database not initialized');
    const now = Date.now();

    await this.#groups.updateOne(
      { jid },
      { $set: { ...updates, updatedAt: now } }
    );

    return this.ensureGroup(jid);
  }
}