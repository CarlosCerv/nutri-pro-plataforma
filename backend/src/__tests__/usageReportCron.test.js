import { describe, it, expect, vi } from 'vitest';

vi.mock('../services/emailService.js', () => ({
    sendUsageReportEmail: vi.fn().mockResolvedValue(true),
}));

import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import * as emailService from '../services/emailService.js';

process.env.CRON_SECRET = process.env.CRON_SECRET || 'test-cron-secret';

async function createNutritionist(overrides = {}) {
    return User.create({
        name: 'Nutriólogo',
        email: `nutri-${Date.now()}-${Math.random()}@example.com`,
        password: 'password123',
        role: 'nutritionist',
        isActive: true,
        ...overrides,
    });
}

describe('GET /api/cron/usage-reports', () => {
    it('devuelve 401 sin el CRON_SECRET correcto', async () => {
        const res = await request(app).get('/api/cron/usage-reports');
        expect(res.status).toBe(401);
    });

    it('envía el reporte y marca lastUsageReportSentAt', async () => {
        const nutritionist = await createNutritionist();

        const res = await request(app)
            .get('/api/cron/usage-reports')
            .set('Authorization', `Bearer ${process.env.CRON_SECRET}`);

        expect(res.status).toBe(200);
        expect(res.body.sent).toBe(1);
        expect(emailService.sendUsageReportEmail).toHaveBeenCalledTimes(1);

        const updated = await User.findById(nutritionist._id);
        expect(updated.lastUsageReportSentAt).not.toBeNull();
    });

    it('no reenvía a quien ya recibió el reporte este mes (idempotencia)', async () => {
        await createNutritionist({ lastUsageReportSentAt: new Date() });

        const res = await request(app)
            .get('/api/cron/usage-reports')
            .set('Authorization', `Bearer ${process.env.CRON_SECRET}`);

        expect(res.status).toBe(200);
        expect(res.body.sent).toBe(0);
        expect(res.body.skipped).toBe(1);
        expect(emailService.sendUsageReportEmail).not.toHaveBeenCalled();
    });

    it('no envía a una cuenta desactivada ni a quien optó fuera de los reportes', async () => {
        await createNutritionist({ isActive: false });
        await createNutritionist({ notificationPreferences: { marketingEmails: true, usageReports: false } });

        const res = await request(app)
            .get('/api/cron/usage-reports')
            .set('Authorization', `Bearer ${process.env.CRON_SECRET}`);

        expect(res.status).toBe(200);
        expect(res.body.total).toBe(0);
        expect(emailService.sendUsageReportEmail).not.toHaveBeenCalled();
    });
});
