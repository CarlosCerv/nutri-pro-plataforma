import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import BodyComposition from '../models/BodyComposition.js';

const tokenFor = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

async function createNutritionist(overrides = {}) {
    return User.create({
        name: 'Nutriólogo de prueba',
        email: `nutri-${Date.now()}-${Math.random()}@example.com`,
        password: 'password123',
        role: 'nutritionist',
        ...overrides,
    });
}

async function createPatient(nutritionistId, overrides = {}) {
    return Patient.create({
        nutritionist: nutritionistId,
        firstName: 'Paciente',
        lastName: 'De Prueba',
        gender: 'male',
        dateOfBirth: new Date('1995-01-01'),
        anthropometry: { weight: 80 },
        ...overrides,
    });
}

describe('POST /api/body-composition', () => {
    it('crea un registro y calcula % de grasa corporal con Jackson-Pollock 3 sitios', async () => {
        const nutritionist = await createNutritionist();
        const patient = await createPatient(nutritionist._id);
        const token = tokenFor(nutritionist._id);

        const res = await request(app)
            .post('/api/body-composition')
            .set('Authorization', `Bearer ${token}`)
            .send({
                patientId: patient._id.toString(),
                calculationMethod: 'jackson-pollock-3',
                skinfolds: { chest: 10, abdominal: 15, thigh: 12 },
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.composition.bodyFatPercentage).toBeGreaterThan(0);
        expect(res.body.data.composition.fatMass).toBeGreaterThan(0);
        expect(res.body.data.composition.leanMass).toBeGreaterThan(0);
    });

    it('devuelve 404 si el paciente no pertenece al nutriólogo autenticado', async () => {
        const owner = await createNutritionist();
        const otherNutritionist = await createNutritionist();
        const patient = await createPatient(owner._id);
        const token = tokenFor(otherNutritionist._id);

        const res = await request(app)
            .post('/api/body-composition')
            .set('Authorization', `Bearer ${token}`)
            .send({ patientId: patient._id.toString() });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it('devuelve 401 sin token', async () => {
        const res = await request(app).post('/api/body-composition').send({ patientId: 'irrelevante' });
        expect(res.status).toBe(401);
    });
});

describe('GET /api/body-composition/:id (ownership)', () => {
    it('deniega el acceso a un registro de otro nutriólogo', async () => {
        const owner = await createNutritionist();
        const otherNutritionist = await createNutritionist();
        const patient = await createPatient(owner._id);
        const record = await BodyComposition.create({
            patient: patient._id,
            nutritionist: owner._id,
            measurements: { weight: 80, height: 175 },
        });

        const token = tokenFor(otherNutritionist._id);
        const res = await request(app)
            .get(`/api/body-composition/${record._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
    });

    it('permite el acceso al nutriólogo dueño del registro', async () => {
        const owner = await createNutritionist();
        const patient = await createPatient(owner._id);
        const record = await BodyComposition.create({
            patient: patient._id,
            nutritionist: owner._id,
            measurements: { weight: 80, height: 175 },
        });

        const token = tokenFor(owner._id);
        const res = await request(app)
            .get(`/api/body-composition/${record._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data._id).toBe(record._id.toString());
    });
});
