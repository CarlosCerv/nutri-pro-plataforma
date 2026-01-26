import express from 'express';
import { createNote, getPatientNotes, updateNote, deleteNote } from '../controllers/clinicalNotes.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Base route: /api/clinical-notes

// Get all notes for a patient and create new note
router.route('/patient/:patientId')
    .get(protect, getPatientNotes)
    .post(protect, createNote);

// Specific note operations
router.route('/:noteId')
    .put(protect, updateNote)
    .delete(protect, deleteNote);

export default router;
