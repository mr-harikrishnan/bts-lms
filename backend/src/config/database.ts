import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export async function connectDatabase(): Promise<typeof mongoose.connection | null> {
  if (isConnected) {
    return mongoose.connection;
  }

  const options: mongoose.ConnectOptions = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, options);
    isConnected = true;
    console.log(`[Database] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn.connection;
  } catch (error: any) {
    console.error('[Database] MongoDB connection error:', error.message);
    if (env.isProduction) {
      process.exit(1);
    }
    return null;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) return;
  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[Database] MongoDB disconnected cleanly.');
  } catch (error: any) {
    console.error('[Database] Error during disconnect:', error.message);
  }
}

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[Database] MongoDB disconnected event.');
});

mongoose.connection.on('error', (err: Error) => {
  console.error('[Database] MongoDB runtime error:', err.message);
});
