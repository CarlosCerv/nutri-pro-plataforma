import Payment from '../models/Payment.js';
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
export const getPayments = async (req, res) => {
    try {
        const { limit, page, patientId, startDate, endDate, status } = req.query;

        const query = { nutritionist: req.user._id };

        if (patientId) query.patient = patientId;
        if (status) query.status = status;

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const payments = await Payment.find(query)
            .populate('patient', 'firstName lastName email')
            .populate('appointment', 'date type')
            .sort({ date: -1 }); // Newest first

        // Calculate simple stats if needed, or just return list
        const totalIncome = payments
            .filter(p => p.status === 'paid')
            .reduce((acc, curr) => acc + curr.amount, 0);

        const pendingIncome = payments
            .filter(p => p.status === 'pending')
            .reduce((acc, curr) => acc + curr.amount, 0);

        res.status(200).json({
            success: true,
            count: payments.length,
            stats: {
                totalIncome,
                pendingIncome
            },
            data: payments // Pagination can be added later if list grows too big
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Create new payment
// @route   POST /api/payments
// @access  Private
export const createPayment = async (req, res) => {
    try {
        req.body.nutritionist = req.user._id;

        const payment = await Payment.create(req.body);

        // Optionally update appointment status if linked and paid?
        // For now, keep it simple.

        const populatedPayment = await Payment.findById(payment._id)
            .populate('patient', 'firstName lastName')
            .populate('appointment', 'date type');

        res.status(201).json({
            success: true,
            data: populatedPayment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update payment
// @route   PUT /api/payments/:id
// @access  Private
export const updatePayment = async (req, res) => {
    try {
        let payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Verify ownership
        if (payment.nutritionist.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this payment'
            });
        }

        payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('patient', 'firstName lastName');

        res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Delete payment
// @route   DELETE /api/payments/:id
// @access  Private
export const deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Verify ownership
        if (payment.nutritionist.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this payment'
            });
        }

        await payment.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
