import reminderService from '../services/reminderService.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Endpoint HTTP para el cron de recordatorios (reemplaza a node-cron en
 * produccion, donde el proceso serverless no vive lo suficiente para que
 * un scheduler en memoria funcione). Se invoca desde Vercel Cron Jobs
 * (ver vercel.json → "crons") y esta protegido con CRON_SECRET: Vercel
 * agrega automaticamente `Authorization: Bearer <CRON_SECRET>` en sus
 * propias invocaciones cuando esa variable de entorno esta configurada.
 */
export const runReminders = asyncHandler(async (req, res) => {
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret) {
        console.error('[Cron] CRON_SECRET no esta configurado — rechazando por seguridad.');
        return res.status(500).json({
            success: false,
            message: 'CRON_SECRET is not configured',
        });
    }

    if (req.headers.authorization !== `Bearer ${expectedSecret}`) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
    }

    const result = await reminderService.checkAndSendReminders();

    res.status(200).json({
        success: true,
        ...result,
    });
}, { message: 'Error running reminder cron' });
