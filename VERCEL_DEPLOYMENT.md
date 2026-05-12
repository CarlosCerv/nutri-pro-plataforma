# Guía de Despliegue en Vercel + MongoDB Atlas

Esta guía te explica cómo desplegar NutriPro en Vercel con una base de datos MongoDB Atlas.

## Paso 1: Configurar MongoDB Atlas (Base de Datos Gratuita)

### 1.1 Crear cuenta en MongoDB Atlas
1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Haz clic en **Sign Up** (usa email o GitHub)
3. Completa el registro

### 1.2 Crear un Cluster
1. Haz clic en **Create** para crear un nuevo proyecto
2. Selecciona **Create a Shared Cluster** (es gratis)
3. Elige:
   - **Provider**: AWS
   - **Region**: Elige la más cercana a tus usuarios
   - **Cluster Tier**: M0 (Free forever)
4. Haz clic en **Create Cluster** (tarda unos minutos)

### 1.3 Crear Usuario de Base de Datos
1. En el panel de Atlas, ve a **Database Access** (en el menú izquierdo)
2. Haz clic en **Add New Database User**
3. Completa:
   - **Username**: `nutripro_user`
   - **Password**: genera una contraseña segura (cópiala)
   - **Built-in Role**: `Atlas admin`
4. Haz clic en **Add User**

### 1.4 Permitir Conexiones
1. Ve a **Network Access** (en el menú izquierdo)
2. Haz clic en **Add IP Address**
3. Selecciona **Allow access from anywhere** (coloca `0.0.0.0/0`)
4. Haz clic en **Confirm**

### 1.5 Obtener Connection String
1. Vuelve a **Clusters** y haz clic en **Connect**
2. Elige **Connect your application**
3. Copia la cadena que se parece a:
   ```
   mongodb+srv://nutripro_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. **Reemplaza `<password>` con la contraseña que creaste en 1.3**

Guarda esta cadena, la necesitarás en Vercel.

---

## Paso 2: Desplegar en Vercel

### 2.1 Conectar repositorio a Vercel
1. Ve a [Vercel](https://vercel.com) y haz login
2. Haz clic en **Add New** → **Project**
3. Selecciona **Import Git Repository**
4. Busca tu repositorio `nutri-pro-plataforma` en GitHub
5. Haz clic en **Import**

### 2.2 Configurar variables de entorno
En la página de configuración del proyecto en Vercel:

1. En la sección **Environment Variables**, agrega estas variables:

   | Variable | Valor |
   |----------|-------|
   | `MONGODB_URI` | La cadena de conexión que copiaste de MongoDB Atlas |
   | `JWT_SECRET` | Genera un valor aleatorio seguro (por ejemplo: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
   | `FRONTEND_URL` | La URL que Vercel te asigne, ej: `https://tu-proyecto.vercel.app` |
   | `NODE_ENV` | `production` |

2. Para `VITE_API_URL` (solo para el frontend):
   - `VITE_API_URL` = `https://tu-proyecto.vercel.app/api`

3. Haz clic en **Deploy**

### 2.3 Variables de configuración detalladas

**MONGODB_URI**
- Obtenla de MongoDB Atlas (paso 1.5)
- Formato: `mongodb+srv://usuario:contraseña@cluster.mongodb.net/database?retryWrites=true&w=majority`
- La base de datos se crea automáticamente si no existe

**JWT_SECRET**
- Genera un string aleatorio seguro
- En tu terminal local:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- Copia el resultado y pégalo en Vercel

**FRONTEND_URL**
- Esta es la URL pública de tu app en Vercel
- Vercel te la asigna en el deployment
- Formato: `https://tu-proyecto.vercel.app`

---

## Paso 3: Configuración Local (sin MongoDB en tu máquina)

Si quieres probar localmente sin MongoDB instalado:

