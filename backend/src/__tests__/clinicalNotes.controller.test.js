import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import ClinicalNote from '../models/ClinicalNote.js';

const tokenFor = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

async function createNutritionist() {
    return User.create({
        name: 'Nutriólogo',
        email: `nutri-${Date.now()}-${Math.random()}@example.com`,
        password: 'password123',
        role: 'nutritionist',
    });
}

async function createPatient(nutritionistId) {
    return Patient.create({
        nutritionist: nutritionistId,
        firstName: 'Paciente',
        lastName: 'De Prueba',
    });
}

const NOTE_BODY = { subjective: 'Refiere buen apego', analysis: 'Evolución favorable', plan: 'Mantener plan actual' };

describe('POST /api/clinical-notes/patient/:patientId', () => {
    it('crea una nota para un paciente propio', async () => {
        const nutritionist = await createNutritionist();
        const patient = await createPatient(nutritionist._id);
        const token = tokenFor(nutritionist._id);

        const res = await request(app)
            .post(`/api/clinical-notes/patient/${patient._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(NOTE_BODY);

        expect(res.status).toBe(201);
        expect(res.body.data.analysis).toBe(NOTE_BODY.analysis);
        expect(res.body.data.nutritionist).toBe(nutritionist._id.toString());
    });

    it('deniega crear una nota para un paciente de otro nutriólogo', async () => {
        const owner = await createNutritionist();
        const other = await createNutritionist();
        const patient = await createPatient(owner._id);
        const token = tokenFor(other._id);

        const res = await request(app)
            .post(`/api/clinical-notes/patient/${patient._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(NOTE_BODY);

        expect(res.status).toBe(403);
    });
});

describe('GET /api/clinical-notes/patient/:patientId', () => {
    it('lista las notas del propio paciente', async () => {
        const nutritionist = await createNutritionist();
        const patient = await createPatient(nutritionist._id);
        await ClinicalNote.create({ patient: patient._id, nutritionist: nutritionist._id, ...NOTE_BODY });
        const token = tokenFor(nutritionist._id);

        const res = await request(app)
            .get(`/api/clinical-notes/patient/${patient._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
    });

    it('deniega leer las notas de un paciente de otro nutriólogo', async () => {
        const owner = await createNutritionist();
        const other = await createNutritionist();
        const patient = await createPatient(owner._id);
        await ClinicalNote.create({ patient: patient._id, nutritionist: owner._id, ...NOTE_BODY });
        const token = tokenFor(other._id);

        const res = await request(app)
            .get(`/api/clinical-notes/patient/${patient._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
    });
});

describe('PUT /api/clinical-notes/:noteId', () => {
    it('permite actualizar una nota propia', async () => {
        const nutritionist = await createNutritionist();
        const patient = await createPatient(nutritionist._id);
        const note = await ClinicalNote.create({ patient: patient._id, nutritionist: nutritionist._id, ...NOTE_BODY });
        const token = tokenFor(nutritionist._id);

        const res = await request(app)
            .put(`/api/clinical-notes/${note._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ plan: 'Plan actualizado' });

        expect(res.status).toBe(200);
        expect(res.body.data.plan).toBe('Plan actualizado');
    });

    it('devuelve 404 al intentar actualizar una nota de otro nutriólogo', async () => {
        const owner = await createNutritionist();
        const other = await createNutritionist();
        const patient = await createPatient(owner._id);
        const note = await ClinicalNote.create({ patient: patient._id, nutritionist: owner._id, ...NOTE_BODY });
        const token = tokenFor(other._id);

        const res = await request(app)
            .put(`/api/clinical-notes/${note._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ plan: 'Intento ajeno' });

        expect(res.status).toBe(404);

        const unchanged = await ClinicalNote.findById(note._id);
        expect(unchanged.plan).toBe(NOTE_BODY.plan);
    });
});

describe('DELETE /api/clinical-notes/:noteId', () => {
    it('deniega borrar una nota de otro nutriólogo, y la nota sigue existiendo', async () => {
        const owner = await createNutritionist();
        const other = await createNutritionist();
        const patient = await createPatient(owner._id);
        const note = await ClinicalNote.create({ patient: patient._id, nutritionist: owner._id, ...NOTE_BODY });
        const token = tokenFor(other._id);

        const res = await request(app)
            .delete(`/api/clinical-notes/${note._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(await ClinicalNote.findById(note._id)).not.toBeNull();
    });

    it('permite borrar una nota propia', async () => {
        const nutritionist = await createNutritionist();
        const patient = await createPatient(nutritionist._id);
        const note = await ClinicalNote.create({ patient: patient._id, nutritionist: nutritionist._id, ...NOTE_BODY });
        const token = tokenFor(nutritionist._id);

        const res = await request(app)
            .delete(`/api/clinical-notes/${note._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(await ClinicalNote.findById(note._id)).toBeNull();
    });
});
