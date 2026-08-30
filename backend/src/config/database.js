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
    console.error('❌ MONGODB_URI is not defined. Please configure your database connection string.');
    return null;
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

  try {
    cached.conn = await cached.promise;
    console.log(`✅ MongoDB Connected: ${cached.conn.connection.host}`);
    return cached.conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    return null;
  }
};

export default connectDB;
