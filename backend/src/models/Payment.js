import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    nutritionist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: false, // Optional: Can charge for things other than appointments
    },
    amount: {
        type: Number,
        required: [true, 'Please provide payment amount'],
        min: 0
    },
    date: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'cancelled'],
        default: 'pending',
    },
    method: {
        type: String,
        enum: ['cash', 'card', 'transfer', 'other'],
        default: 'cash',
    },
    notes: {
        type: String,
        trim: true,
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

paymentSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Index for efficient queries
paymentSchema.index({ nutritionist: 1, date: -1 });
paymentSchema.index({ patient: 1, date: -1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
