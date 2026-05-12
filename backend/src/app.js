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
import calculationsRoutes from './routes/calculations.routes.js';
import dietTemplatesRoutes from './routes/dietTemplates.routes.js';
import foodExchangeRoutes from './routes/foodExchange.routes.js';
import clinicalNotesRoutes from './routes/clinicalNotes.routes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

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

      const isAllowed = normalizedAllowed.includes(normalizedOrigin) || normalizedOrigin.startsWith('http://localhost:');
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
app.use('/api/calculations', calculationsRoutes);
app.use('/api/diet-templates', dietTemplatesRoutes);
app.use('/api/food-exchange', foodExchangeRoutes);
app.use('/api/clinical-notes', clinicalNotesRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);

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
