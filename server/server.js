import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { getDbStatus, requireDbConnection, startDbConnection } from './config/db.js';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import usersRoutes from './routes/usersRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const allowedOrigins = [
  env.clientUrl,
  env.prodClientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: env.nodeEnv === 'production' ? undefined : false
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (env.nodeEnv !== 'test') {
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' }
});

app.get('/api/health', (req, res) => {
  const database = getDbStatus();
  res.status(200).json({
    status: 'ok',
    database: {
      state: database.state,
      host: database.host || undefined,
      error: database.error || undefined
    },
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', requireDbConnection, authLimiter, authRoutes);
app.use('/api/users', requireDbConnection, usersRoutes);
app.use('/api/projects', requireDbConnection, projectRoutes);
app.use('/api/tasks', requireDbConnection, taskRoutes);

if (env.nodeEnv === 'production') {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

export const startServer = async () => {
  const host = process.env.HOST || '0.0.0.0';
  const server = app.listen(env.port, host, () => {
    console.log(`Server running on ${host}:${env.port} in ${env.nodeEnv} mode`);
  });

  startDbConnection();
  return server;
};

if (env.nodeEnv !== 'test') {
  startServer().catch((error) => {
    console.error(`Server failed to start: ${error.message}`);
    process.exit(1);
  });
}

export default app;
