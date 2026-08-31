import crypto from 'crypto';
import Patient from '../models/Patient.js';
import PreConsultationToken from '../models/PreConsultationToken.js';
import MealPlan from '../models/MealPlan.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { buildShoppingList } from '../services/shoppingList.js';
import { findEquivalents } from './foodExchange.controller.js';

const hashToken = (raw) => crypto.createHash('sha256').update(String(raw)).digest('hex');

// ───────────────────────────── A. Cuestionario pre-consulta ─────────────────

async function loadValidPreConsultationToken(rawToken) {
    const record = await PreConsultationToken.findOne({ tokenHash: hashToken(rawToken) })
        .populate('patient', 'firstName lastName')
        .populate('nutritionist', 'name');
    if (!record) return { error: { status: 404, message: 'El enlace no es válido.' } };
    if (record.usedAt) return { error: { status: 410, message: 'Este cuestionario ya fue respondido.' } };
    if (record.expiresAt < new Date()) {
        return { error: { status: 410, message: 'Este enlace expiró. Pide uno nuevo a tu nutriólogo.' } };
    }
    return { record };
}

// @desc    Datos mínimos para mostrar el wizard (sin exponer el expediente)
// @route   GET /api/public/pre-consultation/:token
// @access  Public
export const getPreConsultation = asyncHandler(async (req, res) => {
    const { record, error } = await loadValidPreConsultationToken(req.params.token);
    if (error) return res.status(error.status).json({ success: false, message: error.message });

    res.status(200).json({
        success: true,
        data: {
            patientFirstName: record.patient.firstName,
            nutritionistName: record.nutritionist.name,
        },
    });
}, { message: 'Error al abrir el cuestionario' });

// Campos de la Pestaña 3 (Clínica) que el wizard puede escribir. Una lista
// blanca explícita — no `req.body` completo — porque este endpoint no
// requiere sesión: sin ella, cualquier otro campo del paciente (incluido
// `nutritionist`) tendría que confiar en que el cliente no lo mande.
const CAMPOS_EDITABLES = [
    'antFamDM', 'antFamHTA', 'antFamObesidad', 'antFamCancer', 'antPersonales', 'cirugiasPrevias',
    'alergias', 'intolerancias', 'medicamentos',
    'horasSueno', 'nivelEstres', 'ocupacion', 'horasLaboral', 'tabaquismo', 'alcoholismo',
    'preferencias', 'disgustos', 'objetivoAlim', 'recordatorio24h',
];

// @desc    Guarda las respuestas del cuestionario y consume el token
// @route   POST /api/public/pre-consultation/:token
// @access  Public
export const submitPreConsultation = asyncHandler(async (req, res) => {
    const { record, error } = await loadValidPreConsultationToken(req.params.token);
    if (error) return res.status(error.status).json({ success: false, message: error.message });

    const actualizacion = {};
    CAMPOS_EDITABLES.forEach((campo) => {
        if (req.body[campo] !== undefined) actualizacion[campo] = req.body[campo];
    });
    actualizacion.preConsultationCompletedAt = new Date();

    await Patient.findByIdAndUpdate(record.patient._id, actualizacion, { runValidators: true });

    record.usedAt = new Date();
    await record.save();

    res.status(200).json({
        success: true,
        message: '¡Gracias! Tu información quedó lista para tu consulta.',
    });
}, { message: 'Error al guardar el cuestionario' });

// ───────────────────────────── B. Portal del paciente ───────────────────────

// @desc    Plan activo del paciente + lista de compras consolidada
// @route   GET /api/public/portal/:token
// @access  Public
export const getPortal = asyncHandler(async (req, res) => {
    const patient = await Patient.findOne({ portalToken: req.params.token }).select('firstName nutritionist');
    if (!patient) {
        return res.status(404).json({ success: false, message: 'Enlace de portal no válido.' });
    }

    const plan = await MealPlan.findOne({ patient: patient._id, isTemplate: false })
        .sort({ createdAt: -1 })
        .lean();

    if (!plan) {
        return res.status(200).json({
            success: true,
            data: { patientFirstName: patient.firstName, plan: null, shoppingList: [] },
        });
    }

    const shoppingList = await buildShoppingList(plan);

    res.status(200).json({
        success: true,
        data: {
            patientFirstName: patient.firstName,
            plan: {
                id: plan._id,
                name: plan.name,
                nutrition: plan.nutrition,
                meals: plan.meals,
                days: plan.days,
            },
            shoppingList,
        },
    });
}, { message: 'Error al abrir el portal' });

// @desc    Sustitutos sugeridos para un alimento del plan (mismo tipo de
//          equivalencia que usa el nutriólogo en el constructor de dietas)
// @route   GET /api/public/portal/:token/sustitutos/:foodId
// @access  Public
export const getPortalSubstitutes = asyncHandler(async (req, res) => {
    const patient = await Patient.findOne({ portalToken: req.params.token }).select('_id');
    if (!patient) {
        return res.status(404).json({ success: false, message: 'Enlace de portal no válido.' });
    }

    const resultado = await findEquivalents(req.params.foodId);
    if (!resultado) {
        return res.status(404).json({ success: false, message: 'Alimento no encontrado.' });
    }

    res.status(200).json({
        success: true,
        equivalents: resultado.equivalents.map((item) => ({
            id: item.food._id,
            name: item.food.name,
            category: item.food.category,
            nutrition: item.food.nutrition,
            score: Math.round(item.score),
        })),
    });
}, { message: 'Error al buscar sustitutos' });

// ───────────────────────────── D. Agendamiento público ──────────────────────

