import IORedis from 'ioredis';
import env from './env.js';

const createRedisConnection = () => {
  const connection = new IORedis({
    host: env.redis.host,
    port: env.redis.port,
    username: env.redis.username,
    password: env.redis.password || undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  connection.on('connect', () => {
    console.log('✅ Redis connected');
  });

  connection.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
  });

  return connection;
};

export default createRedisConnection;
