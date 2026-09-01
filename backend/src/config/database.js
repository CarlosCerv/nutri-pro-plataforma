import mongoose from 'mongoose';

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
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
      return mongooseInstance;
    }).catch((error) => {
      // Let a later call retry instead of caching a rejected connection attempt forever.
      cached.promise = null;
      throw error;
    });
  }

  cached.conn = await cached.promise;
  console.log(`✅ MongoDB Connected: ${cached.conn.connection.host}`);
  return cached.conn;
};

export default connectDB;
