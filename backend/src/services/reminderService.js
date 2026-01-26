import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';
import * as emailService from './emailService.js';
import * as smsService from './smsService.js';

/**
 * Check for appointments that need reminders and send them
 * This function should be called by a cron job
 */
export const checkAndSendReminders = async () => {
    try {


        // Calculate the time window: 23 to 25 hours from now
        // This gives us a 2-hour window to catch appointments ~24 hours away
        const now = new Date();
        const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000); // 23 hours from now
        const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);   // 25 hours from now



        // Find appointments that:
        // 1. Are scheduled within the next 24 hours (±1 hour)
        // 2. Haven't had a reminder sent yet
        // 3. Are not cancelled or completed
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

                // Try to send SMS reminder
                if (patient.phone) {
                    smsSent = await smsService.sendAppointmentReminder(
                        patient,
                        appointment,
                        nutritionist
                    );
                } else {
                    console.warn(`[Reminder Service] ⚠️  Patient has no phone number`);
                }

                // Update appointment with reminder status
                // Mark as sent if at least one notification method succeeded
                const reminderSent = emailSent || smsSent;

                await Appointment.findByIdAndUpdate(appointment._id, {
                    reminderSent: reminderSent,
                    reminderSentAt: reminderSent ? new Date() : null,
                    reminderEmail: emailSent,
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
