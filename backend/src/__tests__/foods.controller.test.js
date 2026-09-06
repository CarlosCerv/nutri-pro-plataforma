import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import User from '../models/User.js';
import Food from '../models/Food.js';

const tokenFor = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

async function createNutritionist() {
    return User.create({
        name: 'Nutrióloga',
        email: `nutri-${Date.now()}-${Math.random()}@example.com`,
        password: 'password123',
        role: 'nutritionist',
    });
}

describe('GET /api/foods — búsqueda insensible a acentos', () => {
    it('encuentra "Plátano" buscando "platano" sin acento', async () => {
        const user = await createNutritionist();
        const token = tokenFor(user._id);
        await Food.create({ name: 'Plátano', category: 'fruits', nutrition: { energy: 89 } });
        await Food.create({ name: 'Manzana', category: 'fruits', nutrition: { energy: 52 } });

        const res = await request(app)
            .get('/api/foods')
            .query({ search: 'platano' })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].name).toBe('Plátano');
    });

    it('encuentra "Niño" (ñ) buscando "nino" con n simple', async () => {
        const user = await createNutritionist();
        const token = tokenFor(user._id);
        await Food.create({ name: 'Puré de Niño Envuelto', category: 'other', nutrition: { energy: 100 } });

        const res = await request(app)
            .get('/api/foods')
            .query({ search: 'nino envuelto' })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
    });

    it('sigue soportando caracteres especiales de regex sin reventar (ReDoS/CastError)', async () => {
        const user = await createNutritionist();
        const token = tokenFor(user._id);
        await Food.create({ name: 'Agua (mineral)', category: 'beverages', nutrition: { energy: 0 } });

        const res = await request(app)
            .get('/api/foods')
            .query({ search: '(a+)+' })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
    });
});
