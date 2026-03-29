import Lead from '../models/Lead.js';

export const getLeads = async (req, res) => {
  try {
    const {
      page = 1, limit = 50, jobId, search, campaignId,
      tags, minScore, maxScore, minRating, maxRating,
      sortBy = 'createdAt', sortOrder = 'desc',
    } = req.query;

    const query = { userId: req.user._id };
    if (jobId) query.jobId = jobId;
    if (campaignId) query.campaignId = campaignId;
    if (tags) query.tags = { $in: tags.split(',') };
    if (minScore || maxScore) {
      query.score = {};
      if (minScore) query.score.$gte = parseInt(minScore);
      if (maxScore) query.score.$lte = parseInt(maxScore);
    }
    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = parseFloat(minRating);
      if (maxRating) query.rating.$lte = parseFloat(maxRating);
    }
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      leads,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLeadStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalLeads, withEmail, withWebsite, tagStats, avgScore] = await Promise.all([
      Lead.countDocuments({ userId }),
      Lead.countDocuments({ userId, email: { $ne: '' } }),
      Lead.countDocuments({ userId, website: { $ne: '' } }),
      Lead.aggregate([
        { $match: { userId } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        { $match: { userId } },
        { $group: { _id: null, avg: { $avg: '$score' } } },
      ]),
    ]);

    res.json({
      totalLeads,
      withEmail,
      withWebsite,
      tagStats: tagStats.reduce((acc, t) => ({ ...acc, [t._id]: t.count }), {}),
      avgScore: avgScore[0]?.avg || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json({ message: 'Lead deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteLeads = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'IDs must be an array' });

    const result = await Lead.deleteMany({
      _id: { $in: ids },
      userId: req.user._id
    });

    res.json({ message: `${result.deletedCount} leads deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
