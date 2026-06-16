import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto'; // Importación correcta para randomUUID

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

    private static async readCharacters(): Promise<Character[]> {
        try {
            const content = await fs.readFile(this.filePath, 'utf-8');
            return JSON.parse(content);
        } catch (e: any) {
            if (e.code === 'ENOENT') { // Si el archivo no existe, devuelve un array vacío
                return [];
            }
            throw e; // Relanza otros errores
        }
    }

    private static async writeCharacters(characters: Character[]): Promise<void> {
        await fs.writeFile(this.filePath, JSON.stringify(characters, null, 2), 'utf-8');
    }

    static async getLastCharacterId(): Promise<number> {
        const characters = await this.readCharacters();
        return characters.reduce((max, char) => Math.max(max, parseInt(char.id) || 0), 0);
    }

    static async addCharacter(data: Partial<Character>): Promise<string> { // Ahora devuelve el ID del nuevo personaje
        const characters = await this.readCharacters();

        const newId = (await this.getLastCharacterId() + 1).toString();
        
        const newCharacter: Character = {
            id: newId,
            name: data.name || 'Desconocido',
            gender: data.gender || 'Desconocido',
            value: data.value || '0',
            source: data.source || 'Desconocida',
            img: data.img || [],
            vid: [],
            user: null,
            status: 'Libre', // Forzamos a Libre como solicitaste
            votes: 0,
            __uuid: randomUUID(), // Usar randomUUID directamente
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        characters.push(newCharacter);
        await this.writeCharacters(characters);
        return newId; // Devuelve el ID del personaje recién añadido
    }
}