import type { Command } from '../../types/command.js';
import { styleText } from '../../utils/helpers.js';
import { uploadToSoblendR2 } from '../../utils/upload.js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CHARACTERS_PATH = join(__dirname, '../../../characters.json');

const WAIFU_PATTERN = /❀ Nombre » \s*([\s\S]*?)\s*\n\s*⚥ Género » \s*([\s\S]*?)\s*\n\s*✰ Valor » \s*([\s\S]*?)\s*\n\s*♡ Estado » \s*([\s\S]*?)\s*\n\s*❖ Fuente » \s*([\s\S]*?)(?:\n|$)/i;

interface WaifuData {
    id: string;
    name: string;
    gender: string;
    value: string;
    status: string;
    source: string;
    img: string[];
    vid: string[];
    user: string | null;
    votes: number;
    __uuid: string;
    updatedAt: string;
    createdAt: string;
}

function cleanText(text: string): string {
    return text
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/[\u200c\u200d\u2060\ufeff]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeStatus(status: string): string {
    const cleaned = cleanText(status);
    if (/reclamado/i.test(cleaned)) {
        return 'Libre';
    }
    return cleaned;
}

function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function readCharacters(): Promise<WaifuData[]> {
    try {
        const data = readFileSync(CHARACTERS_PATH, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function writeCharacters(characters: WaifuData[]): Promise<void> {
    writeFileSync(CHARACTERS_PATH, JSON.stringify(characters, null, 2), 'utf-8');
}

const command: Command = {
    name: 'waifu-auto',
    description: 'Procesa mensajes reenviados con formato de waifu',
    category: 'admin',
    async execute() {},
    async before(ctx) {
        if (!ctx.message.text) return;
        
        const match = ctx.message.text.match(WAIFU_PATTERN);
        if (!match) return;
        
        const imageMessage = ctx.message.mimetype?.startsWith('image/') ? ctx.message : 
                            (ctx.message.quoted?.mimetype?.startsWith('image/') ? ctx.message.quoted : null);
        
        if (!imageMessage) {
            await ctx.message.reply({ 
                text: styleText('❌ Debes reenviar el mensaje con una imagen adjunta.') 
            });
            return;
        }
        
        try {
            const buffer = await imageMessage.download();
            if (!buffer) {
                await ctx.message.reply({ 
                    text: styleText('❌ No pude descargar la imagen.') 
                });
                return;
            }
            
            const imageUrl = await uploadToSoblendR2(buffer);
            
            const characters = await readCharacters();
            const nextId = String(characters.length + 1);
            
            const now = new Date().toISOString();
            
            const newWaifu: WaifuData = {
                id: nextId,
                name: cleanText(match[1]),
                gender: cleanText(match[2]),
                value: cleanText(match[3]),
                status: normalizeStatus(match[4]),
                source: cleanText(match[5]),
                img: [imageUrl],
                vid: [],
                user: null,
                votes: 0,
                __uuid: generateUUID(),
                updatedAt: now,
                createdAt: now
            };
            
            characters.push(newWaifu);
            await writeCharacters(characters);
            
            await ctx.message.reply({ 
                text: styleText(`✅ Waifu *${newWaifu.name}* agregada correctamente.\nEstado: *${newWaifu.status}*\nFuente: *${newWaifu.source}*`) 
            });
            
            console.log(`[WaifuAuto] Agregado: ${newWaifu.name} (${newWaifu.id})`);
        } catch (error) {
            console.error('[WaifuAuto] Error:', error);
            await ctx.message.reply({ 
                text: styleText('❌ Ocurrió un error al procesar el waifu.') 
            });
        }
    }
};

export default command;