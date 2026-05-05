import mongoose from 'mongoose';
import { env } from './env.js';

let lastDbError = '';
let retryTimer = null;

const stateLabels = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

export const getDbStatus = () => ({
  state: stateLabels[mongoose.connection.readyState] || 'unknown',
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host || '',
  error: lastDbError
});

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) return mongoose.connection;

    const conn = await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000
    });
    lastDbError = '';
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    lastDbError = error.message;
    console.error(`MongoDB connection failed: ${error.message}`);
    return null;
  }
};

export const startDbConnection = () => {
  const retryMs = Number(process.env.DB_RETRY_MS || 10000);

  const attempt = async () => {
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) return;

    const connection = await connectDB();
    if (!connection && env.nodeEnv !== 'test') {
      clearTimeout(retryTimer);
      retryTimer = setTimeout(attempt, retryMs);
    }
  };

  mongoose.connection.on('disconnected', () => {
    if (env.nodeEnv === 'test') return;
    clearTimeout(retryTimer);
    retryTimer = setTimeout(attempt, retryMs);
  });

  attempt();
};

export const requireDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();

  const status = getDbStatus();
  return res.status(503).json({
    error: 'Database unavailable. Check Railway MONGO_URI / MongoDB Atlas network access.',
    database: {
      state: status.state,
      error: env.nodeEnv === 'production' ? undefined : status.error
    }
  });
};
