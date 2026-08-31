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

/**
 * Validadores de las rutas de escritura del resto de la aplicación.
 *
 * Hasta ahora solo `/auth/register` y `/auth/login` validaban entrada; el
 * resto confiaba en el esquema de Mongoose, que además se salta por completo
 * en los `findOneAndUpdate` sin `runValidators`. Estos cierran los dos
 * huecos: rechazan tipos incorrectos antes de tocar la base de datos y, como
 * en auth, impiden que un objeto llegue donde se espera un valor.
 *
 * Los campos opcionales usan `checkFalsy` porque los formularios envían
 * cadenas vacías para lo que el usuario no llenó, y una cadena vacía no debe
 * fallar la validación de un campo opcional.
 */

const opcionalTexto = (campo, max = 500) =>
    body(campo).optional({ checkFalsy: true }).trim().isString().isLength({ max });

const opcionalNumero = (campo, { min = 0, max = 1000 } = {}) =>
    body(campo).optional({ checkFalsy: true }).isFloat({ min, max })
        .withMessage(`${campo} debe ser un número entre ${min} y ${max}`);

export const patientValidators = [
    body('firstName').trim().notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 120 }),
    body('lastName').trim().notEmpty().withMessage('El apellido es obligatorio').isLength({ max: 120 }),
    body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Proporciona un email válido'),
    opcionalTexto('phone', 40),
    body('dateOfBirth').optional({ checkFalsy: true }).isISO8601().withMessage('Fecha de nacimiento inválida'),
    body('gender').optional({ checkFalsy: true }).isIn(['male', 'female', 'other']),
    opcionalNumero('anthropometry.weight', { max: 500 }),
    opcionalNumero('anthropometry.height', { max: 300 }),
    handleValidation,
];

// En la edición no se exige el nombre: un PUT puede traer solo el bloque que
// cambió, y obligar a reenviar el paciente entero invita a pisar datos.
export const patientUpdateValidators = [
    body('firstName').optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
    body('lastName').optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
    body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Proporciona un email válido'),
    opcionalTexto('phone', 40),
    body('dateOfBirth').optional({ checkFalsy: true }).isISO8601().withMessage('Fecha de nacimiento inválida'),
    handleValidation,
];

export const appointmentValidators = [
    body('date').notEmpty().withMessage('La fecha es obligatoria').isISO8601().withMessage('Fecha inválida'),
    body('time').optional({ checkFalsy: true }).matches(/^\d{2}:\d{2}$/).withMessage('La hora debe tener formato HH:MM'),
    body('duration').optional({ checkFalsy: true }).isInt({ min: 5, max: 480 })
        .withMessage('La duración debe estar entre 5 y 480 minutos'),
    body('type').optional({ checkFalsy: true }).isIn(['initial', 'follow_up', 'check_in', 'final']),
    body('status').optional({ checkFalsy: true }).isIn(['scheduled', 'completed', 'cancelled', 'no_show']),
    body('patient').optional({ checkFalsy: true }).isMongoId().withMessage('Paciente inválido'),
    opcionalTexto('notes', 2000),
    handleValidation,
];

export const paymentValidators = [
    body('patient').notEmpty().withMessage('El paciente es obligatorio').isMongoId().withMessage('Paciente inválido'),
    body('amount').notEmpty().withMessage('El importe es obligatorio')
        .isFloat({ min: 0 }).withMessage('El importe no puede ser negativo'),
    body('date').optional({ checkFalsy: true }).isISO8601().withMessage('Fecha inválida'),
    body('status').optional({ checkFalsy: true }).isIn(['pending', 'paid', 'cancelled']),
    body('method').optional({ checkFalsy: true }).isIn(['cash', 'card', 'transfer', 'other']),
    opcionalTexto('notes', 1000),
    handleValidation,
];

export const mealPlanValidators = [
    body('name').trim().notEmpty().withMessage('El nombre del plan es obligatorio').isLength({ max: 200 }),
    body('patient').optional({ checkFalsy: true }).isMongoId().withMessage('Paciente inválido'),
    body('nutrition.totalCalories').optional({ checkFalsy: true }).isFloat({ min: 0, max: 20000 }),
    handleValidation,
];
