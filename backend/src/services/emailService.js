import { Resend } from 'resend';
import dotenv from 'dotenv';
import { createModuleLogger } from '../config/logger.js';

dotenv.config();

const logger = createModuleLogger('email');

let resendClient = null;

const getResendClient = () => {
    if (!resendClient) {
        if (!process.env.RESEND_API_KEY) {
            logger.warn('Email no configurado. Falta RESEND_API_KEY en .env');
            return null;
        }
        resendClient = new Resend(process.env.RESEND_API_KEY);
    }
    return resendClient;
};

/**
 * Envío genérico sobre Resend. Igual que el `transporter` de Nodemailer que
 * reemplaza: si no está configurado, registra un warning y devuelve `false`
 * en vez de tronar — ningún flujo del sistema (registro, recordatorios, cron)
 * debe caerse porque un correo no salió.
 */
export const sendEmail = async ({ to, subject, html }) => {
    const client = getResendClient();
    if (!client) return false;

    if (!to) {
        logger.warn('sendEmail sin destinatario - se omite');
        return false;
    }

    try {
        const { error } = await client.emails.send({
            from: process.env.EMAIL_FROM || 'NutriPro <noreply@nutripro.app>',
            to,
            subject,
            html,
        });

        if (error) {
            logger.error({ err: error }, 'Resend devolvió un error');
            return false;
        }

        return true;
    } catch (error) {
        logger.error({ err: error }, 'Error enviando email con Resend');
        return false;
    }
};

/**
 * Send appointment reminder email to patient
 * @param {Object} patient - Patient object with email, firstName, lastName
 * @param {Object} appointment - Appointment object with date, time, duration
 * @param {Object} nutritionist - Nutritionist object with firstName, lastName
 * @returns {Promise<boolean>} - Returns true if sent successfully
 */
export const sendAppointmentReminder = async (patient, appointment, nutritionist) => {
    if (!patient.email) {
        logger.warn({ patientId: patient._id }, 'Patient has no email - skipping');
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

    const html = `
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
    `;

    return sendEmail({
        to: patient.email,
        subject: `Recordatorio: Cita con ${nutritionistName} - ${formattedDate}`,
        html,
    });
};

/**
 * Correo transaccional de bienvenida al registrarse. No depende de
 * `notificationPreferences` — es confirmación de registro, no opcional.
 * @param {Object} nutritionist - documento de User recién creado
 */
export const sendWelcomeEmail = async (nutritionist) => {
    if (!nutritionist?.email) {
        logger.warn('sendWelcomeEmail sin email - se omite');
        return false;
    }

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;
                }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">👋 Bienvenido a NutriPro</h1>
                </div>
                <div class="content">
                    <p>Hola <strong>${nutritionist.name}</strong>,</p>
                    <p>Tu cuenta en NutriPro ya está lista. Desde aquí vas a poder llevar el expediente de tus pacientes, tu agenda de citas y tus planes de alimentación en un solo lugar.</p>
                    <p>Si tienes cualquier duda para empezar, responde a este correo y con gusto te ayudamos.</p>
                    <p style="margin-top: 20px;">Saludos,<br><strong>El equipo de NutriPro</strong></p>
                </div>
                <div class="footer">
                    <p>Recibiste este correo porque acabas de crear una cuenta en NutriPro.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to: nutritionist.email,
        subject: 'Bienvenido a NutriPro',
        html,
    });
};

/**
 * Reporte periódico de uso de la cuenta. Se filtra por
 * `notificationPreferences.usageReports` en la capa que llama a esto
 * (`usageReportService.js`), no aquí.
 * @param {Object} nutritionist
 * @param {{patients:number, appointments:number, mealPlans:number}} stats
 * @param {string} periodLabel - ej. "septiembre 2026"
 */
export const sendUsageReportEmail = async (nutritionist, stats, periodLabel) => {
    if (!nutritionist?.email) {
        logger.warn('sendUsageReportEmail sin email - se omite');
        return false;
    }

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;
                }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .stats { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                .stat-row { margin: 10px 0; }
                .label { font-weight: bold; color: #667eea; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">📊 Tu resumen de ${periodLabel}</h1>
                </div>
                <div class="content">
                    <p>Hola <strong>${nutritionist.name}</strong>,</p>
                    <p>Esto es lo que hiciste en NutriPro durante ${periodLabel}:</p>
                    <div class="stats">
                        <div class="stat-row"><span class="label">👥 Pacientes nuevos:</span> ${stats.patients}</div>
                        <div class="stat-row"><span class="label">📅 Citas atendidas:</span> ${stats.appointments}</div>
                        <div class="stat-row"><span class="label">🍽️ Planes de alimentación creados:</span> ${stats.mealPlans}</div>
                    </div>
                    <p style="margin-top: 20px;">Saludos,<br><strong>El equipo de NutriPro</strong></p>
                </div>
                <div class="footer">
                    <p>Puedes desactivar estos correos desde tu perfil en NutriPro.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to: nutritionist.email,
        subject: `Tu resumen de NutriPro - ${periodLabel}`,
        html,
    });
};

/**
 * Correo de campaña de marketing. El opt-out (`notificationPreferences.marketingEmails`)
 * se resuelve en `adminController.js` antes de llamar a esto.
 * @param {Object} user
 * @param {{subject:string, bodyHtml:string}} campaign
 */
export const sendCampaignEmail = async (user, campaign) => {
    return sendEmail({
        to: user.email,
        subject: campaign.subject,
        html: campaign.bodyHtml,
    });
};

export default {
    sendEmail,
    sendAppointmentReminder,
    sendWelcomeEmail,
    sendUsageReportEmail,
    sendCampaignEmail,
};
