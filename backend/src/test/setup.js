import { beforeAll, afterEach, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    // La versión por defecto de mongodb-memory-server (8.x) exige macOS 14+;
    // 7.0.x es la última compatible con macOS 13 y sigue soportada.
    // Ajustar si el equipo actualiza a una macOS más reciente.
    binary: { version: '7.0.14' },
  });
  process.env.MONGODB_URI = mongoServer.getUri();

  // Se conecta vía `connectDB()` (no un `mongoose.connect()` directo) para
  // que su caché en `global.mongoose` quede poblada: así, cuando `app.js`
  // llame a `connectDB()` en su middleware por-petición, encuentra la
  // conexión ya lista en vez de intentar reconectar con un MONGODB_URI real.
  const { default: connectDB } = await import('../config/database.js');
  await connectDB();
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
