#!/usr/bin/env node

/**
 * setup-credentials.js
 * Script interactivo para configurar credenciales y desplegar a Vercel
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => {
  rl.question(prompt, resolve);
});

const main = async () => {
  console.log('\n🚀 CONFIGURACIÓN DE CREDENCIALES - NUTRIPRO\n');
  console.log('================================================\n');

  // 1. MONGODB_URI
  console.log('📦 BASE DE DATOS MONGODB');
  console.log('Obtén tu URI en: https://www.mongodb.com/cloud/atlas\n');
  const mongodbUri = await question('Ingresa tu MONGODB_URI: ');

  // 2. JWT_SECRET
  console.log('\n🔐 JWT SECRET');
  console.log('Opción A: Ingresa tu JWT_SECRET');
  console.log('Opción B: Presiona ENTER para generar uno nuevo\n');
  let jwtSecret = await question('Ingresa JWT_SECRET (o ENTER para generar): ');
  
  if (!jwtSecret) {
    // Generar JWT_SECRET
    const crypto = require('crypto');
    jwtSecret = crypto.randomBytes(32).toString('hex');
    console.log(`\n✅ JWT_SECRET generado: ${jwtSecret}\n`);
  }

  // 3. Opcionales
  console.log('\n📧 CONFIGURACIÓN OPCIONAL');
  const emailConfig = await question('¿Quieres configurar email? (s/n): ');
  
  let emailHost = '';
  let emailUser = '';
  let emailPassword = '';
  
  if (emailConfig.toLowerCase() === 's') {
    emailHost = await question('EMAIL_HOST (ej: smtp.gmail.com): ');
    emailUser = await question('EMAIL_USER: ');
    emailPassword = await question('EMAIL_PASSWORD: ');
  }

  // 4. Crear archivo .env
  console.log('\n💾 GUARDANDO CONFIGURACIÓN...\n');
  
  const envContent = `# NutriPro Environment Variables
# DO NOT COMMIT THIS FILE TO GIT

PORT=5000
MONGODB_URI=${mongodbUri}
JWT_SECRET=${jwtSecret}
JWT_EXPIRE=30d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

${emailConfig.toLowerCase() === 's' ? `# Email Configuration
EMAIL_HOST=${emailHost}
EMAIL_PORT=587
EMAIL_USER=${emailUser}
EMAIL_PASSWORD=${emailPassword}
EMAIL_FROM=NutriPro <noreply@nutripro.com>

` : ''}# Twilio SMS Configuration (optional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
`;

  // Guardar en backend
  const backendEnvPath = path.join(__dirname, 'backend', '.env');
  fs.writeFileSync(backendEnvPath, envContent);
  console.log(`✅ .env guardado en: backend/.env`);

  // Guardar también un .env.local para frontend
  const frontendEnvContent = `VITE_API_URL=http://localhost:5000/api`;
  const frontendEnvPath = path.join(__dirname, 'frontend', '.env.local');
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log(`✅ .env.local guardado en: frontend/.env.local`);

  console.log('\n================================================');
  console.log('✅ CREDENCIALES CONFIGURADAS\n');

  console.log('📋 Próximos pasos:\n');
  console.log('1. npm install (instalar dependencias)');
  console.log('2. npm run dev (ejecutar localmente)');
  console.log('3. Verifica que todo funciona\n');

  console.log('🌐 VERCEL DEPLOYMENT:\n');
  console.log('1. Sube a GitHub: git push origin main');
  console.log('2. Ve a https://vercel.com/dashboard');
  console.log('3. Importa tu repositorio');
  console.log('4. Añade estas variables de entorno en Vercel Settings:\n');

  console.log('Variables críticas:');
  console.log(`  MONGODB_URI = ${mongodbUri}`);
  console.log(`  JWT_SECRET = ${jwtSecret}`);
  console.log(`  JWT_EXPIRE = 30d`);
  console.log(`  NODE_ENV = production`);
  console.log(`  FRONTEND_URL = https://TU_PROYECTO.vercel.app`);
  console.log(`  VITE_API_URL = https://TU_PROYECTO.vercel.app/api`);

  if (emailConfig.toLowerCase() === 's') {
    console.log('\nVariables de email:');
    console.log(`  EMAIL_HOST = ${emailHost}`);
    console.log(`  EMAIL_USER = ${emailUser}`);
    console.log(`  EMAIL_PASSWORD = ${emailPassword}`);
  }

  console.log('\n5. Click "Deploy"');
  console.log('6. ¡Tu app estará en vivo en 3-5 minutos!\n');

  console.log('================================================\n');

  rl.close();
};

main().catch(console.error);
