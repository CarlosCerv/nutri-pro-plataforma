import Payment from '../models/Payment.js';
import asyncHandler from '../utils/asyncHandler.js';
import isOwnedBy from '../utils/ownership.js';

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
export const getPayments = asyncHandler(async (req, res) => {
    const { patientId, startDate, endDate, status } = req.query;

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
}, { message: 'Server Error' });

// @desc    Create new payment
// @route   POST /api/payments
// @access  Private
export const createPayment = asyncHandler(async (req, res) => {
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
}, { status: 400, message: 'Error creating payment' });

// @desc    Update payment
// @route   PUT /api/payments/:id
// @access  Private
export const updatePayment = asyncHandler(async (req, res) => {
    let payment = await Payment.findById(req.params.id);

    if (!payment) {
        return res.status(404).json({
            success: false,
            message: 'Payment not found'
        });
    }

    // Verify ownership
    if (!isOwnedBy(payment, req.user._id)) {
        return res.status(403).json({
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
}, { message: 'Server Error' });

// @desc    Delete payment
// @route   DELETE /api/payments/:id
// @access  Private
export const deletePayment = asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
        return res.status(404).json({
            success: false,
            message: 'Payment not found'
        });
    }

    // Verify ownership
    if (!isOwnedBy(payment, req.user._id)) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this payment'
        });
    }

    await payment.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
}, { message: 'Server Error' });
