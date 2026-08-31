#!/usr/bin/env node

/**
 * NutriPro Setup Script
 * Automatiza la instalación y configuración inicial
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_ENV_PATH = path.join(__dirname, 'backend', '.env');
const FRONTEND_ENV_PATH = path.join(__dirname, 'frontend', '.env');

const DEFAULT_BACKEND_ENV = `PORT=5000
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster0.abcde.mongodb.net/nutripro?retryWrites=true&w=majority
JWT_SECRET=${generateRandomSecret()}
JWT_EXPIRE=30d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Email Configuration (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
EMAIL_FROM=NutriPro <noreply@nutrition.com>

# Twilio SMS (opcional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
`;

const DEFAULT_FRONTEND_ENV = `VITE_API_URL=http://localhost:5000/api
`;

/**
 * Secreto para firmar los JWT.
 *
 * Se genera con `crypto.randomBytes`, no con `Math.random`: este último no es
 * criptográficamente seguro y su salida es predecible a partir del estado del
 * generador, lo que permitiría falsificar tokens de sesión. Antes producía
 * además solo ~26 caracteres de base36 (~67 bits); ahora son 32 bytes.
 */
function generateRandomSecret() {
  return crypto.randomBytes(32).toString('hex');
}

function createEnvFile(filePath, content, fileName) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${fileName} ya existe`);
    return false;
  }

  try {
    fs.writeFileSync(filePath, content);
    console.log(`✨ Creado: ${fileName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error creando ${fileName}:`, error.message);
    return false;
  }
}

function main() {
  console.log('\n🚀 NutriPro Setup Script\n');

  // Create .env files
  console.log('📁 Configurando archivos de entorno...\n');

  createEnvFile(BACKEND_ENV_PATH, DEFAULT_BACKEND_ENV, 'backend/.env');
  createEnvFile(FRONTEND_ENV_PATH, DEFAULT_FRONTEND_ENV, 'frontend/.env');

  console.log('\n✅ Setup completado!\n');
  console.log('📋 Siguientes pasos:\n');
  console.log('1. Edita backend/.env y configura tu MONGODB_URI');
  console.log('   - Usa MongoDB Atlas: https://www.mongodb.com/cloud/atlas');
  console.log('   - O MongoDB local: mongodb://localhost:27017/nutripro\n');

  console.log('2. Instala dependencias:');
  console.log('   npm install\n');

  console.log('3. Inicia el backend:');
  console.log('   cd backend && npm run dev\n');

  console.log('4. En otra terminal, inicia el frontend:');
  console.log('   cd frontend && npm run dev\n');

  console.log('5. Abre http://localhost:5173 (o 5174) en tu navegador\n');

  console.log('📚 Para más info: ver README.md\n');
}

main();
