import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: false, // Changed to false to allow guests
    },
    isGuest: {
        type: Boolean,
        default: false,
    },
    guestDetails: {
        firstName: { type: String },
        lastName: { type: String },
        email: { type: String },
        phone: { type: String },
    },
    nutritionist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: [true, 'Please provide appointment date'],
    },
    time: {
        type: String,
        required: [true, 'Please provide appointment time'],
    },
    duration: {
        type: Number,
        default: 60, // minutes
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
        default: 'scheduled',
    },
    type: {
        type: String,
        enum: ['initial', 'follow_up', 'check_in', 'final'],
        default: 'follow_up',
    },
    notes: {
        type: String,
    },
    // Consultation details
    consultation: {
        weight: { type: Number },
        bloodPressure: { type: String },
        observations: { type: String },
        recommendations: { type: String },
        nextSteps: { type: String },
    },
    // Reminder tracking
    reminderSent: {
        type: Boolean,
        default: false,
    },
    reminderSentAt: {
        type: Date,
    },
    reminderEmail: {
        type: Boolean,
        default: false,
    },
    reminderSMS: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update the updatedAt timestamp before saving
appointmentSchema.pre('save', function (next) {
    this.updatedAt = Date.now();

    // Validation: Require either patient or guest details
    if (!this.patient && !this.isGuest) {
        return next(new Error('Appointment must belong to a patient or be a guest appointment'));
    }

    if (this.isGuest && (!this.guestDetails || !this.guestDetails.firstName)) {
        return next(new Error('Guest appointments require at least a first name'));
    }

    next();
});

// Index for efficient queries
appointmentSchema.index({ nutritionist: 1, date: 1 });
appointmentSchema.index({ patient: 1, date: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
