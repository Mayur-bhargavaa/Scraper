import { Worker } from 'bullmq';
import createRedisConnection from '../../src/config/redis.js';
import { extractEmails } from '../scrapers/emailScraper.js';
import { extractSocialLinks } from '../scrapers/linkScraper.js';
import { scoreQueue } from '../queues/index.js';
import Lead from '../../src/models/Lead.js';
import Job from '../../src/models/Job.js';

const connection = createRedisConnection();

const enrichWorker = new Worker('enrich', async (bullJob) => {
  const { jobId, userId, leadIds } = bullJob.data;

  console.log(`📧 Enrichment started for job ${jobId}: ${leadIds.length} leads`);

  const io = globalThis.__io;
  let enrichedCount = 0;

  for (let i = 0; i < leadIds.length; i++) {
    try {
      const lead = await Lead.findById(leadIds[i]);
      if (!lead || lead.emailEnriched) continue;

      if (lead.website) {
        const [email, socials] = await Promise.all([
          extractEmails(lead.website),
          extractSocialLinks(lead.website)
        ]);

        if (email) {
          lead.email = email;
          enrichedCount++;
        }

        if (socials) {
          lead.facebook = socials.facebook || '';
          lead.instagram = socials.instagram || '';
          lead.twitter = socials.twitter || '';
          lead.linkedin = socials.linkedin || '';
        }
      }

      lead.emailEnriched = true;
      await lead.save();

      // Progress update
      if (io) {
        io.to(`job:${jobId}`).emit('job:progress', {
          jobId,
          message: `Enriching emails... (${i + 1}/${leadIds.length})`,
          enriched: enrichedCount,
          processed: i + 1,
          total: leadIds.length,
        });
      }

      bullJob.updateProgress({ enriched: enrichedCount, processed: i + 1, total: leadIds.length });

      // Rate limit email scraping
      await new Promise(r => setTimeout(r, Math.floor(Math.random() * 1500) + 500));

    } catch (error) {
      console.warn(`Email enrichment failed for lead ${leadIds[i]}:`, error.message);
      continue;
    }
  }

  // Update job
  await Job.findByIdAndUpdate(jobId, {
    status: 'scoring',
    totalEnriched: enrichedCount,
  });

  // Queue scoring
  await scoreQueue.add('score-leads', { jobId, userId, leadIds });

  if (io) {
    io.to(`job:${jobId}`).emit('job:progress', {
      jobId,
      message: `Enrichment complete. ${enrichedCount} emails found. Scoring leads...`,
    });
  }

  return { enriched: enrichedCount, total: leadIds.length };
}, {
  connection,
  concurrency: 2,
});

enrichWorker.on('completed', (job) => {
  const { enriched = 0, total = 0 } = job.returnvalue || {};
  console.log(`✅ Enrich job completed for ${job.data?.jobId}: ${enriched}/${total} enriched (queue job ${job.id})`);
});

enrichWorker.on('failed', (job, err) => {
  console.error(`❌ Enrich job failed: ${job?.id}`, err.message);
});

console.log('🔧 Enrich worker initialized');
export default enrichWorker;
