import express from 'express';
import {
    getMealPlans,
    getMealPlan,
    createMealPlan,
    updateMealPlan,
    deleteMealPlan,
} from '../controllers/mealPlanController.js';
import { protect } from '../middleware/auth.js';
import { mealPlanValidators } from '../middleware/validators.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
    .get(getMealPlans)
    .post(mealPlanValidators, createMealPlan);

router.route('/:id')
    .get(getMealPlan)
    .put(updateMealPlan)
    .delete(deleteMealPlan);

export default router;
