import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine if running on Vercel (serverless)
const isVercel = !!process.env.VERCEL;

// Configure storage based on environment
const storage = isVercel
  ? multer.memoryStorage() // In Vercel, use memory storage (files are lost but won't crash)
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
 * - Local: /uploads/filename
 * - Vercel: return null or a placeholder (files not persisted)
 */
export const getFileUrl = (file) => {
  if (!file) return null;

  if (isVercel) {
    // In Vercel, files are in memory only
    // Return a warning or placeholder
    console.warn(
      '⚠️  File uploads in Vercel are temporary. For production, use a blob storage service.'
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
