import { Queue } from 'bullmq';
import mongoose from 'mongoose';
import Job from '../models/Job.js';
import Lead from '../models/Lead.js';
import createRedisConnection from '../config/redis.js';

const connection = createRedisConnection();
const scrapeQueue = new Queue('scrape', { connection });
const ACTIVE_STATUSES = new Set(['running', 'enriching', 'scoring']);

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

export const deleteJobs = async (userId, ids = []) => {
  const validIds = [...new Set(
    ids
      .filter(id => typeof id === 'string')
      .filter(id => mongoose.Types.ObjectId.isValid(id))
  )];

  if (validIds.length === 0) {
    return {
      deletedJobs: 0,
      deletedLeads: 0,
      skippedActive: 0,
      skippedNotFound: 0,
      skippedInvalid: ids.length,
      deletedJobIds: [],
    };
  }

  const jobs = await Job.find({
    _id: { $in: validIds },
    userId,
  }).select('_id status bullJobId');

  const deletableJobs = jobs.filter(job => !ACTIVE_STATUSES.has(job.status));
  const activeJobs = jobs.filter(job => ACTIVE_STATUSES.has(job.status));
  const deletableIds = deletableJobs.map(job => job._id);

  for (const job of deletableJobs) {
    if (job.status === 'pending' && job.bullJobId) {
      const queuedJob = await scrapeQueue.getJob(job.bullJobId);
      if (queuedJob) {
        try {
          await queuedJob.remove();
        } catch (_) {
          // Ignore queue remove errors so DB cleanup can continue.
        }
      }
    }
  }

  let deletedLeads = 0;
  let deletedJobs = 0;

  if (deletableIds.length > 0) {
    const [leadDeleteResult, jobDeleteResult] = await Promise.all([
      Lead.deleteMany({ userId, jobId: { $in: deletableIds } }),
      Job.deleteMany({ userId, _id: { $in: deletableIds } }),
    ]);
    deletedLeads = leadDeleteResult.deletedCount || 0;
    deletedJobs = jobDeleteResult.deletedCount || 0;
  }

  const foundIdSet = new Set(jobs.map(job => job._id.toString()));
  const skippedNotFound = validIds.filter(id => !foundIdSet.has(id)).length;

  return {
    deletedJobs,
    deletedLeads,
    skippedActive: activeJobs.length,
    skippedNotFound,
    skippedInvalid: ids.length - validIds.length,
    deletedJobIds: deletableIds.map(id => id.toString()),
  };
};
