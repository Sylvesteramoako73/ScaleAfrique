import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optionalEnv(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

export const config = {
  app: {
    env: optionalEnv('NODE_ENV', 'development'),
    port: parseInt(optionalEnv('PORT', '5000'), 10),
    frontendUrl: optionalEnv('FRONTEND_URL', 'http://localhost:3000'),
    isDev: optionalEnv('NODE_ENV', 'development') === 'development',
  },
  db: {
    url: requireEnv('DATABASE_URL'),
  },
  redis: {
    url: optionalEnv('REDIS_URL', 'redis://localhost:6379'),
  },
  jwt: {
    secret: requireEnv('JWT_SECRET'),
    expiresIn: optionalEnv('JWT_EXPIRES_IN', '7d'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    refreshExpiresIn: optionalEnv('JWT_REFRESH_EXPIRES_IN', '30d'),
  },
  anthropic: {
    apiKey: optionalEnv('ANTHROPIC_API_KEY'),
  },
  google: {
    clientId: optionalEnv('GOOGLE_CLIENT_ID'),
    clientSecret: optionalEnv('GOOGLE_CLIENT_SECRET'),
  },
  smtp: {
    host: optionalEnv('SMTP_HOST', 'smtp.gmail.com'),
    port: parseInt(optionalEnv('SMTP_PORT', '587'), 10),
    user: optionalEnv('SMTP_USER'),
    pass: optionalEnv('SMTP_PASS'),
    from: optionalEnv('EMAIL_FROM', 'ScaleAfrique <noreply@scaleafrique.com>'),
  },
  twitter: {
    apiKey: optionalEnv('TWITTER_API_KEY'),
    apiSecret: optionalEnv('TWITTER_API_SECRET'),
  },
  facebook: {
    appId: optionalEnv('FACEBOOK_APP_ID'),
    appSecret: optionalEnv('FACEBOOK_APP_SECRET'),
  },
  aws: {
    accessKeyId: optionalEnv('AWS_ACCESS_KEY_ID'),
    secretAccessKey: optionalEnv('AWS_SECRET_ACCESS_KEY'),
    region: optionalEnv('AWS_REGION', 'af-south-1'),
    s3Bucket: optionalEnv('AWS_S3_BUCKET', 'scaleafrique-uploads'),
  },
  encryption: {
    key: optionalEnv('ENCRYPTION_KEY', '00000000000000000000000000000000'),
  },
  rateLimit: {
    windowMs: parseInt(optionalEnv('RATE_LIMIT_WINDOW_MS', '900000'), 10),
    max: parseInt(optionalEnv('RATE_LIMIT_MAX', '100'), 10),
  },
} as const;

export type Config = typeof config;
