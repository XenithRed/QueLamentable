import type { Command } from '../../types/command.js';
import { styleText } from '../../utils/helpers.js';

const command: Command = {
    name: 'tiktok',
    aliases: ['ttk', 'tt'],
    description: 'Descarga videos o imágenes de TikTok',
    category: 'downloads',
    async execute(ctx) {
        const { message, args } = ctx;
        
        const msgText = message.text ?? '';
        const links = msgText.match(/https?:\/\/(www|vt|vm|t)?\.?tiktok\.com\/\S+/g) ?? 
                      args.filter(arg => /https?:\/\/(www|vt|vm|t)?\.?tiktok\.com\/\S+/.test(arg));
                      
        if (!links || links.length === 0) {
            return void message.reply({ 
                text: styleText(`✦ *Uso incorrecto del comando*\n\n*Ejemplos:*\n✿ #tiktok https://www.tiktok.com/@user/video/xxx`) 
            });
        }

        const linksToProcess = links.slice(0, 3);
        if (links.length > 3) void message.reply({ text: styleText('✦ Solo se procesarán los primeros 3 enlaces.') });

        for (const link of linksToProcess) {
            try {
                console.log(`[TikTok] Procesando enlace: ${link}`);
                const response = await fetch(`https://www.tikwm.com/api?url=${link}`);
                console.log(`[TikTok] Respuesta API recibida, status: ${response.status}`);
                const result = await response.json() as { data?: { play?: string; images?: string[]; title?: string } };
                const data = result.data;

                if (!data || (!data.play && !data.images?.length)) {
                    console.log(`[TikTok] No se encontraron datos para el enlace`);
                    await message.reply({ text: styleText(`✦ No se pudo obtener información del enlace '${link}'`) });
                    continue;
                }

                if (data.images?.length) {
                    console.log(`[TikTok] Enviando ${data.images.length} imágenes`);
                    const maxImages = Math.min(data.images.length, 5);
                    for (let index = 0; index < maxImages; index++) {
                        const caption = index === 0 ? styleText(`✦ *TikTok Download*\n\n✿ *Título:* ${data.title || 'Sin título'}\n\n_Powered By DeltaByte_`) : undefined;
                        await message.reply({ image: { url: data.images[index] }, caption });
                    }
                    console.log(`[TikTok] Imágenes enviadas: ${maxImages}`);
                    if (data.images.length > maxImages) {
                        await message.reply({ text: styleText(`✦ Solo se mostraron ${maxImages} de ${data.images.length} imágenes.`) });
                    }
                } else if (data.play) {
                    console.log(`[TikTok] Enviando video`);
                    const caption = styleText(`✦ *TikTok Download*\n\nꪆৎ *Título:* ${data.title || 'Sin título'}\n\n> *Powered By DeltaByte*`);
                    await message.reply({ video: { url: data.play }, caption, mimetype: 'video/mp4' });
                    console.log(`[TikTok] Video enviado correctamente`);
                }
            } catch (error: unknown) {
                console.error('Error procesando enlace de TikTok:', error);
                const errMsg = error instanceof Error ? error.message : '';
                if (errMsg.includes('ENOSPC')) {
                    console.log(`[TikTok] Error ENOSPC detectado`);
                    await message.reply({ text: styleText('✦ Error de espacio/memoria. Intenta en unos segundos.') });
                    return;
                }
                console.log(`[TikTok] Error general: ${errMsg}`);
                await message.reply({ text: styleText(`✦ Error al procesar el enlace: ${link}\n\n💡 *Tip:* Asegúrate de que el video sea público.`) });
            }
        }
    }
};

export default command;