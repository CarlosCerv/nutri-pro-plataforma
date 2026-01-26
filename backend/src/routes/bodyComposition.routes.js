import express from 'express';
import { create, getByPatient, getOne, update, deleteRecord } from '../controllers/bodyComposition.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Body composition routes
router.post('/', create);
router.get('/patient/:patientId', getByPatient);
router.get('/:id', getOne);
router.put('/:id', update);
router.delete('/:id', deleteRecord);

export default router;
