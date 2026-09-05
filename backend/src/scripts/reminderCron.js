import cron from 'node-cron';
import reminderService from '../services/reminderService.js';
import { createModuleLogger } from '../config/logger.js';

const logger = createModuleLogger('cron');

/**
 * Cron job to check and send appointment reminders
 * Runs every hour at minute 0
 * Format: minute hour day month weekday
 */
export const startReminderCron = () => {
    logger.info('Starting appointment reminder cron job (runs every hour at minute 0)');

    // Run every hour at the top of the hour (0 * * * *)
    const task = cron.schedule('0 * * * *', async () => {
        logger.info('Reminder cron triggered');

        try {
            await reminderService.checkAndSendReminders();
        } catch (error) {
            logger.error({ err: error }, 'Error running reminder service');
        }
    });

    // Start the cron job
    task.start();

    logger.info('Reminder cron job started successfully');

    return task;
};

export default {
    startReminderCron,
};
