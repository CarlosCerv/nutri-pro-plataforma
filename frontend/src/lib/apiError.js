/**
 * Traduce un error de axios al mensaje que ve el usuario.
 *
 * El backend responde `{ success: false, message }` en sus rutas de error
 * (ver `backend/src/app.js`), asi que ese campo es la primera opcion. Cuando
 * la peticion nunca llego al servidor (backend caido, sin red) axios no trae
 * `response`, y ahi hace falta un mensaje propio: es justamente el caso que
 * antes se confundia con un guardado exitoso.
 */
export function getApiErrorMessage(error, fallback = 'No se pudo completar la operación.') {
    if (!error) return fallback;

    const data = error.response?.data;
    if (typeof data?.message === 'string' && data.message.trim()) return data.message;
    if (typeof data?.error === 'string' && data.error.trim()) return data.error;

    // express-validator devuelve `errors: [{ msg, path }]` (ver middleware/validators.js).
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
        const msgs = data.errors.map((e) => e.msg).filter(Boolean);
        if (msgs.length > 0) return msgs.join(' ');
    }

    const status = error.response?.status;
    if (status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.';
    if (status === 403) return 'No tienes permiso para hacer este cambio.';
    if (status === 404) return 'El recurso ya no existe.';
    if (status >= 500) return 'El servidor tuvo un problema. Intenta de nuevo en un momento.';

    if (!error.response) return 'No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.';

    return fallback;
}

export default getApiErrorMessage;
