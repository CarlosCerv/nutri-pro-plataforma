import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
    nutritionist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },

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

    // ─────────────────────────────────────────────────────────────────
    // Campos clinicos que captura el expediente del frontend.
    //
    // Existen porque Mongoose corre en modo `strict` y descartaba en silencio
    // todo lo que las pestañas enviaban en `PUT /api/patients/:id`: la
    // peticion respondia 200 y la captura clinica no se guardaba en ninguna
    // parte. Los nombres siguen a la interfaz (español) a proposito; la
    // unificacion con `anthropometry`/`dateOfBirth`/`gender` es un trabajo
    // aparte que implica migrar datos, no solo renombrar.
    // ─────────────────────────────────────────────────────────────────
    dob: { type: Date },
    sex: { type: String, enum: ['F', 'M', 'O', ''] },
    curp: { type: String, trim: true, uppercase: true },
    address: { type: String, trim: true },

    // Antecedentes (GeneralDataTab)
    antFamDM: { type: Boolean, default: false },
    antFamHTA: { type: Boolean, default: false },
    antFamObesidad: { type: Boolean, default: false },
    antFamCancer: { type: Boolean, default: false },
    antPersonales: { type: String, trim: true },
    cirugiasPrevias: { type: String, trim: true },
    alergias: { type: String, trim: true },
    intolerancias: { type: String, trim: true },
    medicamentos: { type: String, trim: true },

    // Estilo de vida y habitos toxicos (GeneralDataTab)
    horasSueno: { type: Number, min: 0, max: 24 },
    nivelEstres: { type: Number, min: 0, max: 10 },
    ocupacion: { type: String, trim: true },
    horasLaboral: { type: Number, min: 0, max: 24 },
    tabaquismo: { type: Number, min: 0 },
    alcoholismo: { type: Number, min: 0 },

    // Valoracion clinica (ClinicalTab)
    diagnosticoNutricional: { type: String, trim: true },
    patologias: [{ type: String, trim: true }],
    sintomasGI: [{ type: String, trim: true }],
    objetivos: [{ type: String, trim: true }],
    notasClinicas: { type: String, trim: true },

    // Habitos alimentarios (FoodHabitsTab)
    preferencias: { type: String, trim: true },
    disgustos: { type: String, trim: true },
    objetivoAlim: { type: String, trim: true },
    frecuencias: { type: Map, of: String, default: {} },
    horariosComida: [{
        nombre: { type: String, trim: true },
        hora: { type: String, trim: true },
    }],
    recordatorio24h: { type: String, trim: true },

    // Actividad fisica (PhysicalActivityTab)
    nivelActividad: {
        type: String,
        enum: ['sedentario', 'ligero', 'moderado', 'activo', 'muy_activo', ''],
        default: 'sedentario',
    },
    actividadesRegistradas: [{
        // `id` lo genera el cliente con Date.now(), por eso es Number y no ObjectId.
        id: { type: Number },
        nombre: { type: String, trim: true },
        met: { type: Number, min: 0 },
        duracion: { type: Number, min: 0 },   // minutos por sesion
    }],
    prescripcion: { type: String, trim: true },

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
        filename: String,
        originalName: String,
        path: String,
        type: { type: String, enum: ['lab_result', 'prescription', 'referral', 'other'] },
        uploadDate: { type: Date, default: Date.now }
    }],
    documents: [{
        url: String,
        filename: String,
        originalName: String,
        path: String,
        type: { type: String, enum: ['lab_result', 'prescription', 'referral', 'other'] },
        uploadDate: { type: Date, default: Date.now }
    }],

    // Resultados de laboratorio por consulta.
    // Los analiticos que captura la interfaz (LAB_GROUPS en
    // frontend/src/pages/patient-tabs/LaboratoryTab.jsx) son una lista abierta
    // que crece con el catalogo clinico, por eso `values` es un Map libre en
    // vez de un esquema fijo. `vitals` si tiene forma conocida.
    labResults: [{
        date: { type: Date, default: Date.now },
        values: { type: Map, of: Number, default: {} },
        vitals: {
            temperature: Number,
            heartRate: Number,
            respiratoryRate: Number,
        },
        createdAt: { type: Date, default: Date.now },
    }],

    // Status
    status: {
        type: String,
        enum: ['active', 'inactive', 'completed'],
        default: 'active',
    },

    // Portal ligero del paciente: token permanente (no expira, se regenera a
    // demanda) que da acceso de solo lectura a su plan activo y lista de
    // compras sin necesitar cuenta ni contraseña. Vive aquí y no en una
    // colección aparte porque es 1:1 con el paciente — el cuestionario
    // pre-consulta sí usa una colección propia (`PreConsultationToken`)
    // porque ahí un mismo paciente puede tener varios tokens en el tiempo,
    // cada uno expirable y de un solo uso.
    portalToken: { type: String, index: true, unique: true, sparse: true },
    preConsultationCompletedAt: { type: Date },

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

patientSchema.index({ nutritionist: 1, isActive: 1 });

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
