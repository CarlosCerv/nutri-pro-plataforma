# 🗄️ Guía Completa: MongoDB Local + Producción

Esta guía te lleva paso a paso desde la configuración local hasta probar en producción.

---

## 📋 Tabla de Contenidos
1. [Fase 1: MongoDB Localmente](#fase-1-mongodb-localmente)
2. [Fase 2: Seed de Datos Local](#fase-2-seed-de-datos-local)
3. [Fase 3: MongoDB Atlas (Producción)](#fase-3-mongodb-atlas-producción)
4. [Fase 4: Deploy a Vercel](#fase-4-deploy-a-vercel)
5. [Fase 5: Testing en Producción](#fase-5-testing-en-producción)

---

## Fase 1: MongoDB Localmente

### Paso 1.1: Instalar MongoDB Community Server

#### En Windows:
1. Descarga desde: https://www.mongodb.com/try/download/community
2. Ejecuta el instalador
3. Elige "Install MongoDB as a Service" (recomendado)
4. Completa la instalación

Para verificar:
```powershell
# En PowerShell, verifica el servicio
Get-Service MongoDB | Select-Object Status
# Debe mostrar: Status: Running
```

#### En Mac (con Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### En Linux (Ubuntu/Debian):
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### Paso 1.2: Verificar que MongoDB está corriendo

```bash
# Instala MongoDB Compass (GUI opcional pero recomendada):
# https://www.mongodb.com/products/compass

# O en terminal, verifica la conexión:
mongosh
# Si ves: "test>" = está corriendo ✅
```

### Paso 1.3: Configurar .env local

Edita `backend/.env`:

```env
# LOCAL CONFIGURATION
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nutripro
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=tu_clave_jwt_super_secreta_local_no_usar_en_produccion
JWT_EXPIRE=30d

# Email Configuration (opcional para development)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
EMAIL_FROM=Nutrition Platform <noreply@nutrition.com>

# Twilio SMS Configuration (opcional para development)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

**⚠️ IMPORTANTE**: Después de cambiar `.env`, reinicia el servidor backend.

---

## Fase 2: Seed de Datos Local

### Paso 2.1: Preparar scripts de seed

Los scripts ya existen en:
- `backend/src/scripts/seedFoods.js` → Alimentos
- `backend/src/scripts/seedTemplates.js` → Plantillas de dietas

### Paso 2.2: Agregar script de seed al package.json

Edita `backend/package.json` y agrega:

```json
"scripts": {
  "start": "node server.js",
  "dev": "node --watch server.js",
  "seed:all": "node src/scripts/seedFoods.js && node src/scripts/seedTemplates.js",
  "seed:foods": "node src/scripts/seedFoods.js",
  "seed:templates": "node src/scripts/seedTemplates.js"
}
```

### Paso 2.3: Crear usuarios de prueba

Crea un script: `backend/src/scripts/seedUsers.js`

```javascript
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const users = [
  {
    name: 'Nutricionista Test',
    email: 'nutricionista@test.com',
    password: 'password123',
    role: 'nutritionist',
    isActive: true
  },
  {
    name: 'Paciente Test',
    email: 'paciente@test.com',
    password: 'password123',
    role: 'patient',
    isActive: true
  }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Conectado a MongoDB');

    // Hash passwords
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => {
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Usuarios anteriores eliminados');

    // Insert users
    await User.insertMany(usersWithHashedPasswords);
    console.log('✅ Usuarios creados:');
    console.log('  📧 Nutricionista: nutricionista@test.com / password123');
    console.log('  📧 Paciente: paciente@test.com / password123');

    await mongoose.connection.close();
    console.log('✅ Script completado');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedUsers();
```

### Paso 2.4: Ejecutar los seeds

En la carpeta `backend/`, ejecuta:

```bash
# Seed all data
npm run seed:all

# O individual:
npm run seed:foods
npm run seed:templates
npm run seed:users
```

**Resultado esperado:**
```
📦 Conectado a MongoDB
✅ Alimentos insertados: 45
✅ Plantillas insertadas: 5
✅ Usuarios creados:
  📧 Nutricionista: nutricionista@test.com / password123
  📧 Paciente: paciente@test.com / password123
✅ Script completado
```

### Paso 2.5: Verificar con MongoDB Compass

1. Abre MongoDB Compass
2. Conecta a `mongodb://localhost:27017`
3. Selecciona BD: `nutripro`
4. Verifica las colecciones:
   - `users` (2 documentos)
   - `foods` (45+ documentos)
   - `diettemplates` (5 documentos)

---

## Fase 3: MongoDB Atlas (Producción)

### Paso 3.1: Crear cuenta MongoDB Atlas

1. Ve a https://www.mongodb.com/cloud/atlas
2. Haz clic en "Sign Up"
3. Completa el formulario y verifica tu email

### Paso 3.2: Crear un Cluster

1. En el dashboard, haz clic en "Create" → "Build a Database"
2. Elige **Shared Tier** (FREE)
3. Elige región:
   - Usa `N. Virginia` (us-east-1) si apuntas a USA
   - Usa `Frankfurt` (eu-central-1) si apuntas a Europa
4. Dale un nombre: `nutripro-prod`
5. Haz clic en "Create Cluster"

**Esto tarda 2-3 minutos** ⏳

### Paso 3.3: Configurar acceso de red

1. En el cluster, ve a "Network Access"
2. Haz clic en "Add IP Address"
3. **Para Vercel (producción):** Agrega `0.0.0.0/0`
   - Vercel usa múltiples IPs, así que necesitas permitir todas
4. Haz clic en "Confirm"

**⚠️ NOTA:** En producción real, querrías ser más específico, pero para MVP esto es aceptable.

### Paso 3.4: Crear usuario de base de datos

1. Ve a "Database Access"
2. Haz clic en "Add New Database User"
3. Elige "Autogenerate Secure Password"
4. Username: `nutripro_prod`
5. Haz clic en "Generate Secure Password"
6. Copia la contraseña generada (la necesitarás en 5 minutos)
7. Haz clic en "Add User"

### Paso 3.5: Obtener Connection String

1. Vuelve a tu cluster, haz clic en "Connect"
2. Elige "Drivers"
3. Elige "Node.js"
4. Copia la connection string
5. Reemplaza `<username>` y `<password>` con los valores que generaste

Ejemplo final:
```
mongodb+srv://nutripro_prod:TuContraseñaGeneradaAqui@nutripro-prod.abcde.mongodb.net/nutripro?retryWrites=true&w=majority
```

### Paso 3.6: Crear archivo `.env.production`

En `backend/.env.production`:

```env
# PRODUCTION CONFIGURATION
PORT=5000
MONGODB_URI=mongodb+srv://nutripro_prod:TuContraseñaGeneradaAqui@nutripro-prod.abcde.mongodb.net/nutripro?retryWrites=true&w=majority
NODE_ENV=production
FRONTEND_URL=https://tu-dominio-vercel.vercel.app

# JWT Configuration
JWT_SECRET=GeneraUnaCadenaAleatoriaSuperSeguraAqui_MinimoCambiarEsto!@#$%^&*()
JWT_EXPIRE=30d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password-no-contraseña-real
EMAIL_FROM=NutriPro <noreply@nutripro.com>

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## Fase 4: Deploy a Vercel

### Paso 4.1: Push a GitHub

```bash
git add .
git commit -m "MongoDB local y producción configurado"
git push origin main
```

### Paso 4.2: Actualizar vercel.json

En `vercel.json` (raíz del proyecto):

```json
{
  "buildCommand": "npm install",
  "outputDirectory": "public",
  "env": {
    "MONGODB_URI": "@mongodb_uri_prod",
    "JWT_SECRET": "@jwt_secret_prod",
    "NODE_ENV": "production",
    "FRONTEND_URL": "@frontend_url"
  }
}
```

### Paso 4.3: Actualizar vercel.json del frontend

En `frontend/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "@api_url"
  }
}
```

### Paso 4.4: Deploy en Vercel

1. Ve a https://vercel.com
2. Haz clic en "Add New" → "Project"
3. Selecciona tu repositorio de GitHub
4. **Configuración:**
   - Root Directory: `frontend/`
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. En **Environment Variables**, agrega:
   ```
   VITE_API_URL=https://tu-backend-url/api
   ```

6. Haz clic en "Deploy"

**Espera a que termine** ⏳ (2-5 minutos)

### Paso 4.5: Deploy del Backend (API Routes)

Si usas las funciones serverless en `api/`:

1. En Vercel, el backend se desplegará automáticamente
2. Verifica en "Deployments" → busca logs de errores

---

## Fase 5: Testing en Producción

### Paso 5.1: Testing de Autenticación

#### Registro:
```bash
curl -X POST https://tu-dominio-vercel.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "nutritionist"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

#### Login:
```bash
curl -X POST https://tu-dominio-vercel.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Paso 5.2: Testing de Pacientes

#### Crear paciente:
```bash
curl -X POST https://tu-dominio-vercel.vercel.app/api/patients \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com",
    "phone": "+5491234567890",
    "dateOfBirth": "1990-05-15"
  }'
```

#### Listar pacientes:
```bash
curl -X GET https://tu-dominio-vercel.vercel.app/api/patients \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Paso 5.3: Testing de Planes de Dieta

#### Obtener plantillas:
```bash
curl -X GET https://tu-dominio-vercel.vercel.app/api/diet-templates \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

#### Crear plan personalizado:
```bash
curl -X POST https://tu-dominio-vercel.vercel.app/api/meal-plans \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "PATIENT_ID_AQUI",
    "templateId": "TEMPLATE_ID_AQUI",
    "startDate": "2026-05-12",
    "endDate": "2026-05-19"
  }'
```

### Paso 5.4: Checklist de Testing

- [ ] Registro de usuario funciona
- [ ] Login devuelve token JWT
- [ ] Token expira después del tiempo configurado
- [ ] CRUD de pacientes funciona
- [ ] Planes de dieta se crean correctamente
- [ ] Se pueden obtener alimentos con búsqueda
- [ ] Citas se pueden crear y actualizar
- [ ] Emails de recordatorio se envían (si está configurado)
- [ ] Frontend carga correctamente
- [ ] API responde desde frontend

### Paso 5.5: Monitorear Errores

En Vercel:
1. Ve a tu proyecto
2. Abre "Deployments"
3. Haz clic en el deployment actual
4. Ve a "Logs" para ver errores en tiempo real

En MongoDB Atlas:
1. Ve a tu cluster
2. Abre "Monitoring"
3. Verifica conexiones, queries, errores

---

## 📊 Comparativa: Local vs Producción

| Aspecto | Local | Producción |
|---------|-------|-----------|
| **Base de Datos** | MongoDB local | MongoDB Atlas |
| **Servidor Backend** | localhost:5000 | Vercel Functions |
| **Frontend** | localhost:5173 | dominio.vercel.app |
| **Base Datos** | `mongodb://localhost:27017/nutripro` | `mongodb+srv://...` |
| **Costos** | Gratis | Gratis (tier free) |
| **Cold Start** | Inmediato | ~2-5 segundos |
| **Escalabilidad** | Ninguna | Automática |

---

## 🆘 Troubleshooting

### Error: "Cannot connect to MongoDB"
```
✅ Solución:
1. Verifica que MongoDB está corriendo: Get-Service MongoDB (Windows)
2. Verifica MONGODB_URI en .env
3. Reinicia el servidor backend
```

### Error: "MongoDB Atlas: IP not whitelisted"
```
✅ Solución:
1. Ve a Network Access en MongoDB Atlas
2. Agrega tu IP actual
3. O agrega 0.0.0.0/0 si estás en Vercel
```

### Error: "CORS error"
```
✅ Solución:
1. Verifica FRONTEND_URL en backend .env
2. Debe coincidir exactamente con tu dominio Vercel
3. Reinicia backend después de cambiar
```

### Error: "JWT token expired"
```
✅ Solución:
1. El token expira según JWT_EXPIRE (default: 30d)
2. El usuario necesita hacer login nuevamente
3. Implementa "Refresh tokens" para mejorar UX
```

---

## 📝 Siguientes Pasos Recomendados

1. **Configurar email** para recordatorios
2. **Implementar Refresh Tokens** para mejor experiencia
3. **Agregar logging** para producción
4. **Configurar backups** automáticos en MongoDB Atlas
5. **Implementar tests** automatizados
6. **Configurar CDN** para imágenes
7. **Monitoreo y alertas** en Vercel

---

**¡Listo! Ya tienes MongoDB configurado en local y en producción.** 🎉
