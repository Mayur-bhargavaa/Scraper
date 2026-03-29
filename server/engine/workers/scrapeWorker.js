import { Worker } from 'bullmq';
import createRedisConnection from '../../src/config/redis.js';
import { scrapeGoogleMaps } from '../scrapers/googleMaps.js';
import { searchPlaces } from '../scrapers/placesApi.js';
import { deduplicateLeads } from '../utils/deduplicator.js';
import { enrichQueue } from '../queues/index.js';
import Lead from '../../src/models/Lead.js';
import Job from '../../src/models/Job.js';
import env from '../../src/config/env.js';

const connection = createRedisConnection();

const scrapeWorker = new Worker('scrape', async (bullJob) => {
  const { jobId, userId, campaignId, keyword, location, radius, mode } = bullJob.data;

  console.log(`🔍 Scraping job started: "${keyword}" in "${location}" (mode: ${mode}${campaignId ? ', campaign: ' + campaignId : ''})`);

  // Update job status
  await Job.findByIdAndUpdate(jobId, { status: 'running' });

  const io = globalThis.__io;

  const onProgress = ({ message, found, processed }) => {
    // Emit real-time progress via WebSocket
    if (io) {
      io.to(`job:${jobId}`).emit('job:progress', { jobId, message, found, processed });
      io.to(`user:${userId}`).emit('job:update', { jobId, status: 'running', message, found, processed });
    }

    // Update BullMQ progress
    bullJob.updateProgress({ found, processed, message });
  };

  try {
    // Run scraper based on mode
    let rawLeads;
    if (mode === 'api') {
      rawLeads = await searchPlaces({ keyword, location, radius, onProgress });
    } else {
      rawLeads = await scrapeGoogleMaps({ keyword, location, radius, onProgress });
    }

    // Deduplicate
    onProgress({ message: 'Removing duplicates...', found: rawLeads.length, processed: rawLeads.length });
    const { unique, duplicateCount } = await deduplicateLeads(rawLeads, userId);

    // Save unique leads to database
    const savedLeads = [];
    for (const leadData of unique) {
      const lead = new Lead({
        ...leadData,
        jobId,
        campaignId,
        userId,
      });
      await lead.save();
      savedLeads.push(lead);
    }

    // Update job with results
    await Job.findByIdAndUpdate(jobId, {
      status: 'enriching',
      totalFound: rawLeads.length,
      totalProcessed: unique.length,
      totalDuplicates: duplicateCount,
    });

    // Queue enrichment job
    await enrichQueue.add('enrich-leads', {
      jobId,
      userId,
      leadIds: savedLeads.map(l => l._id.toString()),
    });

    onProgress({
      message: `Scraping complete. ${unique.length} unique leads saved. ${duplicateCount} duplicates removed. Starting enrichment...`,
      found: rawLeads.length,
      processed: unique.length,
    });

    return { totalFound: rawLeads.length, unique: unique.length, duplicates: duplicateCount };

  } catch (error) {
    console.error(`Scraping job failed (${jobId}):`, error.message);

    await Job.findByIdAndUpdate(jobId, {
      status: 'failed',
      errorMessage: error.message,
    });

    if (io) {
      io.to(`job:${jobId}`).emit('job:failed', { jobId, error: error.message });
      io.to(`user:${userId}`).emit('job:update', { jobId, status: 'failed', error: error.message });
    }

    throw error;
  }
}, {
  connection,
  concurrency: env.scraper.maxConcurrency,
  limiter: {
    max: 5,
    duration: 60000, // Max 5 jobs per minute
  },
});

scrapeWorker.on('completed', (job) => {
  console.log(`✅ Scrape job completed: ${job.id}`);
});

scrapeWorker.on('failed', (job, err) => {
  console.error(`❌ Scrape job failed: ${job?.id}`, err.message);
});

console.log('🔧 Scrape worker initialized');
export default scrapeWorker;
