# NutriPro

Plataforma SaaS para nutricionistas: gestión de pacientes, citas, planes de alimentación, cálculos nutricionales y reportes clínicos. Backend en Node.js/Express/MongoDB, frontend en React/Vite, desplegada como una sola aplicación serverless en Vercel.

## Contenido

- [Stack tecnico](#stack-tecnico)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos previos](#requisitos-previos)
- [Instalacion y ejecucion local](#instalacion-y-ejecucion-local)
- [Variables de entorno](#variables-de-entorno)
- [Datos de prueba (seed)](#datos-de-prueba-seed)
- [Arquitectura](#arquitectura)
- [Despliegue en Vercel](#despliegue-en-vercel)
- [Sistema de diseno](#sistema-de-diseno)
- [Documentacion especifica](#documentacion-especifica)
- [Deuda tecnica conocida](#deuda-tecnica-conocida)

## Stack tecnico

**Backend**
- Node.js (ESM) + Express 4
- MongoDB + Mongoose 8
- Autenticacion JWT + bcryptjs
- express-validator, multer, node-cron, nodemailer, twilio

**Frontend**
- React 19 + Vite 5
- React Router 6
- Tailwind CSS 3 (tema Apple light, ver [Sistema de diseno](#sistema-de-diseno))
- axios, recharts, date-fns, dnd-kit, lucide-react, jspdf/html2canvas

**Infraestructura**
- Despliegue unico en Vercel: frontend como build estatico, backend como funcion serverless Node (`api/[...path].js` envuelve la app de Express con `serverless-http`)
- MongoDB Atlas como base de datos

## Estructura del repositorio

```
nutri-pro-plataforma/
├── api/
│   └── [...path].js        # Entry point serverless de Vercel (envuelve backend/src/app.js)
├── backend/                 # API Express + MongoDB — ver backend/README.md
├── frontend/                 # SPA React + Vite — ver frontend/README.md
├── vercel.json               # Configuracion de build y rutas del monorepo
├── setup.js                  # Genera backend/.env y frontend/.env con valores por defecto
└── package.json               # Scripts raiz (dev concurrente, install:all)
```

## Requisitos previos

- Node.js v18 o superior
- npm
- Una base de datos MongoDB accesible: MongoDB Atlas (recomendado, gratuito) o una instancia local

## Instalacion y ejecucion local

### 1. Instalar dependencias

```bash
npm run install:all
```

Esto instala las dependencias de `backend/` y `frontend/` (el `package.json` raiz solo declara las dependencias compartidas con la funcion serverless de Vercel; no hace falta correr `npm install` en la raiz para desarrollo local).

### 2. Configurar variables de entorno

Crea `backend/.env` y `frontend/.env` (ver [Variables de entorno](#variables-de-entorno) para el detalle de cada valor). Puedes partir de los ejemplos:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edita `backend/.env` con tu cadena de conexion de MongoDB (`MONGODB_URI`) y genera un `JWT_SECRET` real:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Alternativa: `node setup.js` desde la raiz crea ambos archivos `.env` con una estructura por defecto (genera un secreto de relleno con `Math.random`, no criptografico — reemplazalo antes de usar el proyecto mas alla de una prueba local rapida).

### 3. Poblar la base de datos con datos de prueba (opcional pero recomendado)

```bash
cd backend
npm run seed:all
```

Ver [Datos de prueba (seed)](#datos-de-prueba-seed) para las credenciales que esto crea.

### 4. Levantar backend y frontend

Desde la raiz, ambos a la vez:

```bash
npm run dev
```

O por separado:

```bash
cd backend && npm run dev    # http://localhost:5000
cd frontend && npm run dev   # http://localhost:5173
```

### 5. Verificar

- Frontend: `http://localhost:5173`
- Backend health check: `curl http://localhost:5000/api/health`
- El proxy de Vite reenvia `/api/*` al backend en `localhost:5000` durante desarrollo (`frontend/vite.config.js`), por lo que el frontend puede llamar a rutas relativas `/api/...` sin CORS en local.

## Variables de entorno

### `backend/.env`

| Variable | Requerida | Descripcion |
|---|---|---|
| `PORT` | No (default 5000) | Puerto del servidor Express en local |
| `MONGODB_URI` | Si | Cadena de conexion de MongoDB (Atlas o local) |
| `JWT_SECRET` | Si | Secreto para firmar tokens JWT — usa un valor aleatorio de al menos 32 bytes |
| `JWT_EXPIRE` | No (default `30d`) | Duracion del token |
| `NODE_ENV` | No | `development` o `production` |
| `FRONTEND_URL` | Recomendada | Origen permitido por CORS ademas de `localhost` |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM` | No | Envio de recordatorios de citas por correo (nodemailer). Si faltan, el servicio se desactiva silenciosamente sin romper el servidor. |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | No | Envio de recordatorios por SMS (Twilio). Mismo comportamiento: opcional y silencioso si falta. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Recomendada en produccion | Almacenamiento persistente de archivos subidos (fotos/documentos de pacientes). Sin esto, los uploads en Vercel no persisten entre invocaciones. |
| `CRON_SECRET` | Solo en Vercel | Autentica las invocaciones de `GET /api/cron/reminders` — Vercel la manda automaticamente como `Authorization: Bearer <valor>` en sus propios cron jobs cuando esta configurada en el proyecto. Sin ella, el endpoint rechaza toda invocacion. |

### `frontend/.env`

| Variable | Requerida | Descripcion |
|---|---|---|
| `VITE_API_URL` | Si | URL base de la API. En local: `http://localhost:5000/api` |

Ambos archivos `.env` estan excluidos de git (`.gitignore`). Nunca subas credenciales reales al repositorio; usa siempre `.env.example` como plantilla publica.

## Datos de prueba (seed)

`backend/package.json` expone estos scripts (deben ejecutarse en este orden si se corren por separado, porque las plantillas de dieta requieren usuarios existentes):

```bash
npm run seed:users      # crea los 2 usuarios de prueba
npm run seed:foods      # carga el catalogo de alimentos
npm run seed:templates  # carga plantillas de dieta (requiere usuarios ya creados)
npm run seed:all        # ejecuta los tres en el orden correcto
```

Usuarios creados por `seed:users`:

| Rol | Email | Contraseña |
|---|---|---|
| Nutricionista | `nutricionista@test.com` | `password123` |
| Admin | `admin@nutripro.com` | `admin123secure` |

`seed:all` borra y recrea estos usuarios (`User.deleteMany({})`), asi que no lo corras contra una base con datos reales sin revisar el script primero (`backend/src/scripts/seedUsers.js`).

## Arquitectura

### Modelo de despliegue

El proyecto corre como **una sola aplicacion Express** (`backend/src/app.js`) montada en dos contextos distintos:

- **Local**: `backend/server.js` importa `app.js` y lo sirve con `app.listen()` en el puerto 5000.
- **Vercel**: `api/[...path].js` importa el mismo `app.js`, lo envuelve con `serverless-http` y Vercel lo invoca como funcion serverless en cada request a `/api/*`.

`vercel.json` en la raiz configura el build del monorepo: el frontend se construye como sitio estatico (`frontend/package.json`, salida en `dist`) y el backend se despliega como funcion Node desde `api/[...path].js`. Las rutas `/api/*` van a la funcion serverless; el resto sirve el `index.html` del frontend (SPA routing).

### Backend

Ver [`backend/README.md`](./backend/README.md) para: estructura de carpetas, modelos de datos, referencia completa de endpoints, autenticacion, sistema de recordatorios (cron), y scripts disponibles.

### Frontend

Ver [`frontend/README.md`](./frontend/README.md) para: estructura de carpetas, mapa de rutas, sistema de diseno, y convenciones de estilo.

## Despliegue en Vercel

1. Sube el repositorio a GitHub.
2. En [vercel.com/dashboard](https://vercel.com/dashboard), importa el repositorio. Vercel detecta `vercel.json` automaticamente — no hace falta configurar build command ni output directory manualmente.
3. En **Project Settings → Environment Variables**, agrega las mismas variables de `backend/.env` (ver tabla arriba) mas `VITE_API_URL=https://<tu-dominio>.vercel.app/api`. Aplica a Production, Preview y Development segun corresponda.
4. Haz clic en **Deploy**.
5. Una vez desplegado, actualiza `FRONTEND_URL` con el dominio real que Vercel asigno y vuelve a desplegar (redeploy) para que CORS lo reconozca.
6. Verifica: `https://<tu-dominio>.vercel.app/api/health` debe responder `{"success":true,...}`.

### Limitaciones conocidas del entorno serverless

- **Subida de archivos**: `backend/src/middleware/uploadMiddleware.js` sube a Cloudinary si `CLOUDINARY_CLOUD_NAME`/`CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET` estan configurados en las variables de entorno (ver tabla arriba) — sin eso, usa disco local en desarrollo o memoria efimera en Vercel, donde los archivos **no persisten** entre invocaciones. Para produccion real, configura Cloudinary.
- **Cron jobs**: los recordatorios de citas corren via `node-cron` en local/host persistente, y via `GET /api/cron/reminders` + `vercel.json`'s `"crons"` en Vercel (protegido con `CRON_SECRET`). El schedule es diario (`0 8 * * *`), compatible con el plan Hobby, contra una ventana de 36 h en `reminderService.js`: toda cita recibe su aviso con entre 12 y 36 horas de anticipacion, y el flag `reminderSent` del modelo `Appointment` impide reenviarlo. Con Vercel Pro puede volverse horario cambiando solo el `schedule`.

## Sistema de diseno

La fuente de verdad es [`.claude/skills/apple-style-frontend/SKILL.md`](./.claude/skills/apple-style-frontend/SKILL.md). Los tokens viven en `frontend/src/index.css` y se consumen desde Tailwind (`frontend/tailwind.config.js`) y los pocos `.css` de pagina que quedan. Un solo tema, claro, sin modo oscuro.

- **Tipografia**: `-apple-system, BlinkMacSystemFont, "SF Pro Display/Text"` (`--font-family`), con cuatro pesos como maximo (300/400/600/700).
- **Tinta**: `--ink` `#1d1d1f`, `--ink-muted` `#424245`, `--ink-secondary` `#6e6e73`.
- **Superficies**: `--surface` `#ffffff`, `--surface-cool` `#fafafc`, `--surface-alt` `#f5f5f7`, `--surface-strong` `#e8e8ed`, `--surface-dark` `#1d1d1f`.
- **Acento unico**: `--accent` `#0071e3`. Los estados semanticos (`--success`, `--warning`, `--danger`, `--info`) comunican el resultado de una operacion; no son acentos alternos.
- **Radios**: `--radius-s` 6px, `--radius-m` 11px, `--radius-l` 18px, y `--radius-pill` 980px para todo boton de accion.
- **Una sola sombra** (`--shadow-1`) y **una sola curva** (`--ease`), con dos duraciones (`--duration-micro`, `--duration-layout`).
- Las paletas `navy` / `emerald` / `gold` de `tailwind.config.js` estan marcadas como obsoletas: apuntan al acento y a los estados semanticos, y desapareceran cuando las clases que aun las usan se migren a tokens.

Ver [`frontend/README.md`](./frontend/README.md) para el detalle y para los componentes del sistema de diseno.

## Documentacion especifica

- [`backend/README.md`](./backend/README.md) — API, modelos, autenticacion, recordatorios, scripts.
- [`frontend/README.md`](./frontend/README.md) — rutas, componentes, sistema de diseno en detalle.

## Deuda tecnica conocida

Registrada aqui para que quede visible en un solo lugar en vez de dispersa en notas sueltas.

- **`vite` y `react-router-dom` en `npm audit`**: quedan dos avisos directos en el frontend. El de `vite` afecta al servidor de desarrollo, no al build de produccion, y subir de la 5 a la 8 arrastra un cambio de major en cadena con `@vitejs/plugin-react`. El de `react-router-dom` exige migrar a la v7. Ambos merecen su propia sesion con su propia verificacion, no colarse al final de otra. El resto del arbol quedo limpio: backend en cero, frontend sin ninguna vulnerabilidad critica.
- **Cobertura de pruebas**: las 77 pruebas cubren la logica pura (calculos clinicos, mapeadores, hook del planificador) y la tabla de redirecciones. Las paginas no tienen pruebas de componente; el `tsconfig.json` esta acotado a `src/lib`, `src/hooks`, `src/types` y `src/utils` con `checkJs` apagado, asi que las paginas `.jsx` siguen sin verificacion de tipos.
- **Modulo de licencias**: `frontend/src/_archive/AdminLicenses.jsx` esta fuera del release. Reactivarlo exige, en el backend, un modelo `License`, sus endpoints y aplicar `authorize('admin')`, que hoy esta definido en `middleware/auth.js` pero **no se usa en ninguna ruta**. Ver `frontend/src/_archive/README.md`.
- **Alias de tokens heredados**: `frontend/src/index.css` mantiene un bloque de alias (`--text-primary`, `--surface-muted`, `--radius-md`…) que apuntan a los tokens canonicos de la skill, para que la migracion de las paginas pueda hacerse por partes. Se borran cuando `grep -r "var(--text-primary" frontend/src` no devuelva nada. Lo mismo con las paletas `emerald`/`gold`/`navy` de `tailwind.config.js`, que ya apuntan al acento unico.
- **Recordatorios en Vercel Hobby**: resuelto con un cron diario y una ventana de 36 h. Con Vercel Pro puede volverse horario cambiando solo el `schedule` de `vercel.json`; la ventana mas amplia no estorba porque el flag `reminderSent` impide reenviar.

### Resuelto en la ultima revision

Lo que esta seccion listaba antes y ya no aplica: el `setup-credentials.js` roto, los componentes muertos del planificador de comidas, el cron incompatible con el plan gratuito, y la validacion de entrada acotada a `auth`. Se documentan aqui porque el historial de git explica el porque mejor que un resumen.
