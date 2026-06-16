import axios from 'axios';
import { fileTypeFromBuffer } from 'file-type';

const SOBLEND_R2_URL = 'https://soblend-r2.vercel.app/api/upload';
const SOBLEND_R2_TOKEN = '35cdd57ea78cb99d837e87b6873127934230909d12941d8a69e4c134d760c90e';

export async function uploadToSoblendR2(buffer: Buffer, filename: string | null = null): Promise<string> {
    try {
        let ext = 'jpg';
        let mimeType = 'image/jpeg';
        
        try {
            const type = await fileTypeFromBuffer(buffer);
            if (type) {
                ext = type.ext;
                mimeType = type.mime;
            }
        } catch (e) {
            console.warn('[UploadService] No se pudo detectar tipo de archivo, usando jpg por defecto');
        }
        
        if (!filename) {
            filename = `waifu_${Date.now()}.${ext}`;
        }
        console.info(`[UploadService] Subiendo a Soblend R2: ${filename}`);
        
        const response = await axios.post(SOBLEND_R2_URL, buffer, {
            headers: {
                'Authorization': `Bearer ${SOBLEND_R2_TOKEN}`,
                'Content-Type': mimeType
            },
            params: {
                filename
            },
            timeout: 60000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        
        if (response.data && response.data.success) {
            const publicUrl = response.data.data.publicUrl;
            console.info(`[UploadService] Subida exitosa a Soblend R2: ${publicUrl}`);
            return publicUrl;
        } else {
            throw new Error(`Error en respuesta R2: ${JSON.stringify(response.data)}`);
        }
    } catch (error: any) {
        console.error('[UploadService] Error en Soblend R2:', error.message);
        throw error;
    }
}