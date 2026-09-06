import { describe, it, expect, vi } from 'vitest';

vi.mock('../services/emailService.js', () => ({
    sendWelcomeEmail: vi.fn().mockResolvedValue(true),
}));

import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';

const basePayload = () => ({
    name: 'Nutrióloga de Prueba',
    email: `nutri-${Date.now()}-${Math.random()}@example.com`,
    password: 'password123',
    specialty: 'Nutrición clínica',
});

describe('POST /api/auth/register + POST /api/auth/login', () => {
    it('permite loguearse justo después de registrarse, con el mismo email exacto', async () => {
        const payload = basePayload();

        const registerRes = await request(app).post('/api/auth/register').send(payload);
        expect(registerRes.status).toBe(201);

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: payload.email, password: payload.password });

        expect(loginRes.status).toBe(200);
        expect(loginRes.body.data.token).toBeTruthy();
    });

    it('permite loguearse aunque el email se escriba con otra capitalización', async () => {
        const payload = basePayload();
        await request(app).post('/api/auth/register').send(payload);

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: payload.email.toUpperCase(), password: payload.password });

        expect(loginRes.status).toBe(200);
    });

    it('permite loguearse aunque el email traiga espacios al inicio o al final', async () => {
        const payload = basePayload();
        await request(app).post('/api/auth/register').send(payload);

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: `  ${payload.email}  `, password: payload.password });

        expect(loginRes.status).toBe(200);
    });

    it('rechaza un segundo registro con el mismo email en otra capitalización, con 400 y no con un 500 de índice duplicado', async () => {
        const payload = basePayload();
        const first = await request(app).post('/api/auth/register').send(payload);
        expect(first.status).toBe(201);

        const second = await request(app)
            .post('/api/auth/register')
            .send({ ...payload, email: payload.email.toUpperCase() });

        expect(second.status).toBe(400);
        expect(second.body.success).toBe(false);

        const count = await User.countDocuments({});
        expect(count).toBe(1);
    });

    it('devuelve 401 con contraseña incorrecta', async () => {
        const payload = basePayload();
        await request(app).post('/api/auth/register').send(payload);

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: payload.email, password: 'contraseña-incorrecta' });

        expect(loginRes.status).toBe(401);
    });

    it('devuelve 401 para un email que no existe', async () => {
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nadie@example.com', password: 'password123' });

        expect(loginRes.status).toBe(401);
    });
});
