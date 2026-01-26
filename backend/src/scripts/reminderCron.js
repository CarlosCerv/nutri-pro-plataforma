import cron from 'node-cron';
import reminderService from '../services/reminderService.js';

/**
 * Cron job to check and send appointment reminders
 * Runs every hour at minute 0
 * Format: minute hour day month weekday
 */
export const startReminderCron = () => {
    console.log('[Cron] 🚀 Starting appointment reminder cron job...');
    console.log('[Cron] ⏰ Will run every hour at minute 0');

    // Run every hour at the top of the hour (0 * * * *)
    const task = cron.schedule('0 * * * *', async () => {
        const timestamp = new Date().toLocaleString('es-MX');
        console.log(`\n[Cron] ⏰ Reminder cron triggered at ${timestamp}`);

        try {
            await reminderService.checkAndSendReminders();
        } catch (error) {
            console.error('[Cron] ❌ Error running reminder service:', error.message);
        }
    });

    // Start the cron job
    task.start();

    console.log('[Cron] ✅ Reminder cron job started successfully\n');

    return task;
};

export default {
    startReminderCron,
};
