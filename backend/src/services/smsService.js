import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// Create Twilio client
let twilioClient = null;

const getTwilioClient = () => {
    if (!twilioClient) {
        // Check if Twilio is configured
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
            console.warn('Twilio service not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env');
            return null;
        }

        twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }
    return twilioClient;
};

/**
 * Send appointment reminder SMS to patient
 * @param {Object} patient - Patient object with phone, firstName, lastName
 * @param {Object} appointment - Appointment object with date, time
 * @param {Object} nutritionist - Nutritionist object with firstName, lastName
 * @returns {Promise<boolean>} - Returns true if sent successfully
 */
export const sendAppointmentReminder = async (patient, appointment, nutritionist) => {
    try {
        const client = getTwilioClient();

        if (!client) {
            console.warn('[SMS Service] Twilio not configured - skipping SMS reminder');
            return false;
        }

        if (!patient.phone) {
            console.warn(`[SMS Service] Patient ${patient.firstName} ${patient.lastName} has no phone - skipping`);
            return false;
        }

        if (!process.env.TWILIO_PHONE_NUMBER) {
            console.error('[SMS Service] TWILIO_PHONE_NUMBER not set in .env');
            return false;
        }

        const appointmentDate = new Date(appointment.date);
        const formattedDate = appointmentDate.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

        const nutritionistName = `${nutritionist.firstName} ${nutritionist.lastName}`;
        const patientName = patient.firstName;

        // Format phone number - Twilio requires E.164 format (e.g., +521234567890)
        let phoneNumber = patient.phone.replace(/\s+/g, ''); // Remove spaces
        if (!phoneNumber.startsWith('+')) {
            // If no country code, assume Mexico (+52)
            phoneNumber = `+52${phoneNumber}`;
        }

        const message = `Hola ${patientName}! Recordatorio de cita con ${nutritionistName} el ${formattedDate} a las ${appointment.time}. Por favor confirma tu asistencia.`;

        const result = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
        });


        return true;
    } catch (error) {
        console.error('[SMS Service] ❌ Error sending SMS:', error.message);
        if (error.code) {
            console.error(`[SMS Service] Twilio error code: ${error.code}`);
        }
        return false;
    }
};

export default {
    sendAppointmentReminder,
};
