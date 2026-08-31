import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token (exclude password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            next();
        } catch (error) {
            console.error('Auth middleware error:', error);
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed'
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token'
        });
    }
};

/**
 * Autorizacion por rol. Hoy no la usa ninguna ruta, y eso es correcto:
 *
 * El aislamiento entre nutriologos NO depende de este middleware. Cada
 * controlador comprueba la propiedad del documento contra `req.user` antes de
 * leerlo o modificarlo (ver `patientController.js`, y los equivalentes de
 * citas, planes, pagos y notas clinicas), asi que un nutriologo no puede
 * alcanzar los datos de otro.
 *
 * `authorize` haria falta para separar roles dentro de la aplicacion, y el
 * unico modulo que lo pedia — el de licencias — esta archivado en
 * `frontend/src/_archive/`. Se conserva porque es el patron correcto para
 * cuando vuelva: si ese modulo se reactiva, tiene que hacerlo con esta
 * comprobacion aplicada en el servidor, no solo ocultando el menu.
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`,
            });
        }
        next();
    };
};
