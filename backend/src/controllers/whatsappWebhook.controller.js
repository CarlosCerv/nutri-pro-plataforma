import twilio from 'twilio';
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import asyncHandler from '../utils/asyncHandler.js';

const CONFIRM_WORDS = ['si', 'confirmo', 'confirmar', 'confirmado', '1', 'yes', 'ok'];
const CANCEL_WORDS = ['no', 'cancelar', 'cancela', 'cancelo', '2'];

const ACENTOS = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ñ: 'n' };
const sinAcentos = (s) => s.replace(/[áéíóúñ]/g, (c) => ACENTOS[c] || c);

/** Últimos 10 dígitos del número — suficiente para casar +52, 52 y el número local capturado sin lada. */
function last10Digits(raw) {
    const digitos = (raw || '').replace(/\D/g, '');
    return digitos.slice(-10);
}

function buildTwimlReply(mensaje) {
    const twiml = new twilio.twiml.MessagingResponse();
    if (mensaje) twiml.message(mensaje);
    return twiml.toString();
}

/**
 * Reconstruye la URL exacta que Twilio firmó, para validar
 * `X-Twilio-Signature`. Detrás de un proxy (Vercel) hay que confiar en
 * `X-Forwarded-Proto`/`Host` en vez de `req.protocol`, que ahí siempre
 * reporta "http".
 */
function requestUrl(req) {
    if (process.env.PUBLIC_API_URL) {
        return `${process.env.PUBLIC_API_URL.replace(/\/$/, '')}${req.originalUrl}`;
    }
    const proto = req.headers['x-forwarded-proto'] || req.protocol;
    return `${proto}://${req.get('host')}${req.originalUrl}`;
}

// @desc    Webhook de respuestas de WhatsApp (confirmar/cancelar cita)
// @route   POST /api/webhooks/twilio/whatsapp
// @access  Public (verificado por firma de Twilio, no por JWT)
export const handleWhatsAppReply = asyncHandler(async (req, res) => {
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const signature = req.headers['x-twilio-signature'];

    // Sin TWILIO_AUTH_TOKEN no hay forma de validar la firma: se rechaza en
    // vez de procesar un webhook que cualquiera podría falsificar.
    if (!authToken) {
        console.error('[WhatsApp Webhook] TWILIO_AUTH_TOKEN no configurado — se rechaza.');
        return res.status(500).send(buildTwimlReply(''));
    }

    const firmaValida = twilio.validateRequest(authToken, signature || '', requestUrl(req), req.body);
    if (!firmaValida) {
        return res.status(403).send(buildTwimlReply(''));
    }

    const from = req.body.From || ''; // "whatsapp:+52155..."
    const texto = sinAcentos(String(req.body.Body || '').trim().toLowerCase());
    const sufijo = last10Digits(from);

    if (!sufijo) {
        return res.status(200).send(buildTwimlReply(''));
    }

    const paciente = await Patient.findOne({ phone: { $regex: `${sufijo}$` } });
    if (!paciente) {
        return res.status(200).send(buildTwimlReply(''));
    }

    const cita = await Appointment.findOne({
        patient: paciente._id,
        status: 'scheduled',
        date: { $gte: new Date() },
    }).sort({ date: 1 });

    if (!cita) {
        return res.status(200).send(buildTwimlReply(''));
    }

    if (CONFIRM_WORDS.includes(texto)) {
        cita.confirmedByPatient = true;
        cita.confirmedAt = new Date();
        await cita.save();
        return res.status(200).send(buildTwimlReply(`Gracias ${paciente.firstName}, tu cita quedó confirmada. Te esperamos.`));
    }

    if (CANCEL_WORDS.includes(texto)) {
        cita.status = 'cancelled';
        cita.confirmedByPatient = false;
        await cita.save();
        return res.status(200).send(buildTwimlReply(`Entendido, cancelamos tu cita. Escríbenos si quieres reagendar.`));
    }

    return res.status(200).send(
        buildTwimlReply('No entendimos tu respuesta. Contesta *SI* para confirmar tu cita o *CANCELAR* si no podrás asistir.')
    );
}, { message: 'Error procesando la respuesta de WhatsApp' });
