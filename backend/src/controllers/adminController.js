import mongoose from 'mongoose';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import EmailCampaign from '../models/EmailCampaign.js';
import asyncHandler from '../utils/asyncHandler.js';
import * as emailService from '../services/emailService.js';

// @desc    KPIs globales de la plataforma (cruza todos los nutriólogos)
// @route   GET /api/admin/dashboard
// @access  Private (admin)
export const getAdminDashboardStats = asyncHandler(async (req, res) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [totalNutritionists, activeNutritionists, totalPatients, newThisMonth, campaignsSent, growthRows] = await Promise.all([
        User.countDocuments({ role: 'nutritionist' }),
        User.countDocuments({ role: 'nutritionist', isActive: true }),
        Patient.countDocuments({}),
        User.countDocuments({ role: 'nutritionist', createdAt: { $gte: startOfMonth } }),
        EmailCampaign.countDocuments({ status: 'sent' }),
        User.aggregate([
            { $match: { role: 'nutritionist', createdAt: { $gte: sixMonthsAgo } } },
            { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),
    ]);

    // Rellena los meses sin altas con 0 para que el gráfico no salte huecos.
    const growthSeries = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const row = growthRows.find((r) => r._id.year === d.getFullYear() && r._id.month === d.getMonth() + 1);
        growthSeries.push({
            month: d.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' }),
            count: row ? row.count : 0,
        });
    }

    res.status(200).json({
        success: true,
        data: {
            totalNutritionists,
            activeNutritionists,
            inactiveNutritionists: totalNutritionists - activeNutritionists,
            totalPatients,
            newThisMonth,
            campaignsSent,
            growthSeries,
        },
    });
}, { message: 'Error fetching admin dashboard stats' });

// @desc    Lista de nutriólogos registrados con estadísticas de uso
// @route   GET /api/admin/nutritionists
// @access  Private (admin)
export const listNutritionists = asyncHandler(async (req, res) => {
    const { q, status, page = 1, limit = 20 } = req.query;

    const match = { role: 'nutritionist' };
    if (q) {
        const regex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        match.$or = [{ name: regex }, { email: regex }];
    }
    if (status === 'active') match.isActive = true;
    if (status === 'inactive') match.isActive = false;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const [nutritionists, total] = await Promise.all([
        User.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: 'patients',
                    let: { nutriId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$nutritionist', '$$nutriId'] } } },
                        { $count: 'count' },
                    ],
                    as: 'patientStats',
                },
            },
            {
                $lookup: {
                    from: 'appointments',
                    let: { nutriId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$nutritionist', '$$nutriId'] } } },
                        { $count: 'count' },
                    ],
                    as: 'appointmentStats',
                },
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    isActive: 1,
                    createdAt: 1,
                    lastLoginAt: 1,
                    specialty: 1,
                    patientCount: { $ifNull: [{ $arrayElemAt: ['$patientStats.count', 0] }, 0] },
                    appointmentCount: { $ifNull: [{ $arrayElemAt: ['$appointmentStats.count', 0] }, 0] },
                },
            },
            { $sort: { createdAt: -1 } },
            { $skip: (pageNum - 1) * limitNum },
            { $limit: limitNum },
        ]),
        User.countDocuments(match),
    ]);

    res.status(200).json({
        success: true,
        data: {
            nutritionists,
            pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
        },
    });
}, { message: 'Error listing nutritionists' });

// @desc    Detalle de un nutriólogo + estadísticas de uso
// @route   GET /api/admin/nutritionists/:id
// @access  Private (admin)
export const getNutritionistDetail = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Invalid nutritionist id' });
    }

    const nutritionist = await User.findOne({ _id: req.params.id, role: 'nutritionist' });
    if (!nutritionist) {
        return res.status(404).json({ success: false, message: 'Nutritionist not found' });
    }

    const [patientCount, appointmentCount] = await Promise.all([
        Patient.countDocuments({ nutritionist: nutritionist._id }),
        Appointment.countDocuments({ nutritionist: nutritionist._id }),
    ]);

    res.status(200).json({
        success: true,
        data: {
            nutritionist: {
                id: nutritionist._id,
                name: nutritionist.name,
                email: nutritionist.email,
                specialty: nutritionist.specialty,
                phone: nutritionist.phone,
                isActive: nutritionist.isActive,
                createdAt: nutritionist.createdAt,
                lastLoginAt: nutritionist.lastLoginAt,
                notificationPreferences: nutritionist.notificationPreferences,
            },
            stats: { patientCount, appointmentCount },
        },
    });
}, { message: 'Error fetching nutritionist detail' });