const minutesFromHHMM = (s) => {
    const [h, m] = String(s || '00:00').split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
};
const hhmmFromMinutes = (min) => {
    const h = String(Math.floor(min / 60)).padStart(2, '0');
    const m = String(min % 60).padStart(2, '0');
    return `${h}:${m}`;
};

// @desc    Perfil público de agendamiento
// @route   GET /api/public/booking/:username
// @access  Public
export const getBookingProfile = asyncHandler(async (req, res) => {
    const nutritionist = await User.findOne({
        username: req.params.username,
        'publicBooking.enabled': true,
    }).select('name specialty publicBooking.bio publicBooking.services');

    if (!nutritionist) {
        return res.status(404).json({ success: false, message: 'Esta página no está disponible.' });
    }

    res.status(200).json({
        success: true,
        data: {
            name: nutritionist.name,
            specialty: nutritionist.specialty,
            bio: nutritionist.publicBooking.bio,
            services: nutritionist.publicBooking.services,
        },
    });
}, { message: 'Error al cargar el perfil' });

/** Citas del día que ya ocupan un horario (cualquier estado salvo cancelada). */
async function occupiedRangesFor(nutritionistId, date) {
    const inicioDia = new Date(`${date}T00:00:00`);
    const finDia = new Date(`${date}T23:59:59.999`);
    const citas = await Appointment.find({
        nutritionist: nutritionistId,
        date: { $gte: inicioDia, $lte: finDia },
        status: { $ne: 'cancelled' },
    }).select('time duration');

    return citas.map((c) => {
        const inicio = minutesFromHHMM(c.time);
        return { inicio, fin: inicio + (c.duration || 60) };
    });
}

function serviceDuration(nutritionist, serviceIndex) {
    const servicio = nutritionist.publicBooking.services?.[Number(serviceIndex)];
    return servicio?.durationMinutes || nutritionist.publicBooking.slotDurationMinutes || 60;
}

// @desc    Horarios libres de un día según el horario de trabajo del perfil
// @route   GET /api/public/booking/:username/availability?date=YYYY-MM-DD&serviceIndex=0
// @access  Public
export const getBookingAvailability = asyncHandler(async (req, res) => {
    const { date, serviceIndex } = req.query;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) {
        return res.status(400).json({ success: false, message: 'Fecha inválida.' });
    }

    const nutritionist = await User.findOne({ username: req.params.username, 'publicBooking.enabled': true });
    if (!nutritionist) {
        return res.status(404).json({ success: false, message: 'Esta página no está disponible.' });
    }

    const fechaConsultada = new Date(`${date}T00:00:00`);
    const bloques = nutritionist.publicBooking.workingHours.filter((h) => h.day === fechaConsultada.getDay());
    if (bloques.length === 0) {
        return res.status(200).json({ success: true, data: [] });
    }

    const duracion = serviceDuration(nutritionist, serviceIndex);
    const ocupados = await occupiedRangesFor(nutritionist._id, date);
    const esHoy = fechaConsultada.toDateString() === new Date().toDateString();

    const disponibles = [];
    bloques.forEach((bloque) => {
        const finBloque = minutesFromHHMM(bloque.end);
        for (let cursor = minutesFromHHMM(bloque.start); cursor + duracion <= finBloque; cursor += duracion) {
            const choca = ocupados.some((o) => cursor < o.fin && cursor + duracion > o.inicio);
            const yaPaso = esHoy && fechaConsultada.getTime() + cursor * 60000 < Date.now();
            if (!choca && !yaPaso) disponibles.push(hhmmFromMinutes(cursor));
        }
    });

    res.status(200).json({ success: true, data: disponibles });
}, { message: 'Error al calcular la disponibilidad' });

// @desc    Agenda la cita y crea al paciente (Paso 1) si es la primera vez
// @route   POST /api/public/booking/:username
// @access  Public
export const createBooking = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, phone, date, time, serviceIndex } = req.body;

    const nutritionist = await User.findOne({ username: req.params.username, 'publicBooking.enabled': true });
    if (!nutritionist) {
        return res.status(404).json({ success: false, message: 'Esta página no está disponible.' });
    }

    const duracion = serviceDuration(nutritionist, serviceIndex);
    const inicioSolicitado = minutesFromHHMM(time);
    const ocupados = await occupiedRangesFor(nutritionist._id, date);
    const choca = ocupados.some((o) => inicioSolicitado < o.fin && inicioSolicitado + duracion > o.inicio);
    if (choca) {
        return res.status(409).json({ success: false, message: 'Ese horario ya no está disponible. Elige otro.' });
    }

    // Identificación esencial (Paso 1 del alta manual): si ya existe un
    // paciente con ese teléfono o correo bajo este nutriólogo, se reutiliza
    // en vez de duplicar el expediente en cada cita que agenda por su cuenta.
    let patient = null;
    if (phone) patient = await Patient.findOne({ nutritionist: nutritionist._id, phone });
    if (!patient && email) patient = await Patient.findOne({ nutritionist: nutritionist._id, email });
    if (!patient) {
        patient = await Patient.create({
            nutritionist: nutritionist._id,
            firstName,
            lastName,
            email: email || undefined,
            phone: phone || undefined,
        });
    }

    await Appointment.create({
        patient: patient._id,
        nutritionist: nutritionist._id,
        date: new Date(`${date}T00:00:00`),
        time,
        duration: duracion,
        type: 'initial',
        source: 'public-booking',
    });

    res.status(201).json({
        success: true,
        message: 'Tu cita quedó agendada.',
        data: { date, time, nutritionistName: nutritionist.name },
    });
}, { message: 'Error al agendar la cita' });
