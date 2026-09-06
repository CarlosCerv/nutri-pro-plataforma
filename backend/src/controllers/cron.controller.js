import reminderService from '../services/reminderService.js';
import usageReportService from '../services/usageReportService.js';
import asyncHandler from '../utils/asyncHandler.js';
import { createModuleLogger } from '../config/logger.js';

const logger = createModuleLogger('cron');

function checkCronSecret(req, res) {
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret) {
        logger.error('CRON_SECRET no esta configurado — rechazando por seguridad.');
        res.status(500).json({ success: false, message: 'CRON_SECRET is not configured' });
        return false;
    }

    if (req.headers.authorization !== `Bearer ${expectedSecret}`) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return false;
    }

    return true;
}

/**
 * Endpoint HTTP para el cron de recordatorios (reemplaza a node-cron en
 * produccion, donde el proceso serverless no vive lo suficiente para que
 * un scheduler en memoria funcione). Se invoca desde Vercel Cron Jobs
 * (ver vercel.json → "crons") y esta protegido con CRON_SECRET: Vercel
 * agrega automaticamente `Authorization: Bearer <CRON_SECRET>` en sus
 * propias invocaciones cuando esa variable de entorno esta configurada.
 */
export const runReminders = asyncHandler(async (req, res) => {
    if (!checkCronSecret(req, res)) return;

    const result = await reminderService.checkAndSendReminders();

    res.status(200).json({
        success: true,
        ...result,
    });
}, { message: 'Error running reminder cron' });

/**
 * Endpoint HTTP para el cron mensual de reportes de uso (bienvenida/campañas
 * usan su propio disparador; este es el único periódico además de
 * recordatorios). Mismo esquema de seguridad que `runReminders`.
 */
export const runUsageReports = asyncHandler(async (req, res) => {
    if (!checkCronSecret(req, res)) return;

    const result = await usageReportService.sendUsageReports();

    res.status(200).json({
        success: true,
        ...result,
    });
}, { message: 'Error running usage report cron' });