### 3.1 Usar MongoDB Atlas localmente
1. Copia la misma `MONGODB_URI` de MongoDB Atlas
2. En `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://usuario:contraseña@cluster0.xxxxx.mongodb.net/nutripro?retryWrites=true&w=majority
   JWT_SECRET=tu_jwt_secret_aqui
   FRONTEND_URL=http://localhost:5173
   ```
3. Inicia el backend: `cd backend && npm run dev`
4. Inicia el frontend: `cd frontend && npm run dev`

### 3.2 Instalar MongoDB localmente (opcional)
Si prefieres una base de datos local:
- Windows: descarga [MongoDB Community Server](https://www.mongodb.com/try/download/community)
- Luego usa en `backend/.env`:
  ```
  MONGODB_URI=mongodb://localhost:27017/nutripro
  ```

---

## Paso 4: Testing después del Despliegue

1. Espera a que Vercel termine de desplegar (verás el estado en el dashboard)
2. Ve a tu URL de Vercel: `https://tu-proyecto.vercel.app`
3. Intenta registrarte con un email de prueba
4. Si funciona, ¡tu app está lista en producción! 🎉

---

## Troubleshooting

### Error: "Cannot GET /api/health"
- El backend no se está sirviendo
- Verifica que `MONGODB_URI` esté configurada correctamente en Vercel
- Revisa los logs en Vercel: **Deployments** → **Select a deployment** → **Logs**

### Error: "connect ECONNREFUSED"
- MongoDB no está conectando
- Verifica la `MONGODB_URI`
- En MongoDB Atlas, asegúrate de que permitiste la IP `0.0.0.0/0`
- Espera a que el cluster de MongoDB esté "Ready" (puede tomar minutos)

### El frontend no puede llamar a la API
- Verifica que `VITE_API_URL` esté correctamente configurada en Vercel
- Debe ser `https://tu-proyecto.vercel.app/api` (sin `/` al final)
- El navegador debe mostrar `VITE_API_URL` en los logs de la consola

### Error "CORS policy: Cross-origin"
- El `FRONTEND_URL` en el backend debe coincidir exactamente con la URL del frontend
- En Vercel, ambos usan el mismo dominio, así que debería funcionar automáticamente

---

## Variables de Entorno Resumen

### Backend (Vercel Environment Variables)
```env
MONGODB_URI=mongodb+srv://usuario:pass@cluster.mongodb.net/nutripro?retryWrites=true&w=majority
JWT_SECRET=tu_valor_aleatorio_seguro_aqui
JWT_EXPIRE=30d
NODE_ENV=production
FRONTEND_URL=https://tu-proyecto.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com (opcional, para recordatorios)
EMAIL_PASSWORD=tu-app-password (opcional)
TWILIO_ACCOUNT_SID=opcional
TWILIO_AUTH_TOKEN=opcional
TWILIO_PHONE_NUMBER=opcional
```

### Frontend (Vercel Environment Variables)
```env
VITE_API_URL=https://tu-proyecto.vercel.app/api
```

---

## Notas Importantes

1. **Uploads de archivos**: En Vercel, los archivos `/uploads` se pierden tras cada deployment porque el filesystem es efímero. Considera usar un servicio de almacenamiento como:
   - AWS S3
   - Cloudinary (tiene plan gratuito)
   - Vercel Blob Storage

2. **Cron jobs**: El reminder cron job funciona localmente, pero en Vercel no persiste entre invocaciones. Para esto necesitarías:
   - Render (que permite persistent workers)
   - Una función de Vercel con un servicio de cron externo

3. **Rate limiting**: Sin configuración, tu API será limitada por Vercel. Para producción, considera agregar:
   - express-rate-limit
   - Redis para rate limiting distribuido

---

## Siguientes Pasos Opcionales

- [ ] Configurar uploads a Cloudinary o S3
- [ ] Agregar rate limiting
- [ ] Configurar un dominio personalizado
- [ ] Agregar monitoreo (Sentry, LogRocket)
- [ ] Configurar CI/CD para automatic deploys
