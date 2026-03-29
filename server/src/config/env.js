import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/stitchbyte',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    username: process.env.REDIS_USERNAME || undefined,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'stitchbyte-dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  google: {
    placesApiKey: process.env.GOOGLE_PLACES_API_KEY || '',
  },
  proxy: {
    enabled: process.env.PROXY_ENABLED === 'true',
    provider: process.env.PROXY_PROVIDER || 'brightdata',
    host: process.env.PROXY_HOST || '',
    port: process.env.PROXY_PORT || '',
    username: process.env.PROXY_USERNAME || '',
    password: process.env.PROXY_PASSWORD || '',
  },
  captcha: {
    enabled: process.env.CAPTCHA_ENABLED === 'true',
    provider: process.env.CAPTCHA_PROVIDER || '2captcha',
    apiKey: process.env.CAPTCHA_API_KEY || '',
  },
  scraper: {
    maxConcurrency: parseInt(process.env.SCRAPER_MAX_CONCURRENCY || '3'),
    minDelay: parseInt(process.env.SCRAPER_MIN_DELAY || '2000'),
    maxDelay: parseInt(process.env.SCRAPER_MAX_DELAY || '7000'),
    headless: process.env.SCRAPER_HEADLESS !== 'false',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};

export default env;
