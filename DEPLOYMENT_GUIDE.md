# Guía de Despliegue - NutriPro

Esta guía detalla los pasos para desplegar el proyecto de manera gratuita utilizando **MongoDB Atlas**, **Render** (Backend) y **Vercel** o **Netlify** (Frontend).

## 1. Base de Datos (MongoDB Atlas)

1.  Crea una cuenta gratuita en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Crea un nuevo Cluster (Shared Tier - FREE).
3.  En **Network Access**, añade `0.0.0.0/0` para permitir conexiones desde cualquier lugar (necesario para Render).
4.  En **Database Access**, crea un usuario y contraseña.
5.  Haz clic en **Connect** -> **Drivers** y copia la **Connection String**.
    - Sera algo como: `mongodb+srv://usuario:<password>@cluster0.abcde.mongodb.net/nutripro?retryWrites=true&w=majority`

## 2. Backend (Render)

1.  Crea una cuenta en [Render](https://render.com/).
2.  Haz clic en **New** -> **Web Service**.
3.  Conecta tu repositorio de GitHub.
4.  Selecciona la carpeta raíz del backend (o el repositorio completo si es monorepo).
5.  Configuración:
    - **Runtime**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `node server.js`
6.  En **Environment Variables**, añade:
    - `MONGODB_URI`: Tu conexión de MongoDB Atlas.
    - `JWT_SECRET`: Una cadena aleatoria segura.
    - `NODE_ENV`: `production`
    - `FRONTEND_URL`: La URL que te asigne Vercel/Netlify más adelante.

## 3. Frontend (Vercel)

1.  Crea una cuenta en [Vercel](https://vercel.com/).
2.  Haz clic en **Add New** -> **Project**.
3.  Importa tu repositorio de GitHub.
4.  **IMPORTANTE**: En la sección de **Environment Variables**, añade:
    - `VITE_API_URL`: La URL que te asigne Render (ej: `https://nutripro-backend.onrender.com/api`).
5.  Haz clic en **Deploy**.

## Notas Finales
- **CORS**: El backend está configurado para aceptar la URL de `FRONTEND_URL`. Si cambias de dominio, actualiza esa variable en Render.
- **Cold Start**: En el plan gratuito de Render, el servidor "se duerme" tras 15 minutos. La primera carga del día puede tardar unos 30 segundos.
- **SPA Routing**: Ya hemos incluido archivos `vercel.json` y `_redirects` para que las rutas de React funcionen correctamente al recargar la página.
