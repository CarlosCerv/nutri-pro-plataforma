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
    name: 'Admin NutriPro',
    email: 'admin@nutripro.com',
    password: 'admin123secure',
    role: 'admin',
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
    const deletedCount = await User.deleteMany({});
    console.log(`🗑️  ${deletedCount.deletedCount} usuarios anteriores eliminados`);

    // Insert users
    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    console.log(`✅ ${createdUsers.length} usuarios creados:`);
    console.log('');
    console.log('  👤 Nutricionista:');
    console.log('     📧 Email: nutricionista@test.com');
    console.log('     🔑 Contraseña: password123');
    console.log('');
    console.log('  👤 Admin:');
    console.log('     📧 Email: admin@nutripro.com');
    console.log('     🔑 Contraseña: admin123secure');
    console.log('');

    await mongoose.connection.close();
    console.log('✅ Script completado');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedUsers();
