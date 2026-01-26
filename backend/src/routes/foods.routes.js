import express from 'express';
import { getAll, getOne, create, update, deleteFood, getCategories } from '../controllers/foods.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Food database routes
router.get('/', getAll);
router.get('/categories', getCategories);
router.get('/:id', getOne);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', deleteFood);

export default router;
