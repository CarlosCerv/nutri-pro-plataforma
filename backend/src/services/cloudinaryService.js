import { v2 as cloudinary } from 'cloudinary';

/**
 * Igual que emailService/smsService: si las credenciales no estan en el
 * .env, el servicio queda inactivo y el resto de la app sigue funcionando
 * (uploadMiddleware cae de vuelta a disco local / placeholder de Vercel).
 */
const isConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
} else {
    console.warn('[Cloudinary] Not configured — file uploads will use the local/temporary fallback.');
}

export const isCloudinaryConfigured = () => isConfigured;

/**
 * Sube un buffer en memoria (multer memoryStorage) a Cloudinary.
 * Devuelve el resultado de Cloudinary (incluye `secure_url`) o `null`
 * si el servicio no esta configurado.
 */
export const uploadBuffer = (buffer, options = {}) =>
    new Promise((resolve, reject) => {
        if (!isConfigured) {
            resolve(null);
            return;
        }

        const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto', folder: 'nutripro', ...options },
            (error, result) => {
                if (error) {
                    console.error('[Cloudinary] Upload failed:', error.message);
                    reject(error);
                    return;
                }
                resolve(result);
            }
        );
        stream.end(buffer);
    });
