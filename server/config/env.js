import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];

for (const key of required) {
  if (!process.env[key] && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/team-task-manager',
  jwtSecret: process.env.JWT_SECRET || 'dev-access-secret-change-me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  prodClientUrl: process.env.PROD_CLIENT_URL || '',
  accessTokenTtl: process.env.JWT_ACCESS_TTL || '15m',
  refreshTokenTtl: process.env.JWT_REFRESH_TTL || '7d'
};
