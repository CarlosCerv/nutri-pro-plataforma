import mongoose from 'mongoose';

const bodyCompositionSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
        index: true
    },
    date: {
        type: Date,
        default: Date.now,
        index: true
    },
    // Pliegues cutáneos (mm)
    skinfolds: {
        triceps: { type: Number, min: 0 },
        biceps: { type: Number, min: 0 },
        subscapular: { type: Number, min: 0 },
        suprailiac: { type: Number, min: 0 },
        abdominal: { type: Number, min: 0 },
        thigh: { type: Number, min: 0 },
        calf: { type: Number, min: 0 }
    },
    // Perímetros (cm)
    circumferences: {
        neck: { type: Number, min: 0 },
        chest: { type: Number, min: 0 },
        waist: { type: Number, min: 0 },
        hip: { type: Number, min: 0 },
        arm: { type: Number, min: 0 },
        forearm: { type: Number, min: 0 },
        thigh: { type: Number, min: 0 },
        calf: { type: Number, min: 0 }
    },
    // Diámetros óseos (cm)
    boneDiameters: {
        wrist: { type: Number, min: 0 },
        elbow: { type: Number, min: 0 },
        knee: { type: Number, min: 0 },
        ankle: { type: Number, min: 0 }
    },
    // Composición corporal calculada
    composition: {
        bodyFatPercentage: Number,
        fatMass: Number,
        leanMass: Number,
        muscleMass: Number,
        boneMass: Number,
        visceralFat: Number
    },
    // Fórmula utilizada para cálculo
    calculationMethod: {
        type: String,
        enum: ['jackson-pollock-3', 'jackson-pollock-7', 'durnin-womersley', 'bioimpedance', 'manual']
    },
    notes: String,
    nutritionist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Índice compuesto para búsquedas eficientes
bodyCompositionSchema.index({ patient: 1, date: -1 });

export default mongoose.model('BodyComposition', bodyCompositionSchema);
