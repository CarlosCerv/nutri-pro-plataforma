import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { isCloudinaryConfigured, uploadBuffer } from '../services/cloudinaryService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine if running on Vercel (serverless)
const isVercel = !!process.env.VERCEL;
const useCloudinary = isCloudinaryConfigured();

// Cloudinary necesita el archivo completo en memoria (buffer), asi que si
// esta configurado lo usamos en cualquier entorno; si no, se mantiene el
// comportamiento previo (disco en local, memoria efimera en Vercel).
const storage = useCloudinary || isVercel
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadsDir = path.join(__dirname, '../../uploads');
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
      },
    });

const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Allow images and documents
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  },
});

/**
 * Get the file URL based on environment
 * - Cloudinary configured: sube el buffer y devuelve la URL publica (persiste en cualquier entorno)
 * - Local sin Cloudinary: /uploads/filename (disco)
 * - Vercel sin Cloudinary: placeholder — el archivo no persiste (filesystem efimero)
 */
export const getFileUrl = async (file) => {
  if (!file) return null;

  if (useCloudinary) {
    const result = await uploadBuffer(file.buffer, {
      resource_type: file.mimetype?.startsWith('image/') ? 'image' : 'auto',
    });
    return result?.secure_url || null;
  }

  if (isVercel) {
    // In Vercel, files are in memory only
    // Return a warning or placeholder
    console.warn(
      '⚠️  File uploads in Vercel are temporary. Configure CLOUDINARY_* para persistirlos.'
    );
    return `/uploads/temp-${file.filename || 'file'}`;
  }

  // Local environment: return disk path
  return `/uploads/${file.filename}`;
};

/**
 * Middleware to handle file uploads
 * Use as: router.post('/endpoint', uploadMiddleware.single('fieldName'), handler)
 */
export default uploadMiddleware;
