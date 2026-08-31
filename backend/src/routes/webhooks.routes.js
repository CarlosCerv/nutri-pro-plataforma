import express from 'express';
import { handleWhatsAppReply } from '../controllers/whatsappWebhook.controller.js';

// Sin `protect`: lo llama Twilio, no un usuario con sesión. La autenticidad
// se valida dentro del controlador con la firma `X-Twilio-Signature`.
const router = express.Router();

router.post('/twilio/whatsapp', handleWhatsAppReply);

export default router;
