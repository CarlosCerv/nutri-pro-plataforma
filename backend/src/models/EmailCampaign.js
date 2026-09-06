import mongoose from 'mongoose';

// Destinatarios embebidos a propósito: el volumen esperado (decenas/cientos de
// nutriólogos por campaña) queda muy por debajo del límite de 16MB de un
// documento de Mongo, y evita mantener una colección aparte + índices +
// agregaciones solo para reconstruir tres contadores.
const recipientSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Snapshot del correo al momento de crear la campaña: si el usuario
    // cambia su email después, el historial de envío no se corrompe.
    email: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'skipped_optout'],
        default: 'pending',
    },
    error: { type: String },
    sentAt: { type: Date },
}, { _id: false });

const emailCampaignSchema = new mongoose.Schema({
    subject: { type: String, required: true, trim: true },
    bodyHtml: { type: String, required: true },
    segment: {
        type: {
            type: String,
            enum: ['all', 'active', 'inactive', 'custom'],
            default: 'all',
        },
        userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    status: {
        type: String,
        enum: ['draft', 'sending', 'sent', 'failed'],
        default: 'draft',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sentAt: { type: Date },
    recipients: [recipientSchema],
    // Denormalizado a propósito: evita recorrer `recipients` en cada listado
    // de campañas solo para pintar tres números.
    stats: {
        total: { type: Number, default: 0 },
        sent: { type: Number, default: 0 },
        failed: { type: Number, default: 0 },
        skipped: { type: Number, default: 0 },
    },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('EmailCampaign', emailCampaignSchema);
