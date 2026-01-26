import express from 'express';
import {
    getPatients,
    getPatient,
    createPatient,
    updatePatient,
    deletePatient,
    uploadDocument,
    upload,
    exportPatients,
} from '../controllers/patientController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
    .get(getPatients)
    .post(createPatient);

// Export route must come before /:id to avoid conflicts
router.get('/export', exportPatients);

router.route('/:id')
    .get(getPatient)
    .put(updatePatient)
    .delete(deletePatient);

router.post('/:id/upload', upload.single('document'), uploadDocument);

export default router;
