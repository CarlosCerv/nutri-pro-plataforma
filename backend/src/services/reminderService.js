import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';
import * as emailService from './emailService.js';
import * as smsService from './smsService.js';
import * as whatsappService from './whatsappService.js';

/**
 * Check for appointments that need reminders and send them
 * This function should be called by a cron job
 */
export const checkAndSendReminders = async () => {
    try {


        // Ventana de 0 a 36 horas.
        //
        // Antes era de 23 a 25 h, lo que exigía correr el cron cada hora para
        // no dejar huecos — y el plan Hobby de Vercel no permite más de una
        // ejecución diaria, así que en la práctica los recordatorios no se
        // enviaban. Con una ventana de 36 h y una ejecución diaria, toda cita
        // queda cubierta al menos una vez con un aviso de entre 12 y 36 horas
        // de anticipación.
        //
        // Ampliar la ventana es seguro porque el flag `reminderSent` del
        // modelo Appointment impide reenviar: una cita nunca recibe dos
        // recordatorios aunque caiga en dos ejecuciones consecutivas.
        const now = new Date();
        const windowStart = now;
        const windowEnd = new Date(now.getTime() + 36 * 60 * 60 * 1000);



        // Citas dentro de la ventana, sin recordatorio enviado y no canceladas.
        const appointments = await Appointment.find({
            date: {
                $gte: windowStart,
                $lte: windowEnd,
            },
            reminderSent: false,
            status: 'scheduled',
        }).populate('patient nutritionist');

        if (appointments.length === 0) {

            return { sent: 0, failed: 0 };
        }



        let sentCount = 0;
        let failedCount = 0;

        // Process each appointment
        for (const appointment of appointments) {
            try {
                const patient = appointment.patient;
                const nutritionist = appointment.nutritionist;

                if (!patient || !nutritionist) {
                    console.error(`[Reminder Service] ❌ Missing patient or nutritionist for appointment ${appointment._id}`);
                    failedCount++;
                    continue;
                }



                let emailSent = false;
                let whatsappSent = false;
                let smsSent = false;

                // Try to send email reminder
                if (patient.email) {
                    emailSent = await emailService.sendAppointmentReminder(
                        patient,
                        appointment,
                        nutritionist
                    );
                } else {
                    console.warn(`[Reminder Service] ⚠️  Patient has no email address`);
                }

                // WhatsApp es el canal preferido para el aviso de cita; SMS
                // solo entra si WhatsApp no está configurado o falló (número
                // no habilitado para WhatsApp, plantilla rechazada, etc.) —
                // así la transición a WhatsApp no deja pacientes sin aviso.
                if (patient.phone) {
                    whatsappSent = await whatsappService.sendAppointmentReminder(
                        patient,
                        appointment,
                        nutritionist
                    );
                    if (!whatsappSent) {
                        smsSent = await smsService.sendAppointmentReminder(
                            patient,
                            appointment,
                            nutritionist
                        );
                    }
                } else {
                    console.warn(`[Reminder Service] ⚠️  Patient has no phone number`);
                }

                // Update appointment with reminder status
                // Mark as sent if at least one notification method succeeded
                const reminderSent = emailSent || whatsappSent || smsSent;

                await Appointment.findByIdAndUpdate(appointment._id, {
                    reminderSent: reminderSent,
                    reminderSentAt: reminderSent ? new Date() : null,
                    reminderEmail: emailSent,
                    reminderWhatsApp: whatsappSent,
                    reminderSMS: smsSent,
                });

                if (reminderSent) {
                    sentCount++;

                } else {
                    failedCount++;
                    console.error(`[Reminder Service] ❌ Failed to send any reminder (no email or phone)\n`);
                }

            } catch (error) {
                console.error(`[Reminder Service] ❌ Error processing appointment ${appointment._id}:`, error.message);
                failedCount++;
            }
        }



        return {
            sent: sentCount,
            failed: failedCount,
            total: appointments.length,
        };

    } catch (error) {
        console.error('[Reminder Service] ❌ Error in checkAndSendReminders:', error);
        throw error;
    }
};

export default {
    checkAndSendReminders,
};
