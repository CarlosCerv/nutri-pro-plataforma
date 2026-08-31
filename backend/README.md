# NutriPro — Backend

API REST en Node.js (ESM) + Express + MongoDB/Mongoose. Ver el [README raiz](../README.md) para instalacion general, variables de entorno y despliegue. Este documento cubre lo especifico del backend: estructura, modelos, endpoints, autenticacion y scripts.

## Estructura

```
backend/
├── server.js                    # Entry point local: importa src/app.js y hace app.listen(PORT)
├── src/
│   ├── app.js                   # Configuracion de Express: CORS, middleware, montaje de rutas
│   ├── config/
│   │   └── database.js          # Conexion a MongoDB (con cache de conexion para serverless)
│   ├── models/                  # Esquemas Mongoose
│   ├── controllers/              # Logica de cada endpoint
│   ├── routes/                   # Definicion de rutas Express por recurso
│   ├── middleware/
│   │   ├── auth.js               # protect (JWT) y authorize (roles)
│   │   ├── uploadMiddleware.js   # multer: Cloudinary si esta configurado, si no disco en local / memoria en Vercel
│   │   └── validators.js         # cadenas express-validator (register/login) + handleValidation
│   ├── services/                 # emailService, smsService, reminderService, cloudinaryService, nutritionCalculator
│   ├── utils/
│   │   ├── asyncHandler.js       # wrapper try/catch -> res.status(...).json(...) para controladores
│   │   └── ownership.js          # isOwnedBy(doc, userId) — compara doc.nutritionist/createdBy contra el usuario autenticado
│   └── scripts/                  # seeds, auditoria, pruebas manuales (ver abajo)
└── uploads/                       # Almacenamiento local de archivos subidos (no usar en produccion serverless)
```

En Vercel, `../api/[...path].js` importa `src/app.js` directamente y lo envuelve con `serverless-http` — `server.js` solo se usa en desarrollo local.

## Autenticacion

- JWT firmado con `JWT_SECRET`, expiracion configurable con `JWT_EXPIRE` (default `30d`).
- `middleware/auth.js` expone:
  - `protect`: exige header `Authorization: Bearer <token>`, verifica el JWT y adjunta el usuario (sin password) a `req.user`. Responde 401 si falta o es invalido.
  - `authorize(...roles)`: middleware adicional para restringir por rol (`nutritionist` | `admin`).
