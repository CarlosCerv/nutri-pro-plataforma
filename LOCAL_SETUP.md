# Guía Local - Instalar y Ejecutar NutriPro

Este documento te explica cómo ejecutar NutriPro en tu máquina local sin necesidad de instalar MongoDB.

## ✅ Requisitos

- Node.js v18+ ([descargar](https://nodejs.org/))
- Git
- Tu repositorio clonado

## 📁 Estructura del Proyecto

```
nutri-pro-plataforma/
├── backend/          # API Node.js + Express
├── frontend/         # React + Vite
├── api/              # Funciones serverless para Vercel
└── vercel.json       # Configuración de deployment
```

---

## 🚀 Pasos para Ejecutar Localmente

### 1. Instalar Dependencias

```bash
# En la raíz del proyecto
npm install

# Esto instala automáticamente las dependencias raíz necesarias para Vercel
```

### 2. Configurar Variables de Entorno

#### Backend (`backend/.env`)

Tienes dos opciones:

**Opción A: Usar MongoDB Atlas (en la nube - recomendado)**

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita
3. Sigue la [Guía de Despliegue](./VERCEL_DEPLOYMENT.md) hasta obtener tu `MONGODB_URI`
4. Luego crea `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster0.xxxxx.mongodb.net/nutripro?retryWrites=true&w=majority
JWT_SECRET=tu_valor_super_secreto_aqui_cambiar_en_produccion
JWT_EXPIRE=30d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Opcionales (para recordatorios por email/SMS):
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

**Opción B: Usar MongoDB Localmente (requiere instalación)**

1. Instala [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Inicia el servicio MongoDB en tu máquina
3. Crea `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nutripro
JWT_SECRET=tu_valor_super_secreto_aqui
JWT_EXPIRE=30d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### Frontend (`frontend/.env`)

Crea `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Instalar Dependencias de Backend y Frontend

```bash
cd backend
npm install

cd ../frontend
npm install

cd ..
```

### 4. Ejecutar la Aplicación

**Opción 1: Ejecutar ambos simultáneamente (requiere dos terminales o un terminal con split)**

```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
```

**Opción 2: Usar concurrently desde la raíz**

```bash
# Desde la raíz del proyecto
npm run dev

# Esto abre el backend y frontend en paralelo
```

### 5. Acceder a la Aplicación

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

---

## 📝 Primeros Pasos

1. Abre http://localhost:5173 en tu navegador
2. Haz clic en **"Regístrate aquí"** en la pantalla de login
3. Completa el formulario con:
   - Nombre: `Juan Pérez`
   - Email: `juan@ejemplo.com`
   - Contraseña: `password123`
   - Especialidad: `Nutrición Clínica` (opcional)
4. Haz clic en **Crear cuenta**
5. ¡Ya deberías estar dentro! 🎉

---

## 🔍 Verificar que Todo Funciona

### Backend está funcionando
```bash
curl http://localhost:5000/api/health
```

Deberías recibir:
```json
{
  "success": true,
  "message": "Nutrition Platform API is running",
  "timestamp": "2026-05-11T23:58:00.000Z"
}
```

### MongoDB está conectada
Cuando inices el backend, deberías ver:
```
✅ MongoDB Connected: ac-xxxxx-shard-00-00.xxxxx.mongodb.net
```

Si ves una advertencia sobre uploads, no te preocupes en desarrollo:
```
⚠️ File uploads in Vercel are temporary. For production, use a blob storage service.
```

---

## 📱 Troubleshooting

### Error: "Cannot find module 'express'"

```bash
# Instala las dependencias del backend
cd backend && npm install
```

### Error: "connect ECONNREFUSED"

MongoDB no está disponible:
- Si usas Atlas: verifica tu `MONGODB_URI` en `backend/.env`
- Si usas local: instala y inicia MongoDB Community Server

### Error: "VITE_API_URL is undefined"

Verifica que `frontend/.env` exista y tenga:
```env
VITE_API_URL=http://localhost:5000/api
```

### El frontend muestra página en blanco

Revisa la consola del navegador (F12 → Console) para ver errores. Lo más común es que la API no sea accesible.

---

## 🧪 Comandos Útiles

```bash
# Ver logs en tiempo real
cd backend && npm run dev

# Compilar frontend para producción
cd frontend && npm run build

# Ver vista previa del build
cd frontend && npm run preview

# Verificar sintaxis
node --check backend/server.js

# Limpiar cache de npm
npm cache clean --force
```

---

## 📦 Estructura de Carpetas

```
backend/
├── src/
│   ├── app.js                 # Configuración de Express
│   ├── config/
│   │   └── database.js        # Conexión a MongoDB
│   ├── controllers/           # Lógica de endpoints
│   ├── middleware/            # Auth, uploads, etc
│   ├── models/                # Esquemas de MongoDB
│   ├── routes/                # Definición de endpoints
│   └── services/              # Lógica de negocio
├── server.js                  # Entrypoint local
└── .env                       # Variables de entorno

frontend/
├── src/
│   ├── App.jsx                # Componente principal
│   ├── main.jsx               # Entrypoint
│   ├── pages/                 # Páginas (Login, Register, etc)
│   ├── components/            # Componentes reutilizables
│   ├── services/
│   │   └── api.js             # Cliente Axios
│   └── contexts/              # Context API (Auth)
└── vite.config.js             # Configuración de Vite

api/
└── [...path].js               # Función serverless para Vercel
```

---

## 🌐 Siguiente Paso: Desplegar en Vercel

Cuando estés listo para desplegar, sigue la [Guía de Despliegue en Vercel](./VERCEL_DEPLOYMENT.md).

---

## 💡 Tips

- Usa `npm run dev` para desarrollar (se recarga automáticamente)
- Los archivos `.env` son privados y no se suben a Git (están en `.gitignore`)
- Cada cambio en el código se refleja al instante en el navegador (HMR)
- Los usuarios y datos se guardan en MongoDB (no en archivos locales)

¡Listo para empezar! 🚀
