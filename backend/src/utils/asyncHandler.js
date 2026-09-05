import logger from '../config/logger.js';

/**
 * Envuelve un controlador async para no repetir try/catch en cada uno.
 * Conserva el status HTTP y el mensaje que cada ruta ya usaba: ambos se
 * declaran al envolver (`asyncHandler(fn, { status, message })`) en vez de
 * delegar a un manejador de errores generico, para no cambiar el contrato
 * de respuesta de la API (`{ success: false, message, error }`).
 */
const asyncHandler = (fn, { status = 500, message = 'Server error' } = {}) =>
    async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            // `req.id` lo asigna pino-http (backend/src/app.js) y ya viaja en
            // cada línea de log de esta petición. Incluirlo también en la
            // respuesta es lo que permite pasar de "un usuario dijo que le
            // dio 500 al hacer login como a las 3pm" a una búsqueda exacta en
            // los Runtime Logs de Vercel, en vez de adivinar por ventana de
            // tiempo (ver docs/MANEJO-DE-ERRORES.md §5, mejora #1).
            logger.error({ err: error, reqId: req.id }, message);
            res.status(status).json({
                success: false,
                message,
                error: error.message,
                requestId: req.id,
            });
        }
    };

export default asyncHandler;
