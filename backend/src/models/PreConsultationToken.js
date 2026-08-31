import mongoose from 'mongoose';

/**
 * Token de un solo uso para el cuestionario pre-consulta autogestionado.
 *
 * Solo se guarda el hash (SHA-256) del token, nunca el valor crudo — el
 * mismo patrón que un token de reseteo de contraseña. El valor crudo se
 * genera y se entrega una sola vez, en la respuesta de
 * `POST /api/patients/:id/pre-consultation-link`; si esta colección se
 * filtrara, nadie podría reconstruir un enlace válido a partir de ella.
 */
const preConsultationTokenSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
        index: true,
    },
    nutritionist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tokenHash: {
        type: String,
        required: true,
        unique: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    usedAt: {
        type: Date,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// TTL: Mongo borra el documento solo después de expirar, así la colección no
// acumula tokens vencidos indefinidamente.
preConsultationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PreConsultationToken = mongoose.model('PreConsultationToken', preConsultationTokenSchema);

export default PreConsultationToken;
