import express from 'express';
import {
    getPayments,
    createPayment,
    updatePayment,
    deletePayment
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes protected

router.route('/')
    .get(getPayments)
    .post(createPayment);

router.route('/:id')
    .put(updatePayment)
    .delete(deletePayment);

export default router;
