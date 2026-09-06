import express from 'express';
import {
    getAdminDashboardStats,
    listNutritionists,
    getNutritionistDetail,
    setNutritionistStatus,
    listCampaigns,
    getCampaignDetail,
    createCampaign,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Primera ruta del repo que activa `authorize` de verdad: el aislamiento
// entre nutriólogos es siempre por ownership (ver Patient/Appointment/etc),
// pero estas rutas cruzan tenants a propósito, así que necesitan un rol.
router.use(protect, authorize('admin'));

router.get('/dashboard', getAdminDashboardStats);

router.get('/nutritionists', listNutritionists);
router.get('/nutritionists/:id', getNutritionistDetail);
router.patch('/nutritionists/:id/status', setNutritionistStatus);

router.get('/campaigns', listCampaigns);
router.post('/campaigns', createCampaign);
router.get('/campaigns/:id', getCampaignDetail);

export default router;
