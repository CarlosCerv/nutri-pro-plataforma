# Nutrition Platform - SaaS para Nutricionistas

Una plataforma web moderna y completa para nutricionistas, diseñada para simplificar la gestión de pacientes, consultas y planes de alimentación.

## Características

### Backend (Node.js + Express + MongoDB)
- **Autenticación JWT**: Sistema seguro de registro y login.
- **Gestión de Pacientes**: CRUD completo con datos antropométricos e historial médico.
- **Sistema de Citas**: Calendario de consultas con seguimiento.
- **Planes de Alimentación**: Creación de plantillas y asignación a pacientes.
- **Carga de Archivos**: Subida de documentos y fotos de progreso.
- **Autorización**: Protección de rutas y datos por usuario.

### Frontend (React + Vite)
- **Diseño Moderno**: Interfaz optimizada con una paleta de colores profesional.
- **Efectos Visuales**: Gradientes sutiles y micro-animaciones refinadas.
- **Responsive**: Diseño totalmente adaptable a desktop, tablet y dispositivos móviles.
- **Dashboard**: Visualización de métricas clave y actividad reciente.
- **Búsqueda y Filtros**: Herramientas eficientes para localización de información.
- **Rendimiento**: Optimización avanzada mediante el uso de Vite.

## Instalación y Uso

### Prerrequisitos
- Node.js (v18 o superior)
- MongoDB (local o MongoDB Atlas)
- npm o yarn

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edita .env con su configuración de MongoDB
npm run dev
```

El servidor estará en funcionamiento en `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Estructura del Proyecto

```
nutrition-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuración de base de datos
│   │   ├── models/          # Modelos de datos
│   │   ├── controllers/     # Controladores de lógica
│   │   ├── routes/          # Definición de endpoints
│   │   ├── middleware/      # Seguridad y validación
│   │   ├── services/        # Lógica de servicios externos
│   │   └── scripts/         # Automatización de tareas
│   ├── uploads/             # Almacenamiento de archivos
│   └── server.js            # Punto de entrada principal
│
└── frontend/
    ├── src/
    │   ├── components/      # Componentes de UI modulares
    │   ├── pages/           # Vistas de la aplicación
    │   ├── contexts/        # Estado global (Autenticación)
    │   ├── hooks/           # Funciones personalizadas
    │   ├── services/        # Comunicación con la API
    │   └── styles/          # Estilos y variables globales
    └── index.html
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de nuevos usuarios.
- `POST /api/auth/login` - Inicio de sesión.
- `GET /api/auth/me` - Consulta de datos del usuario actual.

### Pacientes
- `GET /api/patients` - Listado general de pacientes.
- `POST /api/patients` - Registro de nuevo paciente.
- `GET /api/patients/:id` - Detalle de un paciente específico.
- `PUT /api/patients/:id` - Actualización de información.
- `DELETE /api/patients/:id` - Eliminación de registros.

### Citas
- `GET /api/appointments` - Consulta de agenda.
- `POST /api/appointments` - Programación de citas.
- `GET /api/appointments/:id` - Detalle de consulta.
- `PUT /api/appointments/:id` - Reprogramación.
- `DELETE /api/appointments/:id` - Cancelación de citas.

## Sistema de Diseño

### Paleta de Colores
- **Primario**: Rosa Corporativo (#db2777) - Modernidad y dinamismo.
- **Secundario**: Azul Profesional (#3b82f6) - Seguridad y profesionalismo.
- **Neutrales**: Escala de grises refinada.

### Tipografía
- **Títulos**: Inter (Google Fonts).
- **Cuerpo**: Inter (Google Fonts).

## Seguridad

- Encriptación de contraseñas mediante Bcrypt.
- Gestión de sesiones a través de JWT.
- Validación estricta de esquemas de datos.
- Políticas de CORS configuradas para servidores seguros.

## Despliegue

### Backend
- Soporte para plataformas como Render, AWS o DigitalOcean.
- Configuración mediante variables de entorno.

### Frontend
- Optimizado para Vercel o Netlify.

## Próximas Implementaciones

- Generación automatizada de reportes en formato PDF.
- Registro de progresos mediante gráficas interactivas.
- Integración con servicios de mensajería para recordatorios.
- Sincronización con calendarios externos.

## Licencia

Este proyecto se distribuye bajo la licencia MIT.

## Autor

Desarrollado para profesionales de la nutrición que buscan la excelencia en la gestión de su práctica clínica.

---

**Soporte técnico**: Para asistencia, por favor abra una incidencia en el repositorio de GitHub o contacte con el equipo de soporte.