// @desc    Activar/desactivar la cuenta de un nutriólogo
// @route   PATCH /api/admin/nutritionists/:id/status
// @access  Private (admin)
export const setNutritionistStatus = asyncHandler(async (req, res) => {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
        return res.status(400).json({ success: false, message: 'isActive debe ser booleano' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Invalid nutritionist id' });
    }

    const nutritionist = await User.findOneAndUpdate(
        { _id: req.params.id, role: 'nutritionist' },
        { isActive },
        { new: true }
    );

    if (!nutritionist) {
        return res.status(404).json({ success: false, message: 'Nutritionist not found' });
    }

    res.status(200).json({
        success: true,
        data: { id: nutritionist._id, isActive: nutritionist.isActive },
    });
}, { message: 'Error updating nutritionist status' });

// @desc    Listar campañas de email (sin el detalle de recipients)
// @route   GET /api/admin/campaigns
// @access  Private (admin)
export const listCampaigns = asyncHandler(async (req, res) => {
    const campaigns = await EmailCampaign.find({}, { recipients: 0 })
        .sort({ createdAt: -1 })
        .populate('createdBy', 'name email');

    res.status(200).json({ success: true, data: { campaigns } });
}, { message: 'Error listing campaigns' });

// @desc    Detalle de una campaña, incluidos los resultados por destinatario
// @route   GET /api/admin/campaigns/:id
// @access  Private (admin)
export const getCampaignDetail = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Invalid campaign id' });
    }

    const campaign = await EmailCampaign.findById(req.params.id).populate('createdBy', 'name email');
    if (!campaign) {
        return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    res.status(200).json({ success: true, data: { campaign } });
}, { message: 'Error fetching campaign detail' });

async function resolveSegment(segment) {
    const match = { role: 'nutritionist' };

    if (segment?.type === 'active') match.isActive = true;
    else if (segment?.type === 'inactive') match.isActive = false;
    else if (segment?.type === 'custom') {
        const ids = (segment.userIds || []).filter((id) => mongoose.Types.ObjectId.isValid(id));
        match._id = { $in: ids };
    }
    // 'all' (o cualquier otro valor): sin filtro adicional además del rol.

    return User.find(match, 'email notificationPreferences');
}

// @desc    Crear y enviar una campaña de email a un segmento de nutriólogos
// @route   POST /api/admin/campaigns
// @access  Private (admin)
export const createCampaign = asyncHandler(async (req, res) => {
    const { subject, bodyHtml, segment } = req.body;

    if (!subject || !bodyHtml) {
        return res.status(400).json({ success: false, message: 'subject y bodyHtml son obligatorios' });
    }

    const recipientsUsers = await resolveSegment(segment);

    const campaign = new EmailCampaign({
        subject,
        bodyHtml,
        segment: segment || { type: 'all' },
        status: 'sending',
        createdBy: req.user.id,
        recipients: recipientsUsers.map((user) => ({
            user: user._id,
            email: user.email,
            status: user.notificationPreferences?.marketingEmails === false ? 'skipped_optout' : 'pending',
        })),
    });

    // Envío secuencial (no Promise.all sin límite): el plan gratis de Resend
    // tiene un rate limit por segundo, y el volumen esperado (decenas/cientos
    // de destinatarios) hace que el costo de tiempo extra sea aceptable.
    for (const recipient of campaign.recipients) {
        if (recipient.status === 'skipped_optout') continue;

        try {
            const sent = await emailService.sendCampaignEmail({ email: recipient.email }, { subject, bodyHtml });
            recipient.status = sent ? 'sent' : 'failed';
            recipient.sentAt = sent ? new Date() : undefined;
            if (!sent) recipient.error = 'El proveedor de correo no confirmó el envío';
        } catch (err) {
            recipient.status = 'failed';
            recipient.error = err.message;
        }
    }

    campaign.stats = {
        total: campaign.recipients.length,
        sent: campaign.recipients.filter((r) => r.status === 'sent').length,
        failed: campaign.recipients.filter((r) => r.status === 'failed').length,
        skipped: campaign.recipients.filter((r) => r.status === 'skipped_optout').length,
    };
    campaign.status = 'sent';
    campaign.sentAt = new Date();

    await campaign.save();

    res.status(201).json({ success: true, data: { campaign } });
}, { message: 'Error creating campaign' });
