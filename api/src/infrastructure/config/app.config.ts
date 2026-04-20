import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'tenant_admin',
    password: process.env.DB_PASSWORD || 'tenant_secret',
    name: process.env.DB_NAME || 'tenant_platform',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  nodeEnv: process.env.NODE_ENV || 'development',
}));
