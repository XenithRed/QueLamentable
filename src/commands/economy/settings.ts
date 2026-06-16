import type { Command } from '../../types/command.js';
import { styleText, isAdmin } from '../../utils/helpers.js';

const command: Command = {
    name: 'economy',
    aliases: [],
    description: 'Activa/desactiva la economía en el grupo',
    category: 'economy',
    async execute(ctx) {
        if (!ctx.isGroup) {
            return await ctx.message.reply({ text: styleText('ꕢ Este comando solo funciona en grupos.') });
        }

        const userIdForAdmin = ctx.sender;
        const admin = await isAdmin(ctx.bot.sock, ctx.chatId, userIdForAdmin);
        
        if (!admin) {
            return await ctx.message.reply({ text: styleText('ꕢ Solo los administradores pueden usar este comando.') });
        }

        if (!ctx.args[0] || !['on', 'off'].includes(ctx.args[0].toLowerCase())) {
            return await ctx.message.reply({ text: styleText('ꕢ Uso: *#economy* `<on/off>`') });
        }

        const enable = ctx.args[0].toLowerCase() === 'on';
        await ctx.db.updateGroup(ctx.chatId, { 'settings.economy': enable } as any);
        await ctx.message.reply({ text: styleText(`ꕣ Sistema de economía ${enable ? 'activado' : 'desactivado'}.`) });
    }
};

export default command;