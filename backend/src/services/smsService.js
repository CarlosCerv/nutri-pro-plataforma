import twilio from 'twilio';
import dotenv from 'dotenv';
import { createModuleLogger } from '../config/logger.js';

dotenv.config();

const logger = createModuleLogger('sms');

// Create Twilio client
let twilioClient = null;

const getTwilioClient = () => {
    if (!twilioClient) {
        // Check if Twilio is configured
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
            logger.warn('Twilio service not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env');
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
            logger.warn('Twilio not configured - skipping SMS reminder');
            return false;
        }

        if (!patient.phone) {
            logger.warn({ patientId: patient._id }, 'Patient has no phone - skipping');
            return false;
        }

        if (!process.env.TWILIO_PHONE_NUMBER) {
            logger.error('TWILIO_PHONE_NUMBER not set in .env');
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
        logger.error({ err: error, twilioErrorCode: error.code }, 'Error sending SMS');
        return false;
    }
};

export default {
    sendAppointmentReminder,
};
