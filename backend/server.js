import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './src/config/database.js';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './src/routes/auth.js';
import patientRoutes from './src/routes/patients.js';
import appointmentRoutes from './src/routes/appointments.js';
import mealPlanRoutes from './src/routes/mealplans.js';
import bodyCompositionRoutes from './src/routes/bodyComposition.routes.js';
import foodsRoutes from './src/routes/foods.routes.js';
import calculationsRoutes from './src/routes/calculations.routes.js';
import dietTemplatesRoutes from './src/routes/dietTemplates.routes.js';
import foodExchangeRoutes from './src/routes/foodExchange.routes.js';
import clinicalNotesRoutes from './src/routes/clinicalNotes.routes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import dashboardRoutes from './src/routes/dashboard.routes.js';

// Import reminder cron job
import { startReminderCron } from './src/scripts/reminderCron.js';

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Start appointment reminder cron job
startReminderCron();

// Request logging middleware
app.use((req, res, next) => {
    if (process.env.NODE_ENV !== 'test') {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'No Origin'}`);
    }
    next();
});

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176'
];

if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
    origin: (origin, callback) => {
        try {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            // Normalize origin and allowed origins (remove trailing slashes)
            const normalizedOrigin = origin.replace(/\/$/, "");
            const normalizedAllowed = allowedOrigins.filter(o => typeof o === 'string').map(o => o.replace(/\/$/, ""));

            const isAllowed = normalizedAllowed.includes(normalizedOrigin) ||
                normalizedOrigin.startsWith('http://localhost:');

            if (isAllowed) {
                callback(null, true);
            } else {
                console.warn(`[CORS] Blocked origin: ${origin}`);
                callback(null, false);
            }
        } catch (corsError) {
            console.error('[CORS] Middleware error:', corsError);
            callback(null, false); // Fail safely
        }
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Routes
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

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Nutrition Platform API is running',
        timestamp: new Date().toISOString(),
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {},
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
