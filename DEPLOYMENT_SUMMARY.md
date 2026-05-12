# 🚀 NutriPro - Ambiente Local + Vercel

Resumen de la reestructuración completada para soportar tanto ambiente local como Vercel serverless.

## ✅ Cambios Implementados

### 1. Backend Reestructurado para Vercel Serverless

#### Archivos Modificados
- **`backend/src/app.js`** (NUEVO)
  - Contiene toda la configuración de Express, middleware y rutas
  - Se usa tanto para local como para Vercel
  - Middleware de uploads adaptado para ambos entornos
  
- **`backend/server.js`** (SIMPLIFICADO)
  - Ahora es solo el entrypoint local
  - Importa `app.js` y lo ejecuta en puerto 5000
  
- **`api/[...path].js`** (NUEVO)
  - Función serverless de Vercel
  - Envuelve `app.js` con `serverless-http`
  - Captura todas las rutas `/api/*`

- **`backend/src/config/database.js`** (MEJORADO)
  - Usa caching de conexión para serverless
  - Evita reconectar en cada invocación de función
  - Compatible con local y Vercel

- **`backend/src/middleware/uploadMiddleware.js`** (NUEVO)
  - Middleware agnóstico de uploads
  - En local: usa disk storage (`/uploads`)
  - En Vercel: usa memory storage (temporal)
  - Exporta función `getFileUrl()` para obtener URLs correctas

- **`backend/src/controllers/patientController.js`** (ACTUALIZADO)
  - Usa el nuevo `uploadMiddleware`
  - Soporta uploads en ambos entornos

- **`frontend/vite.config.js`** (MEJORADO)
  - Configura proxy a `http://localhost:5000` en desarrollo
  - Permite que `/api/*` se proxee al backend local

- **`vercel.json`** (ACTUALIZADO)
  - Configurado para desplegar:
    - Backend como función Node serverless (`@vercel/node`)
    - Frontend como static build (`@vercel/static-build`)
  - Routing correcto para API y SPA

- **`package.json`** (RAÍZ - ACTUALIZADO)
  - Agregadas dependencias necesarias para Vercel
  - Modo `module` para compatibilidad ESM
  - Incluye `serverless-http` para el wrapper de funciones

### 2. Documentación Creada

- **`VERCEL_DEPLOYMENT.md`** (NUEVA)
  - Guía paso a paso para desplegar en Vercel
  - Configuración de MongoDB Atlas gratuito
  - Variables de entorno necesarias
  - Troubleshooting completo

- **`LOCAL_SETUP.md`** (NUEVA/ACTUALIZADA)
  - Guía para ejecutar localmente sin MongoDB instalado
  - Opciones: MongoDB Atlas o local
  - Comandos de instalación
  - Verificación de que todo funciona

---

## 📊 Flujo de Ejecución

### Local (Desarrollo)
```
npm run dev
  ├── Backend: backend/server.js
  │   └── Importa backend/src/app.js
  │   └── Escucha en puerto 5000
  │
  └── Frontend: vite + proxy
      ├── Escucha en puerto 5173
      ├── Proxea /api/* a localhost:5000
      └── Hot reload activado
```

### Vercel (Producción)
```
https://tu-proyecto.vercel.app/
├── Frontend (Static)
│   ├── Preconstruido por Vite
│   ├── Servido como archivos estáticos
│   └── SPA routing habilitado
│
└── /api/* → api/[...path].js
    ├── Función serverless Node
    ├── Importa backend/src/app.js
    └── Conecta a MongoDB Atlas
```

---

## 🔧 Configuración de Variables de Entorno

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://usuario:pass@cluster0.xxxxx.mongodb.net/nutripro?retryWrites=true&w=majority
JWT_SECRET=valor_super_secreto_cambiar_en_produccion
JWT_EXPIRE=30d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Opcionales:
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🌐 Despliegue en Vercel - Checklist

- [ ] **Crear MongoDB Atlas**
  - Cuenta gratuita
  - Cluster M0 (free)
  - User de base de datos
  - IP Access permitido (0.0.0.0/0)
  - Connection string obtenida

- [ ] **Conectar repositorio a Vercel**
  - Importar proyecto desde GitHub
  - Elegir rama principal

- [ ] **Configurar Environment Variables en Vercel**
  ```
  MONGODB_URI=<tu-connection-string>
  JWT_SECRET=<valor-secreto>
  FRONTEND_URL=https://tu-proyecto.vercel.app
  NODE_ENV=production
  ```

- [ ] **Deploy**
  - Vercel detecta `vercel.json`
  - Construye frontend (`npm run build`)
  - Empaqueta backend como función
  - Deploy automático

- [ ] **Verificar**
  - Frontend carga en https://tu-proyecto.vercel.app
  - Backend responde en https://tu-proyecto.vercel.app/api/health
  - Puedes registrarte y loguearte

---

## 📝 Características por Ambiente

### Local
✅ Hot reload (cambios reflejados al instante)  
✅ Logs completos en consola  
✅ Uploads a disco `/uploads`  
✅ MongoDB local o Atlas  
✅ Cron jobs ejecutándose  
✅ Debug mode completo  

### Vercel
✅ API serverless (escalable)  
✅ Frontend estático (CDN global)  
✅ MongoDB Atlas (compartida)  
✅ Uploads en memoria (temporal)  
⚠️ Cron jobs no persisten (considera servicio externo)  
⚠️ Filesystem efímero  

---

## 🎯 Próximos Pasos Opcionales

1. **Uploads a Cloud Storage**
   - Cloudinary (plan gratuito)
   - AWS S3
   - Vercel Blob Storage

2. **Mejorar Cron Jobs**
   - En Vercel, usar servicio externo (EasyCron, Cron-job.org)
   - O mover a backend persistente (Render, Railway)

3. **Monitoreo**
   - Sentry para errors
   - LogRocket para sessions
   - Vercel analytics

4. **Seguridad**
   - Rate limiting con express-rate-limit
   - HTTPS obligatorio
   - CSRF protection

---

## 📞 Soporte Rápido

| Problema | Solución |
|----------|----------|
| Puerto 5000 en uso | `netstat -ano \| findstr :5000` y `taskkill /PID <id>` |
| MongoDB no conecta | Verifica MONGODB_URI en `.env` |
| API retorna 404 | Asegúrate que `VITE_API_URL` es correcto |
| Frontend en blanco | Revisa consola F12 para errores |
| Uploads no funcionan | En Vercel es limitado, considera cloud storage |

---

## ✨ Resumen

**El proyecto ahora es 100% deployable en Vercel con MongoDB Atlas**, sin necesidad de:
- Servidor persistente
- Base de datos local
- Servicios pagos

**Y mantiene todo funcionando localmente** con desarrollo rápido y feedback inmediato.

🚀 **¡Listo para producción!**
