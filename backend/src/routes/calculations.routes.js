import express from 'express';
import { calculateBMR, calculateTDEE, calculateMacros, calculateNutritionPlan, calculateBodyComposition } from '../controllers/calculations.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Calculation routes
router.post('/bmr', calculateBMR);
router.post('/tdee', calculateTDEE);
router.post('/macros', calculateMacros);
router.post('/nutrition-plan', calculateNutritionPlan);
router.post('/body-composition', calculateBodyComposition);

export default router;
