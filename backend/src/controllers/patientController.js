import crypto from 'crypto';
import Patient from '../models/Patient.js';
import PreConsultationToken from '../models/PreConsultationToken.js';
import uploadMiddleware, { getFileUrl } from '../middleware/uploadMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import isOwnedBy from '../utils/ownership.js';

const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
const PRE_CONSULTATION_TTL_DAYS = 7;

// Export upload middleware for use in routes
export const upload = uploadMiddleware;


// @desc    Get all active patients for logged-in nutritionist
// @route   GET /api/patients
// @access  Private
export const getPatients = asyncHandler(async (req, res) => {
    const { showInactive } = req.query;
    const query = { nutritionist: req.user.id };

    // Default to showing only active, unless specified
    if (showInactive !== 'true') {
        query.isActive = true;
    }

    const patients = await Patient.find(query)
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: patients.length,
        data: patients,
    });
}, { message: 'Error fetching patients' });

// @desc    Get single patient by ID
// @route   GET /api/patients/:id
// @access  Private
export const getPatient = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
        return res.status(404).json({
            success: false,
            message: 'Patient not found',
        });
    }

    // Make sure user owns this patient
    if (!isOwnedBy(patient, req.user.id)) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to access this patient',
        });
    }

    res.status(200).json({
        success: true,
        data: patient,
    });
}, { message: 'Error fetching patient' });

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private
export const createPatient = asyncHandler(async (req, res) => {
    const patientData = {
        ...req.body,
        nutritionist: req.user.id,
    };

    const patient = await Patient.create(patientData);

    res.status(201).json({
        success: true,
        message: 'Patient created successfully',
        data: patient,
    });
}, { status: 400, message: 'Error creating patient' });

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
export const updatePatient = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
        return res.status(404).json({
            success: false,
            message: 'Patient not found',
        });
    }

    // Make sure user owns this patient
    if (!isOwnedBy(patient, req.user.id)) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this patient',
        });
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).json({
        success: true,
        message: 'Patient updated successfully',
        data: updatedPatient,
    });
}, { status: 400, message: 'Error updating patient' });

// @desc    Soft Delete patient (set isActive = false)
// @route   DELETE /api/patients/:id
// @access  Private
export const deletePatient = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
        return res.status(404).json({
            success: false,
            message: 'Patient not found',
        });
    }

    // Make sure user owns this patient
    if (!isOwnedBy(patient, req.user.id)) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this patient',
        });
    }

    // Soft Delete
    patient.isActive = false;
    patient.status = 'inactive'; // Sync with legacy status field if used
    await patient.save();

    res.status(200).json({
        success: true,
        message: 'Patient deactivated successfully',
        data: { _id: patient._id, isActive: false },
    });
}, { message: 'Error deleting patient' });

// @desc    Upload document or image for patient
// @route   POST /api/patients/:id/upload
// @access  Private
export const uploadDocument = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
        return res.status(404).json({
            success: false,
            message: 'Patient not found',
        });
    }

    // Make sure user owns this patient
    if (!isOwnedBy(patient, req.user.id)) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to upload documents for this patient',
        });
    }

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Please upload a file',
        });
    }

    const isImage = req.file.mimetype.startsWith('image/') && ['front', 'side', 'back', 'other'].includes(req.body.type);
    const fileUrl = await getFileUrl(req.file);

    if (isImage) {
        // It's a gallery image
        patient.images.push({
            url: fileUrl,
            type: req.body.type || 'other',
            date: new Date()
        });
    } else {
        // It's a general document or medical file
        const docData = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: req.file.path || fileUrl,
            url: fileUrl,
            type: req.body.category || 'other', // Use category for doc type
            uploadDate: new Date()
        };

        // Push to medicalFiles if it looks like one, or legacy documents
        if (req.body.isMedicalFile === 'true') {
            patient.medicalFiles.push(docData);
        } else {
            patient.documents.push(docData);
        }
    }

    await patient.save();

    res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        data: patient,
    });
}, { message: 'Error uploading document' });

// @desc    Export all patients for backup
// @route   GET /api/patients/export
// @access  Private
export const exportPatients = asyncHandler(async (req, res) => {
    const patients = await Patient.find({ nutritionist: req.user.id })
        .populate('nutritionist', 'name email specialty')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        exportDate: new Date().toISOString(),
        nutritionist: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
        },
        count: patients.length,
        data: patients,
    });
}, { message: 'Error exporting patients' });

