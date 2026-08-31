import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    getEquivalents,
    getByCategory,
    batchExchange,
} from '../controllers/foodExchange.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get equivalent foods
router.post('/equivalents', getEquivalents);

// Get foods by category with filters
router.get('/by-category/:category', getByCategory);

// Batch exchange
router.post('/batch', batchExchange);

export default router;
