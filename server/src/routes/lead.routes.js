import { Router } from 'express';
import { getLeads, getLeadStats, deleteLead, deleteLeads } from '../controllers/lead.controller.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);
router.get('/', getLeads);
router.get('/stats', getLeadStats);
router.delete('/', deleteLeads);
router.delete('/:id', deleteLead);

export default router;
