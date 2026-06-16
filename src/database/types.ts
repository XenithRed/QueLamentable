export interface UserSettings {
  banned?: boolean;
}

export interface UserDocument {
  _id?: string;
  jid: string;
  lid?: string;
  name?: string;
  settings: UserSettings;
  economy?: {
    coins: number;
    bank: number;
    lastWork: number;
    lastDaily: number;
    lastCrime: number;
    lastFish: number;
    lastBeg: number;
    lastSlut: number;
    dailyStreak: number;
    fishCaught: number;
  };
  inventory?: Array<{ id: string; count: number }>;
  createdAt: number;
  updatedAt: number;
  lastSeen: number;
}

export interface GroupSettings {
  antilink: boolean;
  economy: boolean;
  currencyName: string;
}

export interface GroupDocument {
  _id?: string;
  jid: string;
  name?: string;
  settings: GroupSettings;
  members: string[];
  createdAt: number;
  updatedAt: number;
}
