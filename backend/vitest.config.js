import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    // mongodb-memory-server descarga y arranca su propio binario de Mongo la
    // primera vez que corre — más lento que un test normal.
    testTimeout: 20000,
    hookTimeout: 30000,
    // Cada archivo de test levanta su propio mongod en memoria y su propio
    // connectDB() (cacheado en `global.mongoose`, compartido por el proceso).
    // Corriendo los archivos en paralelo esa caché de un archivo se filtra a
    // otro y las peticiones de Supertest terminan hablando con el mongod
    // equivocado. Uno a la vez evita la contaminación cruzada.
    fileParallelism: false,
  },
});
