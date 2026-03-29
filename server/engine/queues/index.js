import { Queue } from 'bullmq';
import createRedisConnection from '../../src/config/redis.js';

const connection = createRedisConnection();

export const scrapeQueue = new Queue('scrape', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 100 },
  },
});

export const enrichQueue = new Queue('enrich', {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 100 },
  },
});

export const scoreQueue = new Queue('score', {
  connection,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 100 },
  },
});

console.log('📬 BullMQ queues initialized: scrape, enrich, score');
