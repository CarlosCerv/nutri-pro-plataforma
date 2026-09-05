import app from './src/app.js';
import { startReminderCron } from './src/scripts/reminderCron.js';
import logger from './src/config/logger.js';

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    logger.info({ port: PORT, env: process.env.NODE_ENV || 'development' }, 'Server running');
    startReminderCron();
  });
}

export default app;
