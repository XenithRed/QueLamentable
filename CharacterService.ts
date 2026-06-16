import fs from 'node:fs/promises';
import path from 'node:path';
import { crypto } from 'node:crypto';

export interface Character {
    id: string;
    name: string;
    gender: string;
    value: string;
    source: string;
    img: string[];
    vid: string[];
    user: string | null;
    status: string;
    votes: number;
    __uuid: string;
    updatedAt: string;
    createdAt: string;
}

export class CharacterService {
    private static filePath = path.join(process.cwd(), 'characters.json');

    static async addCharacter(data: Partial<Character>): Promise<void> {
        let characters: Character[] = [];
        try {
            const content = await fs.readFile(this.filePath, 'utf-8');
            characters = JSON.parse(content);
        } catch (e) {
            characters = [];
        }

        // Obtener el ID más alto y sumar 1
        const lastId = characters.reduce((max, char) => Math.max(max, parseInt(char.id) || 0), 0);
        
        const newCharacter: Character = {
            id: (lastId + 1).toString(),
            name: data.name || 'Desconocido',
            gender: data.gender || 'Desconocido',
            value: data.value || '0',
            source: data.source || 'Desconocida',
            img: data.img || [],
            vid: [],
            user: null,
            status: 'Libre',
            votes: 0,
            __uuid: (globalThis as any).crypto?.randomUUID() || Date.now().toString(),
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        characters.push(newCharacter);
        await fs.writeFile(this.filePath, JSON.stringify(characters, null, 2), 'utf-8');
    }
}