// Promueve a un usuario YA REGISTRADO (vía /register) a role:'admin'.
// A diferencia de seedUsers.js, este script no borra ni crea nada — solo
// actualiza un documento existente, así que es seguro correrlo contra la
// base de datos de producción.
//
// Uso: node src/scripts/promoteAdmin.js correo@ejemplo.com
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const promoteAdmin = async () => {
    const email = process.argv[2];

    if (!email) {
        console.error('❌ Falta el email. Uso: node src/scripts/promoteAdmin.js correo@ejemplo.com');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📦 Conectado a MongoDB');

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            console.error(`❌ No existe ningún usuario con el email "${email}". Regístralo primero desde /register.`);
            process.exit(1);
        }

        if (user.role === 'admin') {
            console.log(`ℹ️  ${user.email} ya tiene role: 'admin'. Nada que hacer.`);
        } else {
            user.role = 'admin';
            await user.save();
            console.log(`✅ ${user.email} ahora tiene role: 'admin'. Puede iniciar sesión y será redirigido a /admin.`);
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

promoteAdmin();
