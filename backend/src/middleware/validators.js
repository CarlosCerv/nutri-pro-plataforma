import { body, validationResult } from 'express-validator';

/**
 * Corre despues de una cadena de validadores express-validator; si alguno
 * fallo, responde 400 con el detalle por campo en vez de dejar que el
 * request siga hasta el controlador o la base de datos.
 */
export const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
        });
    }
    next();
};

/**
 * Ademas de dar mensajes de error claros, .isEmail()/.isString() rechazan
 * un body como { email: { $gt: '' } } antes de que llegue a un
 * User.findOne({ email }) — sin esto, Mongoose acepta ese objeto como
 * operador de consulta (inyeccion NoSQL) en vez de tratarlo como valor.
 */
export const registerValidators = [
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 120 }),
    body('email').trim().isEmail().withMessage('Proporciona un email valido').normalizeEmail(),
    body('password').isString().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('specialty').optional({ checkFalsy: true }).trim().isString().isLength({ max: 120 }),
    body('phone').optional({ checkFalsy: true }).trim().isString().isLength({ max: 40 }),
    handleValidation,
];

export const loginValidators = [
    body('email').trim().isEmail().withMessage('Proporciona un email valido').normalizeEmail(),
    body('password').isString().notEmpty().withMessage('La contraseña es obligatoria'),
    handleValidation,
];
