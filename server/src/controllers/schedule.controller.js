import SearchPreset from '../models/SearchPreset.js';
import * as jobService from '../services/job.service.js';

export const createSchedule = async (req, res) => {
  try {
    const { name, keyword, location, radius, mode, schedule } = req.body;
    if (!name || !keyword || !location) {
      return res.status(400).json({ error: 'Name, keyword, and location are required' });
    }

    let cronExpression = '';
    if (schedule === 'daily') cronExpression = '0 6 * * *'; // 6 AM daily
    if (schedule === 'weekly') cronExpression = '0 6 * * 1'; // 6 AM Monday

    const preset = new SearchPreset({
      userId: req.user._id,
      name,
      keyword,
      location,
      radius,
      mode,
      schedule: schedule || 'none',
      cronExpression,
    });
    await preset.save();

    res.status(201).json({ schedule: preset });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSchedules = async (req, res) => {
  try {
    const schedules = await SearchPreset.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ schedules });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSchedule = async (req, res) => {
  try {
    const preset = await SearchPreset.findOne({ _id: req.params.id, userId: req.user._id });
    if (!preset) return res.status(404).json({ error: 'Schedule not found' });

    const { name, keyword, location, radius, mode, schedule, isActive } = req.body;
    if (name) preset.name = name;
    if (keyword) preset.keyword = keyword;
    if (location) preset.location = location;
    if (radius) preset.radius = radius;
    if (mode) preset.mode = mode;
    if (typeof isActive === 'boolean') preset.isActive = isActive;
    if (schedule) {
      preset.schedule = schedule;
      if (schedule === 'daily') preset.cronExpression = '0 6 * * *';
      else if (schedule === 'weekly') preset.cronExpression = '0 6 * * 1';
      else preset.cronExpression = '';
    }

    await preset.save();
    res.json({ schedule: preset });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSchedule = async (req, res) => {
  try {
    const preset = await SearchPreset.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!preset) return res.status(404).json({ error: 'Schedule not found' });
    res.json({ message: 'Schedule deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const runScheduleNow = async (req, res) => {
  try {
    const preset = await SearchPreset.findOne({ _id: req.params.id, userId: req.user._id });
    if (!preset) return res.status(404).json({ error: 'Schedule not found' });

    const job = await jobService.createJob({
      userId: req.user._id,
      keyword: preset.keyword,
      location: preset.location,
      radius: preset.radius,
      mode: preset.mode,
    });

    preset.lastRunAt = new Date();
    await preset.save();

    res.status(201).json({ job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
