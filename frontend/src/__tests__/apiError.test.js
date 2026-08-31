/**
 * Mensajes de error de la API.
 *
 * El caso crítico es el error sin `response`: es el que se producía cuando el
 * backend estaba caído, y el que la interfaz confundía con un guardado
 * exitoso antes de la corrección.
 */

import { describe, it, expect } from 'vitest';
import { getApiErrorMessage } from '../lib/apiError';

describe('getApiErrorMessage', () => {
  it('prefiere el mensaje que devuelve el backend', () => {
    const err = { response: { status: 400, data: { success: false, message: 'El correo ya está registrado' } } };
    expect(getApiErrorMessage(err)).toBe('El correo ya está registrado');
  });

  it('junta los mensajes de express-validator', () => {
    const err = { response: { status: 422, data: { errors: [{ msg: 'Correo inválido' }, { msg: 'Contraseña muy corta' }] } } };
    expect(getApiErrorMessage(err)).toBe('Correo inválido Contraseña muy corta');
  });

  it('explica que no hubo conexión cuando la petición nunca llegó al servidor', () => {
    expect(getApiErrorMessage({ message: 'Network Error' })).toMatch(/no se pudo conectar/i);
  });

  it('traduce los códigos de estado sin cuerpo útil', () => {
    expect(getApiErrorMessage({ response: { status: 401, data: {} } })).toMatch(/sesión/i);
    expect(getApiErrorMessage({ response: { status: 403, data: {} } })).toMatch(/permiso/i);
    expect(getApiErrorMessage({ response: { status: 404, data: {} } })).toMatch(/no existe/i);
    expect(getApiErrorMessage({ response: { status: 500, data: {} } })).toMatch(/servidor/i);
  });

  it('usa el texto de respaldo cuando no hay error', () => {
    expect(getApiErrorMessage(null, 'Falló algo')).toBe('Falló algo');
  });
});
