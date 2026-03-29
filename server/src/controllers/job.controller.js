import * as jobService from '../services/job.service.js';

export const createJob = async (req, res) => {
  try {
    const { keyword, location, radius, mode, campaignId } = req.body;
    if (!keyword || !location) {
      return res.status(400).json({ error: 'Keyword and location are required' });
    }
    const job = await jobService.createJob({
      userId: req.user._id,
      keyword,
      location,
      radius,
      mode,
      campaignId,
    });
    res.status(201).json({ job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getJobs = async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const result = await jobService.getUserJobs(req.user._id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      status,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getJob = async (req, res) => {
  try {
    const job = await jobService.getJobById(req.params.id, req.user._id);
    res.json({ job });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
