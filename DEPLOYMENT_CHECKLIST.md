# 📋 Pre-Deployment Checklist - NutriPro

## ✅ Configuración de Vercel (COMPLETADA)

- [x] `vercel.json` - Builds y rutas configuradas
- [x] Frontend build output: `dist`
- [x] Backend serverless: `api/[...path].js`
- [x] Rutas CORS y 404 configuradas

## ✅ Archivos del Proyecto

### Frontend
- [x] `frontend/package.json` - Dependencias instaladas
- [x] `frontend/vite.config.js` - Build configuration
- [x] `frontend/tailwind.config.js` - Estilos
- [x] `frontend/src/components/DailyMealPlanner.jsx` - Nuevo componente ✨

### Backend
- [x] `backend/package.json` - Dependencias instaladas
- [x] `backend/server.js` - Punto de entrada
- [x] `backend/src/app.js` - Express app
- [x] `backend/src/config/database.js` - MongoDB connection
- [x] `backend/src/routes/*` - Todas las rutas API

### API Serverless
- [x] `api/[...path].js` - Handler de Vercel

---

## 🔐 Variables de Entorno Requeridas

Antes de desplegar, obtén/prepara estas variables:

### Base de Datos (REQUERIDA)
```
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/nutripro
```
**Cómo obtener:**
- Registrate en https://www.mongodb.com/cloud/atlas (tier gratuito disponible)
- Crea un cluster
- Copia la connection string

### Seguridad (REQUERIDA)
```
JWT_SECRET=string_aleatorio_seguro_minimo_32_caracteres
JWT_EXPIRE=30d
NODE_ENV=production
```
**Generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend URL (REQUERIDA)
```
FRONTEND_URL=https://tu-dominio.vercel.app
VITE_API_URL=https://tu-dominio.vercel.app/api
```

### Email (OPCIONAL - para recordatorios)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password (usar "App Password" de Google)
EMAIL_FROM=NutriPro <noreply@nutripro.com>
```

### Twilio SMS (OPCIONAL - para SMS)
```
TWILIO_ACCOUNT_SID=tu_sid
TWILIO_AUTH_TOKEN=tu_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 🚀 Pasos para Desplegar

### 1️⃣ Preparar Repositorio
```bash
git add .
git commit -m "Production ready: DailyMealPlanner component added"
git push origin main
```

### 2️⃣ En Vercel Dashboard
1. Ve a https://vercel.com/dashboard
2. Click "Add New Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará `vercel.json` automáticamente

### 3️⃣ Configurar Variables de Entorno
1. En Vercel Dashboard → Project Settings → Environment Variables
2. Añade todas las variables de la sección anterior
3. Aplica a "Production", "Preview", y "Development"

### 4️⃣ Deploy
1. Click "Deploy"
2. Espera 3-5 minutos
3. ¡Tu app estará en vivo!

---

## ✨ Nuevas Características Listas para Producción

### Componente DailyMealPlanner
- ✅ Planificación de comidas interactiva
- ✅ Cálculo automático de macronutrientes
- ✅ Modal de búsqueda de alimentos
- ✅ Resumen diario con gráficas
- ✅ Edición de porciones en tiempo real
- ✅ Diseño responsivo Tailwind CSS
- ✅ TypeScript + Tests incluidos

**Archivos creados:**
- `frontend/src/types/nutrition.ts` - Interfaces
- `frontend/src/utils/calculations.ts` - Lógica de cálculos
- `frontend/src/hooks/useMealPlanner.ts` - State management
- `frontend/src/components/DailyMealPlanner.jsx` - Componente principal
- `frontend/src/pages/MealPlannerPage.jsx` - Página de ejemplo
- `frontend/src/components/MEAL_PLANNER_README.md` - Documentación

---

## 🧪 Verificar Antes de Desplegar

### Frontend Build
```bash
cd frontend
npm install
npm run build
# Verifica que 'dist' tenga archivos
```

### Backend Syntax
```bash
cd backend
npm install
node --check server.js
# Sin errores = OK
```

### Variables de Entorno Locales
```bash
cd backend
# Crea .env con valores locales
NODE_ENV=development npm run dev
# Prueba: curl http://localhost:5000/api/health
```

---

## 🔗 URLs Post-Despliegue

Una vez desplegado:

```
Frontend:      https://TU_PROYECTO.vercel.app
API Health:    https://TU_PROYECTO.vercel.app/api/health
Meal Planner:  https://TU_PROYECTO.vercel.app/meal-planner
Dashboard:     https://TU_PROYECTO.vercel.app/dashboard
```

---

## 📊 Monitoreo Post-Despliegue

En Vercel Dashboard puedes ver:
- Real-time logs
- Build duration
- Performance metrics
- Error tracking

---

## 🆘 Troubleshooting Rápido

| Error | Solución |
|-------|----------|
| `MONGODB_URI is required` | Añade variable en Vercel Settings |
| `Cannot GET /` | Verifica frontend build en `dist` |
| `CORS error` | Verifica `FRONTEND_URL` en backend .env |
| `API endpoint 404` | Verifica rutas en `backend/src/routes/` |
| `JWT invalid` | Regenera `JWT_SECRET` seguro |

---

## ✅ Estado Actual del Proyecto

```
nutri-pro-plataforma/
├── ✅ frontend/            (React + Vite + Tailwind)
│   ├── ✅ DailyMealPlanner component
│   ├── ✅ package.json
│   └── ✅ vercel.json
├── ✅ backend/             (Node + Express + MongoDB)
│   ├── ✅ All API routes
│   ├── ✅ package.json
│   └── ✅ server.js
├── ✅ api/[...path].js     (Serverless handler)
├── ✅ vercel.json          (Monorepo configuration)
└── 📋 READY FOR PRODUCTION
```

---

## 🎉 ¡Listo para Desplegar!

Tu proyecto está completamente configurado y listo para Vercel.

**Próximos pasos:**
1. Obtén tus variables de entorno (MongoDB URI, JWT_SECRET)
2. Sigue los "Pasos para Desplegar" anteriores
3. ¡Vercel hará el resto automáticamente!

Para más detalles, consulta: `VERCEL_DEPLOYMENT_GUIDE.md`
