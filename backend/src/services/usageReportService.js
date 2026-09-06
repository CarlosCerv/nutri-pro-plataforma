import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import MealPlan from '../models/MealPlan.js';
import * as emailService from './emailService.js';
import { createModuleLogger } from '../config/logger.js';

const logger = createModuleLogger('usage-report-service');

const MESES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

async function computeUsageStats(nutritionistId, periodStart, periodEnd) {
    const [patients, appointments, mealPlans] = await Promise.all([
        Patient.countDocuments({ nutritionist: nutritionistId, createdAt: { $gte: periodStart, $lt: periodEnd } }),
        Appointment.countDocuments({ nutritionist: nutritionistId, date: { $gte: periodStart, $lt: periodEnd }, status: 'completed' }),
        MealPlan.countDocuments({ nutritionist: nutritionistId, createdAt: { $gte: periodStart, $lt: periodEnd } }),
    ]);
    return { patients, appointments, mealPlans };
}

/**
 * Envía el reporte mensual de uso a cada nutriólogo activo que no lo haya
 * optado fuera. Idempotente vía `User.lastUsageReportSentAt`: invocar esto
 * más de una vez dentro del mismo mes no reenvía a quien ya lo recibió (mismo
 * principio que `Appointment.reminderSent` en reminderService.js).
 */
export const sendUsageReports = async () => {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodLabel = `${MESES[periodStart.getMonth()]} ${periodStart.getFullYear()}`;

    const candidates = await User.find({
        role: 'nutritionist',
        isActive: true,
        'notificationPreferences.usageReports': { $ne: false },
    });

    let sentCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const nutritionist of candidates) {
        const last = nutritionist.lastUsageReportSentAt;
        const yaEnviadoEsteMes = last
            && last.getFullYear() === now.getFullYear()
            && last.getMonth() === now.getMonth();

        if (yaEnviadoEsteMes) {
            skippedCount++;
            continue;
        }

        try {
            const stats = await computeUsageStats(nutritionist._id, periodStart, periodEnd);
            const sent = await emailService.sendUsageReportEmail(nutritionist, stats, periodLabel);

            if (sent) {
                await User.findByIdAndUpdate(nutritionist._id, { lastUsageReportSentAt: now });
                sentCount++;
            } else {
                failedCount++;
            }
        } catch (error) {
            logger.error({ err: error, nutritionistId: nutritionist._id }, 'Error sending usage report');
            failedCount++;
        }
    }

    return { sent: sentCount, skipped: skippedCount, failed: failedCount, total: candidates.length };
};

export default { sendUsageReports };
