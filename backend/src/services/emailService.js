import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter
let transporter = null;

const getTransporter = () => {
    if (!transporter) {
        // Check if email is configured
        if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
            console.warn('Email service not configured. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD in .env');
            return null;
        }

        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }
    return transporter;
};

/**
 * Send appointment reminder email to patient
 * @param {Object} patient - Patient object with email, firstName, lastName
 * @param {Object} appointment - Appointment object with date, time, duration
 * @param {Object} nutritionist - Nutritionist object with firstName, lastName
 * @returns {Promise<boolean>} - Returns true if sent successfully
 */
export const sendAppointmentReminder = async (patient, appointment, nutritionist) => {
    try {
        const transport = getTransporter();

        if (!transport) {
            console.warn('[Email Service] Email not configured - skipping email reminder');
            return false;
        }

        if (!patient.email) {
            console.warn(`[Email Service] Patient ${patient.firstName} ${patient.lastName} has no email - skipping`);
            return false;
        }

        const appointmentDate = new Date(appointment.date);
        const formattedDate = appointmentDate.toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        const nutritionistName = `${nutritionist.firstName} ${nutritionist.lastName}`;
        const patientName = `${patient.firstName} ${patient.lastName}`;

        const mailOptions = {
            from: process.env.EMAIL_FROM || `"Nutrition Platform" <${process.env.EMAIL_USER}>`,
            to: patient.email,
            subject: `Recordatorio: Cita con ${nutritionistName} - ${formattedDate}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            background: #f9f9f9;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                        }
                        .appointment-details {
                            background: white;
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                            border-left: 4px solid #667eea;
                        }
                        .detail-row {
                            margin: 10px 0;
                        }
                        .label {
                            font-weight: bold;
                            color: #667eea;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            font-size: 12px;
                            color: #666;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1 style="margin: 0;">🗓️ Recordatorio de Cita</h1>
                        </div>
                        <div class="content">
                            <p>Hola <strong>${patientName}</strong>,</p>
                            
                            <p>Este es un recordatorio de tu próxima cita de nutrición:</p>
                            
                            <div class="appointment-details">
                                <div class="detail-row">
                                    <span class="label">📅 Fecha:</span> ${formattedDate}
                                </div>
                                <div class="detail-row">
                                    <span class="label">🕐 Hora:</span> ${appointment.time}
                                </div>
                                <div class="detail-row">
                                    <span class="label">⏱️ Duración:</span> ${appointment.duration} minutos
                                </div>
                                <div class="detail-row">
                                    <span class="label">👨‍⚕️ Nutricionista:</span> ${nutritionistName}
                                </div>
                            </div>
                            
                            <p><strong>Por favor, confirma tu asistencia o notifica si necesitas reagendar.</strong></p>
                            
                            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                            
                            <p style="margin-top: 20px;">Saludos cordiales,<br>
                            <strong>${nutritionistName}</strong></p>
                        </div>
                        <div class="footer">
                            <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transport.sendMail(mailOptions);

        return true;
    } catch (error) {
        console.error('[Email Service] ❌ Error sending email:', error.message);
        return false;
    }
};

export default {
    sendAppointmentReminder,
};
