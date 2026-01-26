import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
    // Personal Information
    firstName: {
        type: String,
        required: [true, 'Please provide first name'],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, 'Please provide last name'],
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    dateOfBirth: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', ''],
    },

    // Module 1: Patient Status & Profile
    isActive: {
        type: Boolean,
        default: true
    },
    eatingHabits: {
        type: String, // Free text or structured questionnaire
        trim: true
    },
    images: [{
        url: String,
        type: { type: String, enum: ['front', 'side', 'back', 'other'] },
        date: { type: Date, default: Date.now }
    }],

    // Module 2: Advanced Anthropometry & History
    // Keeping 'anthropometry' for current snapshot, but adding history for tracking
    anthropometry: {
        weight: { type: Number },
        height: { type: Number },
        bmi: { type: Number },
        waistCircumference: { type: Number },
        hipCircumference: { type: Number },
        bodyFatPercentage: { type: Number },
        muscleMass: { type: Number },

        // Bioimpedance
        bioimpedance: {
            fatPercentage: Number,
            muscleMass: Number,
            waterPercentage: Number,
            visceralFat: Number,
            boneMass: Number,
            metabolicAge: Number
        },
        // Skinfolds (mm)
        skinfolds: {
            tricipital: Number,
            bicipital: Number,
            subscapular: Number,
            suprailiac: Number,
            abdominal: Number,
            thigh: Number,
            calf: Number
        },
        // Perimeters (cm)
        perimeters: {
            arm: Number, // Relaxed
            armFlexed: Number,
            waist: Number,
            hip: Number,
            thigh: Number,
            calf: Number
        },
        // Bone Diameters (cm)
        diameters: {
            humerus: Number,
            femur: Number,
            wrist: Number
        },

        lastUpdated: { type: Date, default: Date.now },
    },

    anthropometryHistory: [{
        date: { type: Date, default: Date.now },
        weight: Number,
        height: Number,
        bmi: Number,
        // Bioimpedance
        bioimpedance: {
            fatPercentage: Number,
            muscleMass: Number,
            waterPercentage: Number,
            visceralFat: Number,
            boneMass: Number,
            metabolicAge: Number
        },
        // Skinfolds (mm)
        skinfolds: {
            tricipital: Number,
            bicipital: Number,
            subscapular: Number,
            suprailiac: Number,
            abdominal: Number,
            thigh: Number,
            calf: Number
        },
        // Perimeters (cm)
        perimeters: {
            arm: Number, // Relaxed
            armFlexed: Number,
            waist: Number,
            hip: Number,
            thigh: Number,
            calf: Number
        },
        // Bone Diameters (cm)
        diameters: {
            humerus: Number,
            femur: Number,
            wrist: Number
        },
        // Vitals
        vitals: {
            bloodPressure: String, // "120/80"
            heartRate: Number,
            temperature: Number,
            oxygenSaturation: Number
        },
        notes: String
    }],

    // Files & Documents
    medicalFiles: [{
        url: String,
        filename: String, // Original name
        type: { type: String, enum: ['lab_result', 'prescription', 'referral', 'other'] },
        uploadDate: { type: Date, default: Date.now }
    }],

    // Status
    status: {
        type: String,
        enum: ['active', 'inactive', 'completed'],
        default: 'active',
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
patientSchema.pre('save', function (next) {
    this.updatedAt = Date.now();

    // Calculate BMI if weight and height are available
    if (this.anthropometry.weight && this.anthropometry.height) {
        const heightInMeters = this.anthropometry.height / 100;
        this.anthropometry.bmi = (this.anthropometry.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }

    next();
});

// Virtual for full name
patientSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
