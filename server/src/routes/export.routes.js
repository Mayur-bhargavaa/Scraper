import { Router } from 'express';
import { exportLeads } from '../controllers/export.controller.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);
router.get('/', exportLeads);

export default router;
