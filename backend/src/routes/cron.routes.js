import express from 'express';
import { runReminders, runUsageReports } from '../controllers/cron.controller.js';

const router = express.Router();

// No lleva `protect`: la autenticacion es via CRON_SECRET (ver cron.controller.js),
// no JWT de usuario — quien llama es Vercel Cron, no un nutricionista logueado.
router.get('/reminders', runReminders);
router.get('/usage-reports', runUsageReports);

export default router;