// @desc    Registrar un panel de laboratorio del paciente
// @route   POST /api/patients/:id/lab
// @access  Private
export const addLabResult = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
        return res.status(404).json({
            success: false,
            message: 'Paciente no encontrado',
        });
    }

    if (!isOwnedBy(patient, req.user.id)) {
        return res.status(403).json({
            success: false,
            message: 'No autorizado para modificar este paciente',
        });
    }

    const { date, values = {}, vitals = {} } = req.body;

    // Solo se guardan los analitos con un numero real: la interfaz envia el
    // panel completo y la mayoria de los campos viene vacia en cada consulta.
    const cleanValues = {};
    for (const [key, raw] of Object.entries(values)) {
        const n = typeof raw === 'number' ? raw : parseFloat(raw);
        if (Number.isFinite(n)) cleanValues[key] = n;
    }

    if (Object.keys(cleanValues).length === 0 && Object.keys(vitals).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Captura al menos un valor de laboratorio o un signo vital.',
        });
    }

    const numberOrUndefined = (raw) => {
        const n = typeof raw === 'number' ? raw : parseFloat(raw);
        return Number.isFinite(n) ? n : undefined;
    };

    patient.labResults.push({
        date: date ? new Date(date) : new Date(),
        values: cleanValues,
        vitals: {
            temperature: numberOrUndefined(vitals.temperature),
            heartRate: numberOrUndefined(vitals.heartRate),
            respiratoryRate: numberOrUndefined(vitals.respiratoryRate),
        },
    });

    await patient.save();

    res.status(201).json({
        success: true,
        data: patient.labResults[patient.labResults.length - 1],
    });
}, { message: 'Error al guardar el laboratorio' });

// @desc    Historial de laboratorios del paciente (mas reciente primero)
// @route   GET /api/patients/:id/lab
// @access  Private
export const getLabResults = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.params.id).select('nutritionist labResults');

    if (!patient) {
        return res.status(404).json({
            success: false,
            message: 'Paciente no encontrado',
        });
    }

    if (!isOwnedBy(patient, req.user.id)) {
        return res.status(403).json({
            success: false,
            message: 'No autorizado para ver este paciente',
        });
    }

    const results = [...patient.labResults].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
        success: true,
        count: results.length,
        data: results,
    });
}, { message: 'Error al obtener los laboratorios' });

// @desc    Genera un enlace de un solo uso para el cuestionario pre-consulta
// @route   POST /api/patients/:id/pre-consultation-link
// @access  Private
export const generatePreConsultationLink = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.params.id).select('nutritionist firstName lastName');

    if (!patient) {
        return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
    }
    if (!isOwnedBy(patient, req.user.id)) {
        return res.status(403).json({ success: false, message: 'No autorizado para este paciente' });
    }

    // El valor crudo solo existe en esta respuesta; en Mongo se guarda su
    // hash (ver PreConsultationToken.js), así que ni un volcado de la base
    // de datos entrega un enlace utilizable.
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + PRE_CONSULTATION_TTL_DAYS * 24 * 60 * 60 * 1000);

    await PreConsultationToken.create({
        patient: patient._id,
        nutritionist: req.user.id,
        tokenHash,
        expiresAt,
    });

    res.status(201).json({
        success: true,
        data: {
            url: `${FRONTEND_URL}/consulta/${rawToken}`,
            expiresAt,
        },
    });
}, { message: 'Error al generar el enlace del cuestionario' });

// @desc    Genera (o regenera) el enlace permanente del portal del paciente
// @route   POST /api/patients/:id/portal-link
// @access  Private
export const generatePortalLink = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.params.id).select('nutritionist portalToken');

    if (!patient) {
        return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
    }
    if (!isOwnedBy(patient, req.user.id)) {
        return res.status(403).json({ success: false, message: 'No autorizado para este paciente' });
    }

    // Regenerar invalida el enlace anterior: útil si se compartió por error o
    // el paciente perdió el control del dispositivo donde lo guardó.
    patient.portalToken = crypto.randomBytes(24).toString('hex');
    await patient.save();

    res.status(200).json({
        success: true,
        data: { url: `${FRONTEND_URL}/portal/${patient.portalToken}` },
    });
}, { message: 'Error al generar el enlace del portal' });
