import mongoose from 'mongoose';
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

// @desc    Resumen financiero del mes en curso más la serie de los últimos meses
// @route   GET /api/payments/summary
// @access  Private
export const getPaymentSummary = asyncHandler(async (req, res) => {
    const meses = Math.min(Math.max(parseInt(req.query.months, 10) || 6, 1), 24);
    const nutritionistId = new mongoose.Types.ObjectId(req.user._id);

    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
    const desde = new Date(ahora.getFullYear(), ahora.getMonth() - (meses - 1), 1);

    // Aprovecha el índice { nutritionist: 1, date: -1 } de models/Payment.js.
    const [porMes, porMetodo, delMes, delMesAnterior] = await Promise.all([
        Payment.aggregate([
            { $match: { nutritionist: nutritionistId, date: { $gte: desde } } },
            {
                $group: {
                    _id: { year: { $year: '$date' }, month: { $month: '$date' }, status: '$status' },
                    total: { $sum: '$amount' },
                    cobros: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),
        Payment.aggregate([
            { $match: { nutritionist: nutritionistId, status: 'paid', date: { $gte: inicioMes } } },
            { $group: { _id: '$method', total: { $sum: '$amount' }, cobros: { $sum: 1 } } },
            { $sort: { total: -1 } },
        ]),
        Payment.aggregate([
            { $match: { nutritionist: nutritionistId, date: { $gte: inicioMes } } },
            { $group: { _id: '$status', total: { $sum: '$amount' }, cobros: { $sum: 1 } } },
        ]),
        Payment.aggregate([
            { $match: { nutritionist: nutritionistId, status: 'paid', date: { $gte: inicioMesAnterior, $lt: inicioMes } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
    ]);

    const porEstado = (filas, estado) => filas.find((f) => f._id === estado) || { total: 0, cobros: 0 };
    const cobradoMes = porEstado(delMes, 'paid');
    const pendienteMes = porEstado(delMes, 'pending');
    const cobradoMesAnterior = delMesAnterior[0]?.total || 0;

    // La serie se arma como un mapa por "YYYY-MM" para que los meses sin
    // ningún cobro aparezcan en cero en vez de desaparecer de la gráfica.
    const serie = [];
    for (let i = meses - 1; i >= 0; i -= 1) {
        const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
        const filas = porMes.filter((f) => f._id.year === d.getFullYear() && f._id.month === d.getMonth() + 1);
        serie.push({
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            cobrado: filas.filter((f) => f._id.status === 'paid').reduce((a, f) => a + f.total, 0),
            pendiente: filas.filter((f) => f._id.status === 'pending').reduce((a, f) => a + f.total, 0),
        });
    }

    res.status(200).json({
        success: true,
        data: {
            mes: {
                cobrado: cobradoMes.total,
                cobros: cobradoMes.cobros,
                pendiente: pendienteMes.total,
                pendientes: pendienteMes.cobros,
                variacionVsMesAnterior:
                    cobradoMesAnterior > 0
                        ? Math.round(((cobradoMes.total - cobradoMesAnterior) / cobradoMesAnterior) * 100)
                        : null,
            },
            porMetodo: porMetodo.map((m) => ({ metodo: m._id, total: m.total, cobros: m.cobros })),
            serie,
        },
    });
}, { message: 'Error al obtener el resumen financiero' });
