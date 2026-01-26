import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';

// @desc    Get all appointments for logged-in nutritionist
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req, res) => {
    try {
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
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching appointments',
            error: error.message,
        });
    }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patient', 'firstName lastName email phone');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        // Make sure user owns this appointment
        if (appointment.nutritionist.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this appointment',
            });
        }

        res.status(200).json({
            success: true,
            data: appointment,
        });
    } catch (error) {
        console.error('Get appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching appointment',
            error: error.message,
        });
    }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = async (req, res) => {
    try {


        // Verify patient exists and belongs to this nutritionist
        const patient = await Patient.findById(req.body.patient);

        if (!patient) {

            return res.status(404).json({
                success: false,
                message: 'Patient not found',
            });
        }



        if (patient.nutritionist.toString() !== req.user.id) {

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
    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating appointment',
            error: error.message,
        });
    }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = async (req, res) => {
    try {
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        // Make sure user owns this appointment
        if (appointment.nutritionist.toString() !== req.user.id) {
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
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating appointment',
            error: error.message,
        });
    }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
export const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        // Make sure user owns this appointment
        if (appointment.nutritionist.toString() !== req.user.id) {
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
    } catch (error) {
        console.error('Delete appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting appointment',
            error: error.message,
        });
    }
};
