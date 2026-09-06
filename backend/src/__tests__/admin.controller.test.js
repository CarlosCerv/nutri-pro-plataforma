import { describe, it, expect, vi } from 'vitest';

vi.mock('../services/emailService.js', () => ({
    sendCampaignEmail: vi.fn().mockResolvedValue(true),
    sendWelcomeEmail: vi.fn().mockResolvedValue(true),
}));

import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import EmailCampaign from '../models/EmailCampaign.js';
import * as emailService from '../services/emailService.js';

const tokenFor = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

async function createNutritionist(overrides = {}) {
    return User.create({
        name: 'Nutriólogo',
        email: `nutri-${Date.now()}-${Math.random()}@example.com`,
        password: 'password123',
        role: 'nutritionist',
        ...overrides,
    });
}

async function createAdmin() {
    return User.create({
        name: 'Admin',
        email: `admin-${Date.now()}-${Math.random()}@example.com`,
        password: 'password123',
        role: 'admin',
    });
}

describe('Autorización de /api/admin/*', () => {
    it('devuelve 401 sin token', async () => {
        const res = await request(app).get('/api/admin/nutritionists');
        expect(res.status).toBe(401);
    });

    it('devuelve 403 con token de un nutritionist', async () => {
        const nutritionist = await createNutritionist();
        const token = tokenFor(nutritionist._id);

        const res = await request(app)
            .get('/api/admin/nutritionists')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
    });

    it('devuelve 200 con token de admin', async () => {
        const admin = await createAdmin();
        const token = tokenFor(admin._id);

        const res = await request(app)
            .get('/api/admin/dashboard')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('totalNutritionists');
    });
});

describe('GET /api/admin/nutritionists', () => {
    it('incluye el conteo de pacientes por nutriólogo', async () => {
        const admin = await createAdmin();
        const withPatients = await createNutritionist();
        await createNutritionist(); // sin pacientes
        await Patient.create({ nutritionist: withPatients._id, firstName: 'Paciente', lastName: 'Uno' });
        await Patient.create({ nutritionist: withPatients._id, firstName: 'Paciente', lastName: 'Dos' });

        const token = tokenFor(admin._id);
        const res = await request(app)
            .get('/api/admin/nutritionists')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        const row = res.body.data.nutritionists.find((n) => n.email === withPatients.email);
        expect(row.patientCount).toBe(2);
    });
});

describe('PATCH /api/admin/nutritionists/:id/status', () => {
    it('activa y desactiva una cuenta', async () => {
        const admin = await createAdmin();
        const nutritionist = await createNutritionist();
        const token = tokenFor(admin._id);

        const res = await request(app)
            .patch(`/api/admin/nutritionists/${nutritionist._id}/status`)
            .set('Authorization', `Bearer ${token}`)
            .send({ isActive: false });

        expect(res.status).toBe(200);
        expect(res.body.data.isActive).toBe(false);

        const updated = await User.findById(nutritionist._id);
        expect(updated.isActive).toBe(false);
    });
});

describe('POST /api/admin/campaigns', () => {
    it('crea la campaña, envía a cada destinatario y omite a quien optó fuera de marketing', async () => {
        const admin = await createAdmin();
        const suscrito = await createNutritionist();
        const optOut = await createNutritionist({ notificationPreferences: { marketingEmails: false, usageReports: true } });
        const token = tokenFor(admin._id);

        const res = await request(app)
            .post('/api/admin/campaigns')
            .set('Authorization', `Bearer ${token}`)
            .send({ subject: 'Novedades', bodyHtml: '<p>Hola</p>', segment: { type: 'all' } });

        expect(res.status).toBe(201);
        expect(res.body.data.campaign.stats.sent).toBe(1);
        expect(res.body.data.campaign.stats.skipped).toBe(1);
        expect(emailService.sendCampaignEmail).toHaveBeenCalledTimes(1);

        const saved = await EmailCampaign.findById(res.body.data.campaign._id);
        const optOutRecipient = saved.recipients.find((r) => r.email === optOut.email);
        expect(optOutRecipient.status).toBe('skipped_optout');
    });
});
