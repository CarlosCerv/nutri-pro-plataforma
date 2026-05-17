# 🚀 Guía de Despliegue a Vercel - NutriPro

## Opción 1: Despliegue Automático (Recomendado)

### Paso 1: Preparar el Repositorio Git

```bash
# Navega a la carpeta del proyecto
cd nutri-pro-plataforma

# Inicializa Git si aún no lo has hecho
git init
git add .
git commit -m "Initial commit with DailyMealPlanner component"

# Crea un repositorio en GitHub (https://github.com/new)
# Luego, conecta tu repositorio local:
git remote add origin https://github.com/TU_USUARIO/nutri-pro-plataforma.git
git branch -M main
git push -u origin main
```

### Paso 2: Conectar a Vercel

1. **Ve a https://vercel.com/dashboard**
2. Haz clic en **"Add New..."** → **"Project"**
3. Selecciona **"Import Git Repository"**
4. Busca y selecciona `nutri-pro-plataforma`
5. Vercel detectará automáticamente la configuración de `vercel.json`

### Paso 3: Configurar Variables de Entorno en Vercel

En el panel de Vercel, ve a **Settings** → **Environment Variables** y añade:

#### Backend Variables (Requeridas)
```
MONGODB_URI = mongodb+srv://tu_usuario:tu_password@tu_cluster.mongodb.net/nutripro
JWT_SECRET = tu_super_secreto_aleatorio_aqui_123456789
JWT_EXPIRE = 30d
NODE_ENV = production
FRONTEND_URL = https://tu-dominio.vercel.app
```

#### Email Configuration (Opcional, para recordatorios)
```
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USER = tu-email@gmail.com
EMAIL_PASSWORD = tu-app-password
EMAIL_FROM = NutriPro <noreply@nutripro.com>
```

#### Twilio SMS (Opcional, para SMS)
```
TWILIO_ACCOUNT_SID = tu_sid
TWILIO_AUTH_TOKEN = tu_token
TWILIO_PHONE_NUMBER = +1234567890
```

#### Frontend Variables
```
VITE_API_URL = https://tu-dominio.vercel.app/api
```

### Paso 4: Desplegar

1. Haz clic en **"Deploy"**
2. Vercel construirá automáticamente:
   - Frontend React → `/dist`
   - Backend API → `/api`
3. Tu aplicación estará en vivo en ~3-5 minutos

---

## Opción 2: Despliegue Manual con CLI

### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Paso 2: Autenticarse

```bash
vercel login
# Sigue las instrucciones para autenticarte con tu cuenta de Vercel
```

### Paso 3: Desplegar desde la carpeta del proyecto

```bash
cd nutri-pro-plataforma
vercel --prod
```

### Paso 4: Configurar Variables de Entorno

Durante el despliegue, Vercel te pedirá que confirmes las variables de entorno. O puedes hacerlo en el dashboard después.

---

## Verificación Pre-Despliegue

Antes de desplegar, verifica que todos estos archivos existan y estén correctos:

```bash
# En la raíz del proyecto
✓ vercel.json          # Configuración general de Vercel
✓ package.json         # Dependencias raíz

# Frontend
✓ frontend/package.json
✓ frontend/vercel.json
✓ frontend/vite.config.js
✓ frontend/tailwind.config.js

# Backend
✓ backend/package.json
✓ backend/server.js
✓ backend/src/app.js

# API Serverless
✓ api/[...path].js     # Handler de Vercel para Express
```

---

## Estructura de Builds en Vercel

El `vercel.json` está configurado para:

### 🔨 Build 1: Backend API (Serverless)
```
Source: api/[...path].js
Runtime: Node.js
Destination: https://tu-dominio.vercel.app/api/*
```

### 🏠 Build 2: Frontend (Static)
```
Source: frontend/package.json
Build Command: npm run build
Output Directory: dist
Destination: https://tu-dominio.vercel.app/*
```

### 🔄 Rutas
- `/api/*` → API serverless
- `/*` → Frontend React (SPA)
- 404 → Redirige a `/index.html` (para React Router)

---

## Troubleshooting

### ❌ Error: "MONGODB_URI is required"

**Solución:**
1. Ve a Vercel Dashboard
2. Project → Settings → Environment Variables
3. Añade: `MONGODB_URI=mongodb+srv://...`

### ❌ Error: "Frontend builds to 'dist' but no dist folder found"

**Solución:**
```bash
cd frontend
npm install
npm run build
# Verifica que se crear la carpeta 'dist'
```

### ❌ Error: "Cannot find module 'Express'"

**Solución:**
```bash
cd backend
npm install
# Verifica que package.json tiene todas las dependencias
```

### ❌ CORS Error: "Origin not allowed"

**Solución:**
1. En backend `.env.example`, asegúrate que:
   ```
   FRONTEND_URL=https://tu-dominio.vercel.app
   ```
2. El backend en `src/app.js` permite este origen

### ❌ API endpoint returns 404

**Verifica que:**
1. Las rutas están registradas en `backend/src/app.js`
2. El `vercel.json` redirige `/api/*` correctamente
3. Las rutas backend no tienen `/api` duplicada

---

## Post-Despliegue

### ✅ Verificar que todo funciona

```bash
# Frontend (debería abrir NutriPro)
https://tu-dominio.vercel.app

# Health check del backend
https://tu-dominio.vercel.app/api/health

# Endpoints principales
https://tu-dominio.vercel.app/api/auth/me (sin autenticar → 401)
https://tu-dominio.vercel.app/api/patients (sin autenticar → 401)
```

### 📊 Monitoreo

En Vercel Dashboard puedes ver:
- Logs en tiempo real
- Duración de builds
- Métricas de performance
- Errors y alertas

---

## Variables de Entorno Seguras

⚠️ **IMPORTANTE**: Nunca hagas commit de archivos `.env` con valores reales.

### Archivo .env.example (SÍ subir a Git)
```env
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/DB
JWT_SECRET=change_me_in_production
FRONTEND_URL=https://your-domain.vercel.app
```

### Archivo .env (NO subir a Git)
- Usa solo en desarrollo local
- Añádelo a `.gitignore`

---

## Presupuesto y Costos

**Vercel Free Tier** incluye:
- ✅ Deploy ilimitado
- ✅ 1000 Serverless Function invocations/mes
- ✅ 100GB bandwidth/mes
- ✅ SSL automático

**Recomendaciones:**
- Para producción, considera upgrading a $20/mes (Pro)
- Monitoring de uso en Vercel Analytics
- Considerar base de datos administrada (MongoDB Atlas tiene tier gratuito)

---

## Próximos Pasos

1. ✅ **Despliegue inicial**: Sigue Opción 1 o 2
2. 📧 **Configurar email/SMS** (opcional): Añade credenciales
3. 🗄️ **Base de datos**: Usar MongoDB Atlas (tier gratuito)
4. 🔐 **Seguridad**: Validar JWT, CORS, rate-limiting
5. 📱 **Monitoreo**: Activar Vercel Analytics
6. 🚀 **CI/CD**: Configura despliegues automáticos en cada push

---

## Contacto y Soporte

- **Documentación Vercel**: https://vercel.com/docs
- **Forum de Vercel**: https://github.com/vercel/vercel/discussions
- **Soporte NutriPro**: Abre una issue en GitHub

---

**¡Tu aplicación NutriPro está lista para producción! 🎉**
