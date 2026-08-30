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
│   │   └── uploadMiddleware.js   # multer: disco en local, memoria en Vercel
│   ├── services/                 # emailService, smsService, reminderService, nutritionCalculator
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
- Todas las rutas de recursos (pacientes, citas, planes, etc.) aplican `router.use(protect)`; solo `/api/auth/register`, `/api/auth/login` y `/api/calculations/*` son publicas.

## Modelos de datos

| Modelo | Archivo | Notas |
|---|---|---|
| `User` | `models/User.js` | `role` enum: `nutritionist` \| `admin` (no existe rol `patient`) |
| `Patient` | `models/Patient.js` | `nutritionist` (ObjectId, requerido, indexado) aisla los pacientes por cuenta — toda consulta de listado filtra por este campo |
| `Appointment` | `models/Appointment.js` | Referencia a `nutritionist` y `patient` |
| `MealPlan` | `models/MealPlan.js` | Referencia a `nutritionist` y `patient` |
| `DietTemplate` | `models/DietTemplate.js` | Plantillas reutilizables de planes de alimentacion |
| `Food` | `models/Food.js` | Catalogo de alimentos con valores nutricionales |
| `BodyComposition` | `models/BodyComposition.js` | Mediciones antropometricas por paciente |
| `ClinicalNote` | `models/ClinicalNote.js` | Notas clinicas por paciente |
| `Payment` | `models/Payment.js` | Registro de pagos/facturacion |

**Aislamiento multi-tenant**: el patron en toda la API es que cada nutricionista solo ve sus propios datos, filtrando por el campo `nutritionist` en el documento (poblado desde `req.user.id` al crear, comparado con `String(doc.nutritionist) === String(req.user.id)` al leer/modificar). Si agregas un modelo nuevo con esta misma relacion, sigue el mismo patron: declara el campo en el esquema (`required: true`, `index: true`) desde el principio — un campo de ownership ausente del esquema se descarta silenciosamente por el modo `strict` de Mongoose en vez de fallar de forma visible.

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
| POST | `/:id/upload` | Sube un documento/foto (multipart, campo `document`) |

### Citas (`/api/appointments`) — `routes/appointments.js`
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/` | Lista citas |
| POST | `/` | Crea cita |
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
Publicas (no requieren `protect`).

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
| GET | `/` | Lista pagos |
| POST | `/` | Registra pago |
| PUT \| DELETE | `/:id` | Actualiza, elimina |

### Dashboard (`/api/dashboard`) — `routes/dashboard.routes.js`
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/stats` | Metricas agregadas para el panel principal |

### Salud del servicio
`GET /api/health` — publica, sin autenticacion. Responde `{ success: true, message, timestamp }`.

## Sistema de recordatorios de citas

`src/scripts/reminderCron.js` programa un job con `node-cron` (`0 * * * *`, cada hora en punto) que llama a `reminderService.js`. El servicio busca citas en estado `scheduled` cuya fecha caiga entre 23 y 25 horas en el futuro y que no tengan `reminderSent: true`, e intenta notificar por email (`emailService.js`, via nodemailer) y SMS (`smsService.js`, via Twilio). Marca `reminderSent`, `reminderSentAt`, `reminderEmail` y `reminderSMS` en el documento de la cita al terminar.

Ambos servicios son lazy: si las variables `EMAIL_*` o `TWILIO_*` no estan configuradas, el servicio correspondiente registra un aviso en consola y no falla — el resto de la aplicacion sigue funcionando con normalidad.

**Importante**: este cron solo se ejecuta mientras el proceso Node vive de forma continua (`npm run dev` / `npm start` local, o un host con proceso persistente). En el despliegue serverless de Vercel el proceso no persiste entre invocaciones, por lo que el cron **no dispara recordatorios en produccion**. La migracion pendiente es a Vercel Cron Jobs (definir el endpoint como ruta HTTP invocada por un cron externo, en vez de un `setInterval`/`node-cron` en proceso).

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

## Docker

`Dockerfile` construye una imagen de solo el backend (`node:18-alpine`, `npm ci --only=production`, expone el puerto 5000). No forma parte del flujo de despliegue actual (que es Vercel serverless, ver README raiz); util si en el futuro se necesita un despliegue con proceso persistente (por ejemplo, para que el cron de recordatorios funcione sin migrar a Vercel Cron Jobs).
