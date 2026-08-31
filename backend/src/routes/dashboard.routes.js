import express from 'express';
import {
    getDashboardStats,
    getWeightData,
    getPathologyData,
    getMacroData,
    getRecentActivity,
    getPopulationStats,
    getTurnoActual,
    getRetentionRadar,
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/weight-data', getWeightData);
router.get('/pathology-data', getPathologyData);
router.get('/macro-data', getMacroData);
router.get('/activity', getRecentActivity);
router.get('/population', getPopulationStats);
router.get('/turno', getTurnoActual);
router.get('/retention', getRetentionRadar);

export default router;
