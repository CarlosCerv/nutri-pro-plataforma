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

/**
 * Validadores de las rutas públicas (`/api/public/*`). Sin sesión que las
 * proteja, la validación de tipo es la única barrera antes de que el body
 * toque un `findOneAndUpdate`/`create` — de ahí que sean más estrictos que
 * sus equivalentes autenticados (nada de campos "any").
 */
export const preConsultationValidators = [
    body('antFamDM').optional().isBoolean().toBoolean(),
    body('antFamHTA').optional().isBoolean().toBoolean(),
    body('antFamObesidad').optional().isBoolean().toBoolean(),
    body('antFamCancer').optional().isBoolean().toBoolean(),
    opcionalTexto('antPersonales', 1000),
    opcionalTexto('cirugiasPrevias', 1000),
    opcionalTexto('alergias', 500),
    opcionalTexto('intolerancias', 500),
    opcionalTexto('medicamentos', 500),
    body('horasSueno').optional({ checkFalsy: true }).isFloat({ min: 0, max: 24 }),
    body('nivelEstres').optional({ checkFalsy: true }).isFloat({ min: 0, max: 10 }),
    opcionalTexto('ocupacion', 200),
    body('horasLaboral').optional({ checkFalsy: true }).isFloat({ min: 0, max: 24 }),
    body('tabaquismo').optional({ checkFalsy: true }).isFloat({ min: 0, max: 1000 }),
    body('alcoholismo').optional({ checkFalsy: true }).isFloat({ min: 0, max: 1000 }),
    opcionalTexto('preferencias', 1000),
    opcionalTexto('disgustos', 1000),
    opcionalTexto('objetivoAlim', 500),
    opcionalTexto('recordatorio24h', 2000),
    handleValidation,
];

export const publicBookingCreateValidators = [
    body('firstName').trim().notEmpty().withMessage('Tu nombre es obligatorio').isLength({ max: 120 }),
    body('lastName').trim().notEmpty().withMessage('Tu apellido es obligatorio').isLength({ max: 120 }),
    body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Correo inválido'),
    body('phone').optional({ checkFalsy: true }).trim().isString().isLength({ max: 40 }),
    body('date').notEmpty().withMessage('Elige una fecha').isISO8601().withMessage('Fecha inválida'),
    body('time').notEmpty().withMessage('Elige un horario').matches(/^\d{2}:\d{2}$/).withMessage('Hora inválida'),
    body('serviceIndex').optional({ checkFalsy: true }).isInt({ min: 0 }),
    handleValidation,
];

/**
 * `PUT /api/auth/profile` no tenía validación (aceptaba cualquier cosa en
 * nombre/correo/teléfono/contraseña) y ahora también acepta el `username` y
 * la configuración de la página pública de agendamiento — todo opcional,
 * porque la pestaña de contraseña de Profile.jsx guarda solo `password`.
 */
export const updateProfileValidators = [
    body('name').optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
    body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Proporciona un email válido').normalizeEmail(),
    opcionalTexto('specialty', 120),
    opcionalTexto('phone', 40),
    body('password').optional({ checkFalsy: true }).isString().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('username')
        .optional({ checkFalsy: true })
        .trim()
        .toLowerCase()
        .isLength({ min: 3, max: 30 })
        .matches(/^[a-z0-9](?:[a-z0-9._-]{1,28}[a-z0-9])?$/)
        .withMessage('El usuario solo admite letras, números, puntos, guiones y guion bajo (3-30 caracteres)'),
    body('publicBooking.enabled').optional().isBoolean().toBoolean(),
    body('publicBooking.bio').optional({ checkFalsy: true }).trim().isString().isLength({ max: 600 }),
    body('publicBooking.slotDurationMinutes').optional({ checkFalsy: true }).isInt({ min: 5, max: 240 }),
    body('publicBooking.services').optional().isArray({ max: 20 }),
    body('publicBooking.services.*.name').if(body('publicBooking.services').exists()).trim().notEmpty().isLength({ max: 120 }),
    body('publicBooking.services.*.durationMinutes').optional({ checkFalsy: true }).isInt({ min: 5, max: 480 }),
    body('publicBooking.services.*.price').optional({ checkFalsy: true }).isFloat({ min: 0 }),
    body('publicBooking.workingHours').optional().isArray({ max: 40 }),
    body('publicBooking.workingHours.*.day').if(body('publicBooking.workingHours').exists()).isInt({ min: 0, max: 6 }),
    body('publicBooking.workingHours.*.start').if(body('publicBooking.workingHours').exists()).matches(/^\d{2}:\d{2}$/),
    body('publicBooking.workingHours.*.end').if(body('publicBooking.workingHours').exists()).matches(/^\d{2}:\d{2}$/),
    handleValidation,
];
