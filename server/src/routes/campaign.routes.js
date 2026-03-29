import express from 'express';
import { getCampaigns, createCampaign, updateCampaign, deleteCampaign, getCampaignLeads } from '../controllers/campaign.controller.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.use(auth); // Ensure all routes are protected

router.get('/', getCampaigns);
router.post('/', createCampaign);
router.put('/:id', updateCampaign);
router.delete('/:id', deleteCampaign);
router.get('/:id/leads', getCampaignLeads);

export default router;
