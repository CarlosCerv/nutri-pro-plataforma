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
            console.error(`${message}:`, error);
            res.status(status).json({
                success: false,
                message,
                error: error.message,
            });
        }
    };

export default asyncHandler;
