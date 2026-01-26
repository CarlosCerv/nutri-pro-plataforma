import BodyComposition from '../models/BodyComposition.js';
import Patient from '../models/Patient.js';
import NutritionCalculator from '../services/nutritionCalculator.js';

// Create new body composition record
export const create = async (req, res) => {
    try {
        const { patientId, ...data } = req.body;

        // Verify patient exists and belongs to this nutritionist
        const patient = await Patient.findOne({
            _id: patientId,
            nutritionist: req.user._id
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Paciente no encontrado'
            });
        }

        // Calculate body composition if skinfolds are provided
        if (data.skinfolds && data.calculationMethod) {
            const weight = patient.anthropometry?.weight || 0;
            const age = patient.dateOfBirth
                ? Math.floor((Date.now() - new Date(patient.dateOfBirth)) / 31557600000)
                : 30;
            const gender = patient.gender || 'male';

            let bodyFatPercentage;

            if (data.calculationMethod === 'jackson-pollock-3') {
                bodyFatPercentage = NutritionCalculator.calculateBodyFat3Site(
                    data.skinfolds, age, gender
                );
            } else if (data.calculationMethod === 'jackson-pollock-7') {
                bodyFatPercentage = NutritionCalculator.calculateBodyFat7Site(
                    data.skinfolds, age, gender
                );
            }

            if (bodyFatPercentage && weight) {
                const composition = NutritionCalculator.calculateBodyComposition(
                    weight, bodyFatPercentage
                );
                data.composition = {
                    bodyFatPercentage,
                    ...composition
                };
            }
        }

        const bodyComposition = new BodyComposition({
            patient: patientId,
            nutritionist: req.user._id,
            ...data
        });

        await bodyComposition.save();

        res.status(201).json({
            success: true,
            data: bodyComposition
        });
    } catch (error) {
        console.error('Error creating body composition:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear registro de composición corporal',
            error: error.message
        });
    }
};

// Get all body composition records for a patient
export const getByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;

        // Verify patient belongs to this nutritionist
        const patient = await Patient.findOne({
            _id: patientId,
            nutritionist: req.user._id
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Paciente no encontrado'
            });
        }

        const records = await BodyComposition.find({ patient: patientId })
            .sort({ date: -1 })
            .limit(50);

        res.json({
            success: true,
            data: records
        });
    } catch (error) {
        console.error('Error fetching body composition:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener registros',
            error: error.message
        });
    }
};

// Get single body composition record
export const getOne = async (req, res) => {
    try {
        const { id } = req.params;

        const record = await BodyComposition.findById(id)
            .populate('patient', 'firstName lastName');

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Registro no encontrado'
            });
        }

        // Verify access
        if (record.nutritionist.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'No autorizado'
            });
        }

        res.json({
            success: true,
            data: record
        });
    } catch (error) {
        console.error('Error fetching body composition:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener registro',
            error: error.message
        });
    }
};

// Update body composition record
export const update = async (req, res) => {
    try {
        const { id } = req.params;

        const record = await BodyComposition.findById(id);

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Registro no encontrado'
            });
        }

        // Verify access
        if (record.nutritionist.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'No autorizado'
            });
        }

        Object.assign(record, req.body);
        await record.save();

        res.json({
            success: true,
            data: record
        });
    } catch (error) {
        console.error('Error updating body composition:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar registro',
            error: error.message
        });
    }
};

// Delete body composition record
export const deleteRecord = async (req, res) => {
    try {
        const { id } = req.params;

        const record = await BodyComposition.findById(id);

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Registro no encontrado'
            });
        }

        // Verify access
        if (record.nutritionist.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'No autorizado'
            });
        }

        await record.deleteOne();

        res.json({
            success: true,
            message: 'Registro eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error deleting body composition:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar registro',
            error: error.message
        });
    }
};
