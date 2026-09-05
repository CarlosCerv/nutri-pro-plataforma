import mongoose from 'mongoose';
import logger from './logger.js';

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, listenersAttached: false };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI no está configurada en este entorno.');
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI).then((mongooseInstance) => {
      /**
       * Un EventEmitter sin listener para 'error' hace que Node relance esa
       * excepción como no capturada — en una función serverless eso mata el
       * proceso entero, sin pasar por Express ni por `asyncHandler`. Vercel
       * responde entonces con su página genérica de error de plataforma
       * (`{"error":{"code":"...","message":"A server error has occurred"}}`),
       * no con el JSON `{success:false,...}` de esta API. Esto pasa sobre
       * todo con la conexión cacheada en `global.mongoose`: si el socket se
       * cae entre invocaciones "calientes" (frías/congeladas de Vercel),
       * Mongoose emite 'error' en la conexión que quedó viva de la petición
       * anterior. Se registra una sola vez (no en cada llamada a
       * `connectDB()`) para no acumular listeners en invocaciones calientes.
       */
      if (!cached.listenersAttached) {
        mongooseInstance.connection.on('error', (err) => {
          logger.error({ err }, 'MongoDB connection error (post-connect)');
          // Invalida la caché para que la próxima petición reconecte en vez
          // de quedarse sirviendo una conexión que ya sabemos que está rota.
          cached.conn = null;
          cached.promise = null;
        });
        mongooseInstance.connection.on('disconnected', () => {
          logger.warn('MongoDB disconnected — se reintentará conectar en la próxima petición');
          cached.conn = null;
          cached.promise = null;
        });
        cached.listenersAttached = true;
      }
      return mongooseInstance;
    }).catch((error) => {
      // Let a later call retry instead of caching a rejected connection attempt forever.
      cached.promise = null;
      throw error;
    });
  }

  cached.conn = await cached.promise;
  logger.info({ host: cached.conn.connection.host }, 'MongoDB connected');
  return cached.conn;
};

export default connectDB;
