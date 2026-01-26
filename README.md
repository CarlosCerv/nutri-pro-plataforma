# 🥗 Nutrition Platform - SaaS para Nutricionistas

Una plataforma web moderna y completa para nutricionistas, diseñada para simplificar la gestión de pacientes, consultas y planes de alimentación.

## ✨ Características

### Backend (Node.js + Express + MongoDB)
- 🔐 **Autenticación JWT** - Sistema seguro de registro y login
- 👥 **Gestión de Pacientes** - CRUD completo con datos antropométricos e historial médico
- 📅 **Sistema de Citas** - Calendario de consultas con seguimiento
- 🍽️ **Planes de Alimentación** - Creación de plantillas y asignación a pacientes
- 📁 **Carga de Archivos** - Subida de documentos y fotos de progreso
- 🔒 **Autorización** - Protección de rutas y datos por usuario

### Frontend (React + Vite)
- 🎨 **Diseño Moderno** - Interfaz minimalista con paleta de colores saludables
- 🌈 **Efectos Visuales** - Gradientes, glassmorphism y micro-animaciones
- 📱 **Responsive** - Funciona perfectamente en desktop, tablet y móvil
- 📊 **Dashboard Interactivo** - Métricas clave y actividad reciente
- 🔍 **Búsqueda y Filtros** - Encuentra pacientes y planes fácilmente
- ⚡ **Rendimiento Optimizado** - Carga rápida con Vite

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js (v18 o superior)
- MongoDB (local o MongoDB Atlas)
- npm o yarn

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edita .env con tu configuración de MongoDB
npm run dev
```

El servidor estará disponible en `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
nutrition-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuración de BD
│   │   ├── models/          # Modelos de Mongoose
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── routes/          # Rutas de API
│   │   ├── middleware/      # Autenticación y validación
│   │   ├── services/        # Servicios (Email, SMS)
│   │   └── scripts/         # Scripts de mantenimiento y cron
│   ├── uploads/             # Archivos subidos
│   └── server.js            # Punto de entrada
│
└── frontend/
    ├── src/
    │   ├── components/      # Componentes reutilizables
    │   ├── pages/           # Páginas de la aplicación
    │   ├── contexts/        # Context API (Auth)
    │   ├── hooks/           # Custom Hooks
    │   ├── services/        # API calls
    │   └── styles/          # CSS y diseño
    └── index.html
```

## 🎯 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Pacientes
- `GET /api/patients` - Listar pacientes
- `POST /api/patients` - Crear paciente
- `GET /api/patients/:id` - Obtener paciente
- `PUT /api/patients/:id` - Actualizar paciente
- `DELETE /api/patients/:id` - Eliminar paciente
- `POST /api/patients/:id/upload` - Subir documento

### Citas
- `GET /api/appointments` - Listar citas
- `POST /api/appointments` - Crear cita
- `GET /api/appointments/:id` - Obtener cita
- `PUT /api/appointments/:id` - Actualizar cita
- `DELETE /api/appointments/:id` - Eliminar cita

### Planes de Alimentación
- `GET /api/mealplans` - Listar planes
- `POST /api/mealplans` - Crear plan
- `GET /api/mealplans/:id` - Obtener plan
- `PUT /api/mealplans/:id` - Actualizar plan
- `DELETE /api/mealplans/:id` - Eliminar plan

## 🎨 Sistema de Diseño

### Paleta de Colores
- **Primario**: Verdes (#22c55e) - Salud y bienestar
- **Secundario**: Azules (#3b82f6) - Confianza y profesionalismo
- **Acentos**: Púrpura, naranja, rosa, teal

### Tipografía
- **Headings**: Outfit (Google Fonts)
- **Body**: Inter (Google Fonts)

### Componentes
- Cards con sombras suaves
- Botones con gradientes
- Inputs con focus states
- Badges de estado
- Animaciones de fade-in y hover

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Tokens JWT con expiración
- Validación de datos en backend
- Protección CORS configurada
- Rutas protegidas con middleware

## 📱 Responsive Design

- **Desktop**: Layout completo con sidebar
- **Tablet**: Sidebar colapsado con iconos
- **Mobile**: Navegación adaptada

## 🚀 Despliegue

### Backend
- Heroku, AWS, DigitalOcean
- Configurar variables de entorno
- Conectar a MongoDB Atlas

### Frontend
- Vercel, Netlify
- Configurar VITE_API_URL

## 📝 Próximas Características

- [ ] Gráficos de progreso de pacientes
- [ ] Exportación de reportes PDF
- [ ] Notificaciones por email
- [ ] Chat con pacientes
- [ ] Integración con calendario (Google Calendar)
- [ ] App móvil nativa

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

MIT License - Siéntete libre de usar este proyecto para tus propios fines.

## 👨‍💻 Autor

Desarrollado con ❤️ para nutricionistas que quieren optimizar su práctica.

---

**¿Necesitas ayuda?** Abre un issue en GitHub o contacta al equipo de desarrollo.
