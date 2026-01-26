import express from 'express';
import {
    getAppointments,
    getAppointment,
    createAppointment,
    updateAppointment,
    deleteAppointment,
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
    .get(getAppointments)
    .post(createAppointment);

router.route('/:id')
    .get(getAppointment)
    .put(updateAppointment)
    .delete(deleteAppointment);

export default router;
