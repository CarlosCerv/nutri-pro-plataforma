import express from 'express';
import {
    getPreConsultation,
    submitPreConsultation,
    getPortal,
    getPortalSubstitutes,
    getBookingProfile,
    getBookingAvailability,
    createBooking,
} from '../controllers/public.controller.js';
import { preConsultationValidators, publicBookingCreateValidators } from '../middleware/validators.js';

// Sin `protect`: todo lo que cuelga de aquí lo consulta un paciente o un
// visitante sin cuenta. Cada handler valida su propio token/estado
// (`public.controller.js`) en vez de depender de un JWT.
const router = express.Router();

// A. Cuestionario pre-consulta
router.route('/pre-consultation/:token')
    .get(getPreConsultation)
    .post(preConsultationValidators, submitPreConsultation);

// B. Portal ligero del paciente
router.get('/portal/:token', getPortal);
router.get('/portal/:token/sustitutos/:foodId', getPortalSubstitutes);

// D. Página pública de agendamiento
router.get('/booking/:username', getBookingProfile);
router.get('/booking/:username/availability', getBookingAvailability);
router.post('/booking/:username', publicBookingCreateValidators, createBooking);

export default router;