- Passwords hasheados con bcrypt (`User.pre('save')`), nunca se devuelven en las respuestas (`select: false` en el esquema).
- Todas las rutas de recursos aplican `router.use(protect)`, `/api/calculations/*` incluido. Las unicas rutas realmente publicas son `/api/auth/register`, `/api/auth/login`, `/api/health`, y `/api/cron/reminders` (protegida aparte por `CRON_SECRET`, no por JWT — ver [Sistema de recordatorios](#sistema-de-recordatorios-de-citas)).
- `middleware/validators.js` valida `register`/`login` con `express-validator` antes de tocar la base de datos: rechaza email/password que no sean string (sin esto, un body como `{"email": {"$gt": ""}}` llega intacto a `User.findOne({ email })` y Mongoose lo interpreta como operador de consulta — una inyeccion NoSQL real que existia en el login) y devuelve errores 400 por campo en vez de un 500 generico.

## Controladores: `asyncHandler` y `isOwnedBy`

Los 12 controladores usan dos utilidades de `src/utils/` para no repetir el mismo boilerplate en cada handler:

- **`asyncHandler(fn, { status, message })`** envuelve un controlador async: si `fn` lanza, responde `{ success: false, message, error: error.message }` con el `status` indicado (default 500) y hace `console.error` una sola vez. El status/message se declaran al envolver cada ruta para no cambiar el contrato de respuesta que el frontend ya espera — no delega a un error handler generico.
- **`isOwnedBy(doc, userId, field = 'nutritionist')`** reemplaza el patron `String(doc.nutritionist) !== String(req.user.id)` repetido en cada controlador. Trata un campo de ownership ausente/null como "no autorizado" en vez de lanzar `TypeError` (que antes del helper se colaba como 500 en vez de 403 en varios controladores cuando el documento no tenia el campo poblado).

Si agregas un controlador nuevo, sigue este mismo patron en vez de volver a un try/catch manual.

## Modelos de datos

| Modelo | Archivo | Notas |
|---|---|---|
| `User` | `models/User.js` | `role` enum: `nutritionist` \| `admin` (no existe rol `patient`) |
| `Patient` | `models/Patient.js` | `nutritionist` (ObjectId, requerido, indexado) aisla los pacientes por cuenta — toda consulta de listado filtra por este campo. Incluye el bloque de campos clinicos que captura el expediente del frontend (antecedentes, patologias, habitos, actividad fisica) y el subdocumento `labResults` |
| `Appointment` | `models/Appointment.js` | Referencia a `nutritionist` y `patient` |
| `MealPlan` | `models/MealPlan.js` | Referencia a `nutritionist` y `patient` |
| `DietTemplate` | `models/DietTemplate.js` | Plantillas reutilizables de planes de alimentacion |
| `Food` | `models/Food.js` | Catalogo de alimentos con valores nutricionales |
| `BodyComposition` | `models/BodyComposition.js` | Mediciones antropometricas por paciente. `measurements` (peso, talla, IMC, ICC) y `bloodPressure` existen para poder reconstruir la evolucion; los pliegues van anidados en `skinfolds` **en ingles** — el frontend traduce desde su formulario en `src/lib/bodyComposition.js` |
| `ClinicalNote` | `models/ClinicalNote.js` | Notas clinicas por paciente |
| `Payment` | `models/Payment.js` | Registro de pagos/facturacion |

**Los campos que la interfaz captura tienen que existir en el esquema.** Mongoose corre en modo `strict`: un campo que el cliente envia y el esquema no declara se descarta **sin error**, y la peticion responde 200. Eso paso durante meses con todo el bloque clinico del expediente —antecedentes, patologias, habitos, actividad fisica—: el `PUT /api/patients/:id` respondia correctamente y no guardaba nada. Al agregar un campo nuevo a un formulario, agregalo tambien al modelo.

**Aislamiento multi-tenant**: el patron en toda la API es que cada nutricionista solo ve sus propios datos, filtrando por el campo `nutritionist` en el documento (poblado desde `req.user.id` al crear, comparado con `isOwnedBy(doc, req.user.id)` al leer/modificar — ver arriba). Si agregas un modelo nuevo con esta misma relacion, sigue el mismo patron: declara el campo en el esquema (`required: true`, `index: true`) desde el principio — un campo de ownership ausente del esquema se descarta silenciosamente por el modo `strict` de Mongoose en vez de fallar de forma visible.

**Indices**: cada modelo con una relacion `nutritionist`/`patient` tiene un indice compuesto que respalda su query de listado real (no uno generico por campo) — por ejemplo `MealPlan` indexa `{ nutritionist: 1, isTemplate: 1, createdAt: -1 }` porque `getMealPlans` filtra y ordena exactamente asi, y `DietTemplate` indexa `createdBy` e `isSystemTemplate` por separado porque su `$or` de listado no puede usar el indice compuesto `{ category, isSystemTemplate }` cuando no hay filtro de categoria. Si agregas un endpoint de listado nuevo, revisa el `query` real que arma el controlador antes de decidir que indice agregar — no asumas que un indice por campo alcanza para un filtro compuesto.

## Referencia de endpoints

Todas las rutas cuelgan de `/api`. Salvo que se indique "publica", requieren `Authorization: Bearer <token>`.

### Auth (`/api/auth`) — `routes/auth.js`
| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/register` | Publica. Crea usuario nutricionista/admin |
| POST | `/login` | Publica. Devuelve JWT |
| GET | `/me` | Usuario autenticado actual |
| PUT | `/profile` | Actualiza perfil del usuario autenticado |

### Pacientes (`/api/patients`) — `routes/patients.js`
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/` | Lista los pacientes del nutricionista autenticado |
| POST | `/` | Crea paciente |
| GET | `/export` | Exporta pacientes (debe ir antes de `/:id` en el router) |
| GET | `/:id` | Detalle de paciente |
| PUT | `/:id` | Actualiza paciente |
| DELETE | `/:id` | Elimina paciente |
| POST | `/:id/upload` | Sube un documento/foto (multipart, campo `document`). Si `CLOUDINARY_*` esta configurado, el archivo se sube ahi y persiste; si no, cae a disco local (dev) o al placeholder efimero de Vercel — ver [uploadMiddleware.js](#almacenamiento-de-archivos-cloudinary) |
| GET | `/:id/lab` | Historial de laboratorios del paciente, mas reciente primero |
| POST | `/:id/lab` | Registra un panel de laboratorio. Solo guarda los analitos con un numero real: la interfaz envia el panel completo y la mayoria de los campos viene vacia en cada consulta |

`POST /` y `PUT /:id` validan la entrada con `patientValidators` / `patientUpdateValidators` (`middleware/validators.js`).

### Citas (`/api/appointments`) — `routes/appointments.js`
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/` | Lista citas |
| POST | `/` | Crea cita (validada con `appointmentValidators`) |
| GET | `/today` | Citas de hoy, ya formateadas para la agenda del panel. Debe ir antes de `/:id` para que "today" no se lea como un ObjectId |
| GET \| PUT \| DELETE | `/:id` | Detalle, actualizacion, cancelacion |

### Planes de alimentacion (`/api/mealplans`) — `routes/mealplans.js`
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/` | Lista planes |
| POST | `/` | Crea plan |
| GET \| PUT \| DELETE | `/:id` | Detalle, actualizacion, eliminacion |

### Plantillas de dieta (`/api/diet-templates`) — `routes/dietTemplates.routes.js`
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/categories` | Categorias disponibles |
| GET | `/` | Lista plantillas |
| POST | `/` | Crea plantilla |
| GET \| PUT \| DELETE | `/:id` | Detalle, actualizacion, eliminacion |
| POST | `/:id/apply` | Aplica una plantilla a un paciente |

### Alimentos (`/api/foods`) — `routes/foods.routes.js`
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/` | Lista alimentos |
| GET | `/categories` | Categorias disponibles |
| GET | `/:id` | Detalle |
| POST | `/` | Crea alimento |
| PUT | `/:id` | Actualiza |
| DELETE | `/:id` | Elimina |

### Intercambio de alimentos (`/api/food-exchange`) — `routes/foodExchange.routes.js`
| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/equivalents` | Calcula equivalencias entre alimentos |
| GET | `/by-category/:category` | Alimentos por categoria de intercambio |
| POST | `/batch` | Calculo de intercambios en lote |

### Composicion corporal (`/api/body-composition`) — `routes/bodyComposition.routes.js`
| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/` | Crea registro |
| GET | `/patient/:patientId` | Historial de un paciente |
| GET \| PUT \| DELETE | `/:id` | Detalle, actualizacion, eliminacion |

### Notas clinicas (`/api/clinical-notes`) — `routes/clinicalNotes.routes.js`
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/patient/:patientId` | Notas de un paciente |
| POST | `/patient/:patientId` | Crea nota |
| PUT | `/:noteId` | Actualiza nota |
| DELETE | `/:noteId` | Elimina nota |

### Calculos nutricionales (`/api/calculations`) — `routes/calculations.routes.js`

| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/bmr` | Tasa metabolica basal |
| POST | `/tdee` | Gasto energetico total diario |
| POST | `/macros` | Distribucion de macronutrientes |
| POST | `/nutrition-plan` | Plan nutricional calculado |
| POST | `/body-composition` | Calculos de composicion corporal |

### Pagos (`/api/payments`) — `routes/paymentRoutes.js`
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/` | Lista pagos, filtrable por paciente, rango de fechas y estado |
| GET | `/summary` | Resumen del mes en curso (cobrado, pendiente, variacion contra el mes anterior), reparto por metodo y serie mensual. Debe ir antes de `/:id`. Aprovecha el indice `{ nutritionist: 1, date: -1 }` de `models/Payment.js` |
| POST | `/` | Registra pago (validado con `paymentValidators`) |
| PUT \| DELETE | `/:id` | Actualiza, elimina |

### Dashboard (`/api/dashboard`) — `routes/dashboard.routes.js`
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/stats` | Metricas agregadas para el panel principal |
| GET | `/weight-data` | Peso promedio de los pacientes por semana ISO, ultimas 8 semanas |
| GET | `/pathology-data` | Prevalencia de patologias entre los pacientes, en porcentaje |
| GET | `/macro-data` | Distribucion calorica promedio de los planes (4/4/9 kcal por gramo) |
| GET | `/activity` | Actividad reciente del consultorio, con tiempo relativo ya formateado |
| GET | `/population` | Estadisticas poblacionales: distribucion de IMC con los cortes de la OMS, prevalencias y evolucion del peso promedio |

Los cinco endpoints de graficas se implementaron porque el frontend ya los llamaba: `DashboardInsights.jsx` pedia estas rutas, no existian, y un `.catch` convertia el 404 en un array vacio. Las graficas del panel llevaban tiempo permanentemente en blanco sin ninguna señal de error.

**El color de las series lo asigna el cliente, no la API.** Estos endpoints devuelven solo `{ name, value }`; la paleta se aplica en el frontend con los tokens `--chart-*`. Un endpoint que devuelve colores hexadecimales ata el backend al tema de la interfaz.

### Cron (`/api/cron`) — `routes/cron.routes.js`
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/reminders` | Dispara `reminderService.checkAndSendReminders()`. Sin `protect` — se autentica con `CRON_SECRET`, no con JWT de usuario (ver [Sistema de recordatorios](#sistema-de-recordatorios-de-citas)) |

### Salud del servicio
`GET /api/health` — publica, sin autenticacion. Responde `{ success: true, message, timestamp }`.

## Sistema de recordatorios de citas

`reminderService.js` busca citas en estado `scheduled` cuya fecha caiga **dentro de las proximas 36 horas** y que no tengan `reminderSent: true`, e intenta notificar por email (`emailService.js`, via nodemailer) y SMS (`smsService.js`, via Twilio). Marca `reminderSent`, `reminderSentAt`, `reminderEmail` y `reminderSMS` en el documento de la cita al terminar. Ambos servicios de notificacion son lazy: si las variables `EMAIL_*` o `TWILIO_*` no estan configuradas, el servicio correspondiente registra un aviso en consola y no falla.

Ese servicio se dispara de **dos formas independientes**, segun el entorno:

- **Local / host persistente**: `src/scripts/reminderCron.js` programa un job con `node-cron`, iniciado desde `server.js` al arrancar (`startReminderCron()`). Funciona mientras el proceso Node vive de forma continua.
- **Vercel (produccion serverless)**: `node-cron` no sirve aqui — el proceso no persiste entre invocaciones, asi que un scheduler en memoria simplemente nunca dispara. En su lugar, `GET /api/cron/reminders` (`controllers/cron.controller.js`) expone el mismo `reminderService.checkAndSendReminders()` como endpoint HTTP, y `vercel.json` lo registra en `"crons"` con el schedule `0 8 * * *` (diario). Vercel invoca esa URL directamente — el endpoint verifica que el header `Authorization` sea `Bearer <CRON_SECRET>`, que es exactamente lo que Vercel manda automaticamente en sus propias invocaciones cuando la variable de entorno `CRON_SECRET` esta configurada en el proyecto. Sin `CRON_SECRET` configurado el endpoint responde 500 y rechaza todo (fail-closed), para que nadie pueda disparar recordatorios llamando la URL publica sin conocer el secreto.

### Por que la ventana es de 36 horas

El plan Hobby de Vercel no permite cron jobs mas frecuentes que una vez al dia. La configuracion anterior pedia `0 * * * *` (cada hora) contra una ventana de 23 a 25 horas: en Hobby, Vercel no ejecutaba ese schedule, asi que **los recordatorios sencillamente no se enviaban**. Y bajar el schedule a diario sin tocar el algoritmo habria sido peor: una ventana de 2 horas consultada una vez al dia deja fuera a casi todas las citas.

La combinacion actual —cron diario a las 8:00 y ventana de 0 a 36 horas— cubre toda cita al menos una vez, con entre 12 y 36 horas de anticipacion. Ampliar la ventana es seguro porque el flag `reminderSent` impide el reenvio: una cita que cae en dos ejecuciones consecutivas recibe un solo aviso.

Con Vercel Pro puede volverse horario cambiando unicamente el `schedule` de `vercel.json`. La ventana mas amplia no estorba, por el mismo motivo.

## Validacion de entrada

`middleware/validators.js` define las cadenas de `express-validator` y el manejador `handleValidation`, que responde 400 con el detalle por campo antes de que el request llegue al controlador.

Cubre `POST /auth/register`, `POST /auth/login`, y las rutas de escritura de pacientes, citas, pagos y planes de alimentacion.

Ademas de dar mensajes claros, cierra un hueco de **inyeccion NoSQL**: sin `.isEmail()` o `.isMongoId()`, un body como `{ "patient": { "$gt": "" } }` llega a Mongoose como operador de consulta en vez de como valor. Los campos opcionales usan `checkFalsy` porque los formularios envian cadenas vacias para lo que el usuario no lleno.

Los controladores que actualizan con `findByIdAndUpdate` ya pasan `runValidators: true`, asi que el esquema de Mongoose sigue siendo la segunda linea de defensa.

## Almacenamiento de archivos (Cloudinary)

`middleware/uploadMiddleware.js` decide donde guardar un archivo subido segun lo que este configurado:

1. **Cloudinary configurado** (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` en `.env`): usa `multer.memoryStorage()` y `services/cloudinaryService.js` sube el buffer directo a Cloudinary; `getFileUrl()` devuelve la `secure_url` publica. Persiste en cualquier entorno, incluido Vercel.
2. **Sin Cloudinary, local**: `multer.diskStorage()` en `backend/uploads/` (comportamiento de siempre).
3. **Sin Cloudinary, Vercel**: memoria efimera — el archivo no persiste entre invocaciones (el filesystem de una funcion serverless se descarta). `getFileUrl()` devuelve un placeholder y deja un `console.warn`.

`services/cloudinaryService.js` sigue el mismo patron lazy que `emailService`/`smsService`: sin credenciales, `isCloudinaryConfigured()` es `false` y el resto de la app sigue funcionando (cae al punto 2 o 3 de arriba). Para activarlo:

1. Crea una cuenta gratuita en [cloudinary.com](https://cloudinary.com).
2. Copia `Cloud name`, `API Key` y `API Secret` del dashboard.
3. En `.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=tu_cloud_name
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret
   ```

### Configurar email (Gmail de ejemplo)

1. Activa verificacion en dos pasos en la cuenta de Gmail.
2. Genera una "contraseña de aplicacion" (Google Account → Security → App passwords).
3. En `.env`:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASSWORD=contraseña-de-aplicacion-de-16-caracteres
   EMAIL_FROM=NutriPro <tu-email@gmail.com>
   ```

### Configurar SMS (Twilio)

1. Crea una cuenta en [twilio.com](https://www.twilio.com) y obten un numero.
2. Copia el Account SID y Auth Token desde la consola.
3. En `.env`:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=tu_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### Probar manualmente

```bash
node src/scripts/testReminders.js
```

Conecta a la base de datos, busca citas que necesiten recordatorio y muestra el resultado en consola sin esperar a la siguiente hora en punto. Util para verificar la configuracion de email/SMS sin crear una cita real a 24 horas exactas.

Para verificar en Mongo cuales citas ya recibieron recordatorio:

```javascript
db.appointments.find({ reminderSent: true }).sort({ reminderSentAt: -1 }).limit(10)
```

## Scripts disponibles (`package.json`)

| Script | Comando | Descripcion |
|---|---|---|
| `npm start` | `node server.js` | Arranca el servidor sin watch (produccion/manual) |
| `npm run dev` | `node --watch server.js` | Arranca con recarga automatica en cambios |
| `npm run test:connection` | `node src/scripts/testConnection.js` | Verifica la conexion a `MONGODB_URI` y lista colecciones |
| `npm run seed:users` | `node src/scripts/seedUsers.js` | Crea los 2 usuarios de prueba (borra los existentes) |
| `npm run seed:foods` | `node src/scripts/seedFoods.js` | Carga el catalogo de alimentos |
| `npm run seed:templates` | `node src/scripts/seedTemplates.js` | Carga plantillas de dieta (requiere usuarios ya creados) |
| `npm run seed:all` | ejecuta los tres anteriores en orden | Setup completo de datos de prueba |

Script adicional sin entrada en `package.json`, de solo lectura:

```bash
node src/scripts/auditPatients.js
```

Cuenta cuantos documentos de la coleccion `patients` tienen el campo `nutritionist` ausente o nulo, consultando con el driver nativo de MongoDB (sin pasar por el esquema de Mongoose). Util para auditar integridad de datos antes de aplicar cambios al esquema de `Patient`.

## Seguridad

Lineamientos que ya se aplicaron en el codigo actual y que hay que mantener al agregar rutas nuevas:

- **Nunca pases un campo del `req.body`/`req.query` directo a un filtro de Mongoose sin validar su tipo.** Un body como `{"email": {"$gt": ""}}` es un objeto JS valido que Mongoose acepta como operador de consulta dentro de `User.findOne({ email })` — sin validar que `email` sea string, eso es una inyeccion NoSQL. `middleware/validators.js` cierra esta puerta en `/api/auth/register` y `/api/auth/login` con `.isEmail()`/`.isString()`; cualquier ruta nueva que reciba un campo usado directamente en una query de Mongo deberia validarlo igual antes de llegar al controlador.
- **Un valor de busqueda de usuario nunca deberia ir directo a un `$regex`.** `foods.controller.js` escapa los caracteres especiales de regex (`escapeRegex`) antes de construir `{ $regex: search, $options: 'i' }» — sin eso, un patron como `(a+)+` puede causar backtracking catastrofico (ReDoS).
- **Un endpoint que recibe un `:patientId`/`:id` de la URL sin verificar ownership es una fuga de datos entre cuentas**, no un detalle menor — pasaba en `getPatientNotes` (cualquier cuenta autenticada podia leer las notas clinicas de un paciente ajeno con solo conocer su id). Usa siempre `isOwnedBy()` (ver arriba) antes de devolver el recurso, no solo antes de modificarlo.
- **Un fallo de autorizacion es 403, no 401.** 401 es "no autenticado" (falta o es invalido el JWT); 403 es "autenticado pero no autorizado para este recurso". Todos los controladores usan 403 para fallos de `isOwnedBy`.
- **`CRON_SECRET` sin configurar debe rechazar, no permitir.** `cron.controller.js` responde 500 si la variable no esta seteada, en vez de dejar pasar la invocacion sin verificar nada.
- **`authorize()` esta definido pero no se usa en ninguna ruta.** `middleware/auth.js` lo expone para restringir por rol, y hoy el aislamiento entre cuentas se hace exclusivamente comparando `nutritionist` con `isOwnedBy`. Si vuelve el modulo de administracion, sus rutas tienen que llevar `authorize('admin')` en el servidor: ocultar el item del menu en el cliente no es una barrera.

## Docker

`Dockerfile` construye una imagen de solo el backend (`node:18-alpine`, `npm ci --only=production`, expone el puerto 5000). No forma parte del flujo de despliegue actual (que es Vercel serverless, ver README raiz); util si en el futuro se necesita un despliegue con proceso persistente (por ejemplo, para correr el cron de recordatorios con `node-cron` en vez de Vercel Cron Jobs).
