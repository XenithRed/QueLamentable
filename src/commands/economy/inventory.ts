import type { Command } from '../../types/command.js';
import { styleText } from '../../utils/helpers.js';

const command: Command = {
    name: 'inventory',
    aliases: ['inv', 'bag'],
    description: 'Muestra tu inventario',
    category: 'economy',
    async execute(ctx) {
        const jid = ctx.sender;
        if (!jid) return;

        let userData = await ctx.db.getUser(jid);
        if (!userData) {
            userData = await ctx.db.upsertUser({ jid, lid: ctx.sender, lastSeen: Date.now() });
        }
        
        const inventory = userData.inventory || [];
        
        if (inventory.length === 0) {
            return await ctx.message.reply({ text: styleText(`🎒 *Tu inventario está vacío.*\n> Ve a la #shop para comprar cosas.`) });
        }
        
        let text = '🎒 *INVENTARIO DE USUARIO*\n\n';
        for (const item of inventory) {
            if (item.count > 0) {
                text += `▪️ *${item.id}* (x${item.count})\n`;
            }
        }
        text += `\n> ꕢ Usa *#use <id>* para usar un objeto.`;
        await ctx.message.reply({ text: styleText(text) });
    }
};

export default command;