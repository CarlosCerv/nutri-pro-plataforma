import ClinicalNote from '../models/ClinicalNote.js';
import Patient from '../models/Patient.js';

// Create a new clinical note
export const createNote = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { subjective, objective, analysis, plan, followUpDate, date } = req.body;

        // Verify patient exists
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        // Verify patient belongs to nutritionist (optional security check)
        if (patient.nutritionist.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to add notes for this patient' });
        }

        const newNote = new ClinicalNote({
            patient: patientId,
            nutritionist: req.user._id,
            date: date || new Date(),
            subjective,
            objective,
            analysis,
            plan,
            followUpDate
        });

        await newNote.save();

        res.status(201).json({
            success: true,
            data: newNote,
            message: 'Clinical note created successfully'
        });

    } catch (error) {
        console.error('Error creating clinical note:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get all notes for a specific patient
export const getPatientNotes = async (req, res) => {
    try {
        const { patientId } = req.params;

        const notes = await ClinicalNote.find({ patient: patientId })
            .sort({ date: -1 })
            .populate('nutritionist', 'name lastName'); // Optional: populate nutritionist info

        res.json({
            success: true,
            data: notes
        });

    } catch (error) {
        console.error('Error fetching clinical notes:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Update a clinical note
export const updateNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const updates = req.body;

        const note = await ClinicalNote.findOne({ _id: noteId, nutritionist: req.user._id });

        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found or authorized' });
        }

        Object.keys(updates).forEach(key => {
            note[key] = updates[key];
        });

        await note.save();

        res.json({
            success: true,
            data: note,
            message: 'Note updated successfully'
        });

    } catch (error) {
        console.error('Error updating clinical note:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Delete a clinical note
export const deleteNote = async (req, res) => {
    try {
        const { noteId } = req.params;

        const note = await ClinicalNote.findOneAndDelete({ _id: noteId, nutritionist: req.user._id });

        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found or authorized' });
        }

        res.json({
            success: true,
            message: 'Note deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting clinical note:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
