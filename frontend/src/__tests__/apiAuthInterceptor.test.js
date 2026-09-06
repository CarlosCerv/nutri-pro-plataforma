import { describe, it, expect, vi, beforeEach } from 'vitest';

const interceptors = { request: [], response: [] };

vi.mock('axios', () => {
    const instance = {
        interceptors: {
            request: { use: (onFulfilled, onRejected) => interceptors.request.push({ onFulfilled, onRejected }) },
            response: { use: (onFulfilled, onRejected) => interceptors.response.push({ onFulfilled, onRejected }) },
        },
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    };
    return { default: { create: () => instance } };
});

async function loadApiModule() {
    interceptors.request.length = 0;
    interceptors.response.length = 0;
    vi.resetModules();
    await import('../services/api.js');
    return interceptors.response[0].onRejected;
}

describe('interceptor de respuesta de services/api.js', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        // jsdom resuelve un `href` relativo contra la URL base de la página
        // (queda "http://localhost:3000/login" en vez de "/login"), así que se
        // reemplaza `window.location` por un objeto plano para poder comparar
        // el valor asignado tal cual.
        Object.defineProperty(window, 'location', {
            value: { href: '' },
            writable: true,
        });
    });

    it('no borra el storage ni redirige en un 401 de /auth/login (credenciales inválidas)', async () => {
        const onRejected = await loadApiModule();
        localStorage.setItem('token', 'token-de-otra-sesion');

        const error = { response: { status: 401 }, config: { url: 'auth/login' } };
        await expect(onRejected(error)).rejects.toBe(error);

        expect(localStorage.getItem('token')).toBe('token-de-otra-sesion');
        expect(window.location.href).toBe('');
    });

    it('no borra el storage ni redirige en un 401 de /auth/register (email ya en uso, etc.)', async () => {
        const onRejected = await loadApiModule();
        localStorage.setItem('token', 'token-de-otra-sesion');

        const error = { response: { status: 401 }, config: { url: 'auth/register' } };
        await expect(onRejected(error)).rejects.toBe(error);

        expect(localStorage.getItem('token')).toBe('token-de-otra-sesion');
        expect(window.location.href).toBe('');
    });

    it('sí borra el storage y redirige en un 401 de una ruta protegida (sesión expirada)', async () => {
        const onRejected = await loadApiModule();
        localStorage.setItem('token', 'token-viejo');
        localStorage.setItem('user', '{}');

        const error = { response: { status: 401 }, config: { url: 'patients' } };
        await expect(onRejected(error)).rejects.toBe(error);

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
        expect(window.location.href).toBe('/login');
    });
});
