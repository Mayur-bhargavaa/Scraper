import cron from 'node-cron';
import SearchPreset from '../models/SearchPreset.js';
import * as jobService from './job.service.js';

const scheduledTasks = new Map();

export const initScheduler = async () => {
  try {
    const presets = await SearchPreset.find({ isActive: true, schedule: { $ne: 'none' } });

    for (const preset of presets) {
      schedulePreset(preset);
    }

    console.log(`⏰ Scheduler initialized with ${presets.length} active presets`);
  } catch (error) {
    console.error('Scheduler init error:', error.message);
  }
};

export const schedulePreset = (preset) => {
  // Cancel existing if any
  if (scheduledTasks.has(preset._id.toString())) {
    scheduledTasks.get(preset._id.toString()).stop();
  }

  if (!preset.cronExpression || preset.schedule === 'none' || !preset.isActive) {
    return;
  }

  const task = cron.schedule(preset.cronExpression, async () => {
    console.log(`⏰ Running scheduled job: ${preset.name}`);
    try {
      await jobService.createJob({
        userId: preset.userId,
        keyword: preset.keyword,
        location: preset.location,
        radius: preset.radius,
        mode: preset.mode,
      });

      preset.lastRunAt = new Date();
      await preset.save();
    } catch (error) {
      console.error(`Scheduled job failed: ${preset.name}`, error.message);
    }
  });

  scheduledTasks.set(preset._id.toString(), task);
};

export const cancelSchedule = (presetId) => {
  if (scheduledTasks.has(presetId)) {
    scheduledTasks.get(presetId).stop();
    scheduledTasks.delete(presetId);
  }
};
