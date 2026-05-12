import app from './src/app.js';
import { startReminderCron } from './src/scripts/reminderCron.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  startReminderCron();
});
