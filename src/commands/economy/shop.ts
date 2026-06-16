import type { Command } from '../../types/command.js';
import { styleText } from '../../utils/helpers.js';

const SHOP_ITEMS: Array<{ id: string; name: string; price: number; desc: string; category: string; stock: number }> = [
    { id: 'pot_vida_1', name: 'Poción de Vida I', price: 5000, desc: 'Restaura algo de vida', category: 'Consumible', stock: 99 },
    { id: 'pot_vida_2', name: 'Poción de Vida II', price: 10000, desc: 'Restaura vida moderada', category: 'Consumible', stock: 99 },
    { id: 'pot_vida_3', name: 'Poción de Vida III', price: 25000, desc: 'Restaura mucha vida', category: 'Consumible', stock: 99 }
];

const command: Command = {
    name: 'shop',
    aliases: ['tienda', 'store'],
    description: 'Muestra la tienda',
    category: 'economy',
    async execute(ctx) {
        const page = parseInt(ctx.args[0]) || 1;
        const itemsPerPage = 10;
        const totalPages = Math.ceil(SHOP_ITEMS.length / itemsPerPage);
        const start = (page - 1) * itemsPerPage;
        const items = SHOP_ITEMS.slice(start, start + itemsPerPage);

        let text = `╭─────── ୨୧ ───────╮\n`;
        text += `│ *Soblend Shop*\n`;
        text += `│ ✎ \`Página ${page}/${totalPages}\`\n`;
        text += `╰─────────────────╯\n\n`;
        text += ` ⟡ *STOCK (Renueva en 5m)*\n\n`;

        if (items.length === 0) {
            text += `> » No hay objetos en esta página.»;`;
        } else {
            for (const item of items) {
                const price = item.price.toLocaleString('es-ES');
                const stock = item.stock > 0 ? `${item.stock}` : `AGOTADO`;
                text += `╭─── » *${item.name}*\n`;
                text += `│ ✿ *ID* » \`${item.id}\`\n`;
                text += `│ ✿ *Precio* » ${price}\n`;
                text += `│ ✿ *Stock* » ${stock}\n`;
                text += `│ ✿ _${item.desc.substring(0, 40)}${item.desc.length > 40 ? '...' : ''}_\n`;
                text += `╰───────────────────\n\n`;
            }
        }

        text += ` ⟡ *CÓMO COMPRAR*\n`;
        text += `> Usa: *#buy <id> <cantidad>*\n`;
        text += `> Ej: *#buy pot_vida_1 5*\n`;
        text += `> Ver más: *#shop ${page + 1}*`;

        await ctx.message.reply({ text: styleText(text) });
    }
};

export default command;