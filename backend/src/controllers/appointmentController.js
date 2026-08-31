import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import asyncHandler from '../utils/asyncHandler.js';
import isOwnedBy from '../utils/ownership.js';

// @desc    Get all appointments for logged-in nutritionist
// @route   GET /api/appointments
// @access  Private
export const getAppointments = asyncHandler(async (req, res) => {
    const { startDate, endDate, patientId } = req.query;

    let query = { nutritionist: req.user.id };

    // Filter by date range if provided
    if (startDate && endDate) {
        query.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
        };
    }

    // Filter by patient if provided
    if (patientId) {
        query.patient = patientId;
    }

    const appointments = await Appointment.find(query)
        .populate('patient', 'firstName lastName email phone')
        .sort({ date: 1, time: 1 });

    res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments,
    });
}, { message: 'Error fetching appointments' });

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointment = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id)
        .populate('patient', 'firstName lastName email phone');

    if (!appointment) {
        return res.status(404).json({
            success: false,
            message: 'Appointment not found',
        });
    }

    // Make sure user owns this appointment
    if (!isOwnedBy(appointment, req.user.id)) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to access this appointment',
        });
    }

    res.status(200).json({
        success: true,
        data: appointment,
    });
}, { message: 'Error fetching appointment' });

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = asyncHandler(async (req, res) => {
    // Verify patient exists and belongs to this nutritionist
    const patient = await Patient.findById(req.body.patient);

    if (!patient) {
        return res.status(404).json({
            success: false,
            message: 'Patient not found',
        });
    }

    if (!isOwnedBy(patient, req.user.id)) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to create appointment for this patient',
        });
    }

    // Add nutritionist to request body
    req.body.nutritionist = req.user.id;

    const appointment = await Appointment.create(req.body);

    // Populate patient data
    await appointment.populate('patient', 'firstName lastName email phone');

    res.status(201).json({
        success: true,
        message: 'Appointment created successfully',
        data: appointment,
    });
}, { message: 'Error creating appointment' });

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = asyncHandler(async (req, res) => {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
        return res.status(404).json({
            success: false,
            message: 'Appointment not found',
        });
    }

    // Make sure user owns this appointment
    if (!isOwnedBy(appointment, req.user.id)) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this appointment',
        });
    }

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    }).populate('patient', 'firstName lastName email phone');

    res.status(200).json({
        success: true,
        message: 'Appointment updated successfully',
        data: appointment,
    });
}, { message: 'Error updating appointment' });

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
export const deleteAppointment = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
        return res.status(404).json({
            success: false,
            message: 'Appointment not found',
        });
    }

    // Make sure user owns this appointment
    if (!isOwnedBy(appointment, req.user.id)) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this appointment',
        });
    }

    await appointment.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Appointment deleted successfully',
        data: {},
    });
}, { message: 'Error deleting appointment' });

/** Etiquetas que espera la agenda del dashboard (frontend/src/components/Dashboard/DashboardInsights.jsx). */
const ESTADO_LABEL = {
    scheduled: 'confirmada',
    completed: 'confirmada',
    cancelled: 'cancelada',
    no_show: 'cancelada',
};

const TIPO_LABEL = {
    initial: 'Primera consulta',
    follow_up: 'Seguimiento',
    check_in: 'Control',
    final: 'Cierre',
};

// @desc    Citas de hoy del nutriologo autenticado
// @route   GET /api/appointments/today
// @access  Private
export const getTodayAppointments = asyncHandler(async (req, res) => {
    const now = new Date();
    const inicio = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const fin = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const citas = await Appointment.find({
        nutritionist: req.user.id,
        date: { $gte: inicio, $lt: fin },
    })
        .populate('patient', 'firstName lastName')
        .sort({ date: 1, time: 1 });

    res.status(200).json({
        success: true,
        count: citas.length,
        data: citas.map((c) => ({
            id: c._id,
            hora: c.time || new Date(c.date).toTimeString().slice(0, 5),
            nombre: c.patient
                ? `${c.patient.firstName} ${c.patient.lastName}`
                : [c.guestDetails?.firstName, c.guestDetails?.lastName].filter(Boolean).join(' ') || 'Invitado',
            tipo: TIPO_LABEL[c.type] || 'Consulta',
            estado: ESTADO_LABEL[c.status] || 'pendiente',
        })),
    });
}, { message: 'Error al obtener las citas de hoy' });
