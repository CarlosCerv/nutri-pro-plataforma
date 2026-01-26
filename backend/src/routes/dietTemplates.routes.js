import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    getAll,
    getOne,
    create,
    update,
    deleteTemplate,
    applyToPatient,
    getCategories,
} from '../controllers/dietTemplates.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Categories route (before :id routes)
router.get('/categories', getCategories);

// CRUD routes
router.route('/')
    .get(getAll)
    .post(create);

router.route('/:id')
    .get(getOne)
    .put(update)
    .delete(deleteTemplate);

// Apply template to patient
router.post('/:id/apply', applyToPatient);

export default router;
