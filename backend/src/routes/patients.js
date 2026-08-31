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
    addLabResult,
    getLabResults,
} from '../controllers/patientController.js';
import { protect } from '../middleware/auth.js';
import { patientValidators, patientUpdateValidators } from '../middleware/validators.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
    .get(getPatients)
    .post(patientValidators, createPatient);

// Export route must come before /:id to avoid conflicts
router.get('/export', exportPatients);

router.route('/:id')
    .get(getPatient)
    .put(patientUpdateValidators, updatePatient)
    .delete(deletePatient);

router.post('/:id/upload', upload.single('document'), uploadDocument);

router.route('/:id/lab')
    .get(getLabResults)
    .post(addLabResult);

export default router;
