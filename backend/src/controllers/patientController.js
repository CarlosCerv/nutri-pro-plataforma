import Patient from '../models/Patient.js';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

export const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and documents are allowed'));
        }
    },
});

// @desc    Get all active patients for logged-in nutritionist
// @route   GET /api/patients
// @access  Private
export const getPatients = async (req, res) => {
    try {
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
    } catch (error) {
        console.error('Get patients error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching patients',
            error: error.message,
        });
    }
};

// @desc    Get single patient by ID
// @route   GET /api/patients/:id
// @access  Private
export const getPatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found',
            });
        }

        // Make sure user owns this patient
        if (patient.nutritionist.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this patient',
            });
        }

        res.status(200).json({
            success: true,
            data: patient,
        });
    } catch (error) {
        console.error('Get patient error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching patient',
            error: error.message,
        });
    }
};

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private
export const createPatient = async (req, res) => {
    try {
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
    } catch (error) {
        console.error('Create patient error:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating patient',
            error: error.message,
        });
    }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
export const updatePatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found',
            });
        }

        // Make sure user owns this patient
        if (patient.nutritionist.toString() !== req.user.id) {
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
    } catch (error) {
        console.error('Update patient error:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating patient',
            error: error.message,
        });
    }
};

// @desc    Soft Delete patient (set isActive = false)
// @route   DELETE /api/patients/:id
// @access  Private
export const deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found',
            });
        }

        // Make sure user owns this patient
        if (patient.nutritionist.toString() !== req.user.id) {
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
    } catch (error) {
        console.error('Delete patient error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting patient',
            error: error.message,
        });
    }
};

// @desc    Upload document or image for patient
// @route   POST /api/patients/:id/upload
// @access  Private
export const uploadDocument = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found',
            });
        }

        // Make sure user owns this patient
        if (patient.nutritionist.toString() !== req.user.id) {
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

        if (isImage) {
            // It's a gallery image
            patient.images.push({
                url: `/uploads/${req.file.filename}`,
                type: req.body.type || 'other',
                date: new Date()
            });
        } else {
            // It's a general document or medical file
            const docData = {
                filename: req.file.filename,
                originalName: req.file.originalname,
                path: req.file.path,
                url: `/uploads/${req.file.filename}`,
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
    } catch (error) {
        console.error('Upload document error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading document',
            error: error.message,
        });
    }
};

// @desc    Export all patients for backup
// @route   GET /api/patients/export
// @access  Private
export const exportPatients = async (req, res) => {
    try {
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
    } catch (error) {
        console.error('Export patients error:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting patients',
            error: error.message,
        });
    }
};
