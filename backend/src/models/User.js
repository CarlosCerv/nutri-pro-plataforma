import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false, // Don't return password by default
    },
    role: {
        type: String,
        enum: ['nutritionist', 'admin'],
        default: 'nutritionist',
    },
    specialty: {
        type: String,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    firstAccess: {
        type: Boolean,
        default: false,
    },

    // Página pública de agendamiento (nutripro.app/@usuario). `username` vive
    // aparte de `publicBooking` porque es la identidad de la URL: única y
    // minúsculas siempre, incluso si el nutriólogo nunca activa la página.
    username: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        sparse: true, // varios usuarios pueden no tener username todavía
        match: [/^[a-z0-9](?:[a-z0-9._-]{1,28}[a-z0-9])?$/, 'El usuario solo admite letras, números, puntos, guiones y guion bajo'],
    },
    publicBooking: {
        enabled: { type: Boolean, default: false },
        bio: { type: String, trim: true, maxlength: 600 },
        services: [{
            name: { type: String, trim: true, required: true },
            durationMinutes: { type: Number, min: 5, max: 480, default: 60 },
            price: { type: Number, min: 0 },
        }],
        // `day`: 0 = domingo … 6 = sábado (igual que Date#getDay()).
        workingHours: [{
            day: { type: Number, min: 0, max: 6, required: true },
            start: { type: String, match: /^\d{2}:\d{2}$/, required: true },
            end: { type: String, match: /^\d{2}:\d{2}$/, required: true },
        }],
        slotDurationMinutes: { type: Number, min: 5, max: 240, default: 60 },
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
