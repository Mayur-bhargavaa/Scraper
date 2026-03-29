import Campaign from '../models/Campaign.js';
import Lead from '../models/Lead.js';

export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ campaigns });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
};

export const createCampaign = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const campaign = new Campaign({
      name,
      description,
      createdBy: req.user._id,
    });

    await campaign.save();
    res.status(201).json({ campaign });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create campaign' });
  }
};

export const updateCampaign = async (req, res) => {
  try {
    const { name, description } = req.body;
    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { name, description },
      { new: true }
    );

    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json({ campaign });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update campaign' });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const campaign = await Campaign.findOneAndDelete({ _id: campaignId, createdBy: req.user._id });

    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    // Remove campaign association from leads (don't delete leads, just un-associate)
    await Lead.updateMany({ campaignId }, { $unset: { campaignId: "" } });

    res.json({ message: 'Campaign deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
};

export const getCampaignLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ campaignId: req.params.id, createdBy: req.user._id });
    res.json({ leads });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch campaign leads' });
  }
};
