import ClinicalNote from '../models/ClinicalNote.js';
import Patient from '../models/Patient.js';
import asyncHandler from '../utils/asyncHandler.js';
import isOwnedBy from '../utils/ownership.js';

// Create a new clinical note
export const createNote = asyncHandler(async (req, res) => {
    const { patientId } = req.params;
    const { subjective, objective, analysis, plan, followUpDate, date } = req.body;

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Verify patient belongs to nutritionist (optional security check)
    if (!isOwnedBy(patient, req.user._id)) {
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
}, { message: 'Server error' });

// Get all notes for a specific patient
export const getPatientNotes = asyncHandler(async (req, res) => {
    const { patientId } = req.params;

    // Verify patient belongs to nutritionist — sin esto, cualquier cuenta
    // autenticada podia leer las notas clinicas de un paciente ajeno con
    // solo conocer su id.
    const patient = await Patient.findById(patientId);
    if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    if (!isOwnedBy(patient, req.user._id)) {
        return res.status(403).json({ success: false, message: 'Not authorized to view notes for this patient' });
    }

    const notes = await ClinicalNote.find({ patient: patientId })
        .sort({ date: -1 })
        .populate('nutritionist', 'name lastName'); // Optional: populate nutritionist info

    res.json({
        success: true,
        data: notes
    });
}, { message: 'Server error' });

// Update a clinical note
export const updateNote = asyncHandler(async (req, res) => {
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
}, { message: 'Server error' });

// Delete a clinical note
export const deleteNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;

    const note = await ClinicalNote.findOneAndDelete({ _id: noteId, nutritionist: req.user._id });

    if (!note) {
        return res.status(404).json({ success: false, message: 'Note not found or authorized' });
    }

    res.json({
        success: true,
        message: 'Note deleted successfully'
    });
}, { message: 'Server error' });
