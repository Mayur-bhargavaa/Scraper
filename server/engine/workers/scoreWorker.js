import { Worker } from 'bullmq';
import createRedisConnection from '../../src/config/redis.js';
import { scoreLead } from '../utils/leadScorer.js';
import Lead from '../../src/models/Lead.js';
import Job from '../../src/models/Job.js';

const connection = createRedisConnection();

const scoreWorker = new Worker('score', async (bullJob) => {
  const { jobId, userId, leadIds } = bullJob.data;

  console.log(`📊 Scoring started for job ${jobId}: ${leadIds.length} leads`);

  const io = globalThis.__io;

  for (let i = 0; i < leadIds.length; i++) {
    try {
      const lead = await Lead.findById(leadIds[i]);
      if (!lead || lead.scored) continue;

      const { score, tags } = scoreLead(lead);

      lead.score = score;
      lead.tags = tags;
      lead.scored = true;
      await lead.save();

    } catch (error) {
      console.warn(`Scoring failed for lead ${leadIds[i]}:`, error.message);
      continue;
    }
  }

  // Mark job as completed
  await Job.findByIdAndUpdate(jobId, {
    status: 'completed',
    completedAt: new Date(),
  });

  if (io) {
    io.to(`job:${jobId}`).emit('job:completed', {
      jobId,
      message: 'All processing complete!',
    });
    io.to(`user:${userId}`).emit('job:update', {
      jobId,
      status: 'completed',
      message: 'Job completed successfully',
    });
  }

  return { scored: leadIds.length };
}, {
  connection,
  concurrency: 3,
});

scoreWorker.on('completed', (job) => {
  console.log(`✅ Score job completed: ${job.id}`);
});

scoreWorker.on('failed', (job, err) => {
  console.error(`❌ Score job failed: ${job?.id}`, err.message);
});

console.log('🔧 Score worker initialized');
export default scoreWorker;
