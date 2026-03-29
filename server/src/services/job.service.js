import { Queue } from 'bullmq';
import Job from '../models/Job.js';
import createRedisConnection from '../config/redis.js';

const connection = createRedisConnection();
const scrapeQueue = new Queue('scrape', { connection });

export const createJob = async ({ userId, keyword, location, radius, mode, campaignId }) => {
  const job = new Job({
    userId,
    campaignId: campaignId || null,
    keyword,
    location,
    radius: radius || 10,
    mode: mode || 'scraper',
    status: 'pending',
  });
  await job.save();

  // Add to BullMQ queue
  const bullJob = await scrapeQueue.add('scrape-maps', {
    jobId: job._id.toString(),
    userId: userId.toString(),
    campaignId: campaignId || null,
    keyword,
    location,
    radius: radius || 10,
    mode: mode || 'scraper',
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  });

  job.bullJobId = bullJob.id;
  await job.save();

  return job;
};

export const getUserJobs = async (userId, { page = 1, limit = 20, status } = {}) => {
  const query = { userId };
  if (status) query.status = status;

  const total = await Job.countDocuments(query);
  const jobs = await Job.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { jobs, total, page, totalPages: Math.ceil(total / limit) };
};

export const getJobById = async (jobId, userId) => {
  const job = await Job.findOne({ _id: jobId, userId });
  if (!job) throw new Error('Job not found');
  return job;
};
