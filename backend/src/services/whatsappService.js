import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

let twilioClient = null;

const getTwilioClient = () => {
    if (!twilioClient) {
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
            console.warn('[WhatsApp Service] Twilio no configurado. Define TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN.');
            return null;
        }
        twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
    return twilioClient;
};

/** Twilio exige E.164 (+52...); si el teléfono capturado no trae lada, se asume México. */
function toE164(phone) {
    let numero = (phone || '').replace(/\s+/g, '');
    if (!numero) return null;
    if (!numero.startsWith('+')) numero = `+52${numero}`;
    return numero;
}

/**
 * Recordatorio de cita por WhatsApp Business (canal de Twilio).
 *
 * Un mensaje que el negocio inicia fuera de la ventana de 24 h de sesión
 * *tiene* que usar una plantilla aprobada por Meta — Twilio la referencia por
 * `contentSid` (Content API), con variables posicionales. Si no hay plantilla
 * configurada (`TWILIO_WHATSAPP_CONTENT_SID`), se manda el cuerpo libre: sirve
 * en el sandbox de pruebas y dentro de una sesión de 24 h ya abierta, pero
 * Meta lo rechazará para un contacto frío en producción — de ahí el aviso en
 * el log en vez de fallar en silencio.
 */
export const sendAppointmentReminder = async (patient, appointment, nutritionist) => {
    try {
        const client = getTwilioClient();
        if (!client) return false;

        const to = toE164(patient.phone);
        if (!to) {
            console.warn(`[WhatsApp Service] ${patient.firstName} ${patient.lastName} no tiene teléfono — se omite.`);
            return false;
        }

        const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
        if (!fromNumber) {
            console.error('[WhatsApp Service] TWILIO_WHATSAPP_NUMBER no está configurado.');
            return false;
        }

        const fecha = new Date(appointment.date).toLocaleDateString('es-MX', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });
        const nutriNombre = `${nutritionist.firstName} ${nutritionist.lastName}`;

        const payload = {
            from: `whatsapp:${fromNumber}`,
            to: `whatsapp:${to}`,
        };

        const contentSid = process.env.TWILIO_WHATSAPP_CONTENT_SID;
        if (contentSid) {
            // Plantilla aprobada: {{1}} nombre del paciente, {{2}} fecha,
            // {{3}} hora, {{4}} nutriólogo — el texto real vive en Meta/Twilio,
            // aquí solo se llenan las variables.
            payload.contentSid = contentSid;
            payload.contentVariables = JSON.stringify({
                1: patient.firstName,
                2: fecha,
                3: appointment.time,
                4: nutriNombre,
            });
        } else {
            console.warn('[WhatsApp Service] Sin TWILIO_WHATSAPP_CONTENT_SID: enviando cuerpo libre (solo válido en sandbox o dentro de una sesión de 24 h).');
            payload.body =
                `Hola ${patient.firstName}, te recordamos tu cita con ${nutriNombre} el ${fecha} a las ${appointment.time}.\n\n` +
                `Responde *SI* para confirmar o *CANCELAR* si no podrás asistir.`;
        }

        await client.messages.create(payload);
        return true;
    } catch (error) {
        console.error('[WhatsApp Service] ❌ Error enviando WhatsApp:', error.message);
        return false;
    }
};

export default { sendAppointmentReminder };
