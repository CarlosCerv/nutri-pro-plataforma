import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import appointmentRoutes from './routes/appointments.js';
import mealPlanRoutes from './routes/mealplans.js';
import bodyCompositionRoutes from './routes/bodyComposition.routes.js';
import foodsRoutes from './routes/foods.routes.js';
import dietTemplatesRoutes from './routes/dietTemplates.routes.js';
import clinicalNotesRoutes from './routes/clinicalNotes.routes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import cronRoutes from './routes/cron.routes.js';
import foodExchangeRoutes from './routes/foodExchange.routes.js';
import publicRoutes from './routes/public.routes.js';
import webhookRoutes from './routes/webhooks.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../backend/.env') });

// Connect to the database early.
connectDB();

const app = express();

app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'No Origin'}`);
  }
  next();
});

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    try {
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, '');
      const normalizedAllowed = allowedOrigins
        .filter((o) => typeof o === 'string')
        .map((o) => o.replace(/\/$/, ''));

      const isAllowed =
        normalizedAllowed.includes(normalizedOrigin) ||
        normalizedOrigin.startsWith('http://localhost:') ||
        normalizedOrigin.endsWith('.vercel.app');
      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked origin: ${origin}`);
        callback(null, false);
      }
    } catch (corsError) {
      console.error('[CORS] Middleware error:', corsError);
      callback(null, false);
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Espera la conexión a Mongo antes de dejar pasar la petición a cualquier
 * ruta.
 *
 * `connectDB()` arriba se llamaba sin `await`: en una función serverless en
 * frío, Express quedaba listo para atender peticiones antes de que la
 * conexión real terminara. La primera consulta (`User.findOne`, etc.)
 * entonces se quedaba en el buffer de comandos de Mongoose esperando una
 * conexión que sí llegaba — pero después de los 10 s que Mongoose espera por
 * defecto (`bufferTimeoutMS`), así que la petición fallaba con
 * "buffering timed out" aunque la base de datos funcionara bien. Al esperar
 * aquí explícitamente, la primera petición paga el costo real de conectar
 * (cacheado para las siguientes, ver `config/database.js`) en vez de perder
 * contra un reloj que no tiene relación con cuánto tarda Atlas de verdad.
 */
app.use(async (req, res, next) => {
  if (req.method === 'OPTIONS') return next(); // preflight de CORS no toca la base de datos

  const conn = await connectDB();
  if (!conn) {
    return res.status(503).json({
      success: false,
      message: 'No se pudo conectar a la base de datos. Intenta de nuevo en unos segundos.',
    });
  }
  next();
});

// Serve uploaded files (only works in local environment with disk storage)
try {
  app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
} catch (err) {
  console.warn('⚠️  Uploads directory not available. Ensure /uploads folder exists in production.');
}

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/mealplans', mealPlanRoutes);
app.use('/api/body-composition', bodyCompositionRoutes);
app.use('/api/foods', foodsRoutes);
app.use('/api/diet-templates', dietTemplatesRoutes);
app.use('/api/clinical-notes', clinicalNotesRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/cron', cronRoutes);
app.use('/api/food-exchange', foodExchangeRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/webhooks', webhookRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Nutrition Platform API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

export default app;
