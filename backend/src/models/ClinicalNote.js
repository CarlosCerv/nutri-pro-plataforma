import mongoose from 'mongoose';

const clinicalNoteSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    nutritionist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Cita de la que salió esta nota. Opcional: las notas retroactivas o
    // capturadas fuera de la pantalla de sesión no siempre tienen una.
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    // SOAP Structure
    subjective: {
        type: String,
        required: false,
        // Symptoms, patient complaints, lifestyle changes reported by patient
    },
    objective: {
        type: String,
        required: false,
        // Measurable data (anthropometry is linked via Patient model, this is for text observations)
    },
    analysis: {
        type: String,
        required: true,
        // Nutritionist's diagnosis and analysis of progress
    },
    plan: {
        type: String,
        required: true,
        // Nutritional plan, recommendations, goals for next visit
    },
    followUpDate: {
        type: Date,
        required: false
    },
    attachments: [{
        filename: String,
        path: String,
        uploadDate: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Index for quick lookup by patient and date
clinicalNoteSchema.index({ patient: 1, date: -1 });

export default mongoose.model('ClinicalNote', clinicalNoteSchema);
