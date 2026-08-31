import express from 'express';
import {
    getPayments,
    createPayment,
    updatePayment,
    deletePayment,
    getPaymentSummary
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes protected

// Antes de /:id para que "summary" no se lea como un ObjectId.
router.get('/summary', getPaymentSummary);

router.route('/')
    .get(getPayments)
    .post(createPayment);

router.route('/:id')
    .put(updatePayment)
    .delete(deletePayment);

export default router;
