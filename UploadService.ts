import axios from 'axios';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';

export class UploadService {
    static SOBLEND_R2_URL = 'https://soblend-r2.vercel.app/api/upload';
    static SOBLEND_R2_TOKEN = '35cdd57ea78cb99d837e87b6873127934230909d12941d8a69e4c134d760c90e';

    static async uploadToSoblendR2(buffer: Buffer, filename: string | null = null): Promise<string> {
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
            
            const form = new FormData();
            form.append('image', buffer, {
                filename: filename,
                contentType: mimeType
            });

            const response = await axios.post(this.SOBLEND_R2_URL, form, {
                headers: {
                    ...form.getHeaders(),
                    'Authorization': `Bearer ${this.SOBLEND_R2_TOKEN}`
                },
                timeout: 60000,
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });

            if (response.data && response.data.success) {
                return response.data.data.publicUrl;
            } else {
                throw new Error(`Error en respuesta R2: ${JSON.stringify(response.data)}`);
            }
        } catch (error: any) {
            console.error('[UploadService] Error en Soblend R2:', error.message);
            throw error;
        }
    }
}