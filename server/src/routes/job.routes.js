import { Router } from 'express';
import { createJob, getJobs, getJob } from '../controllers/job.controller.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);
router.post('/', createJob);
router.get('/', getJobs);
router.get('/:id', getJob);

export default router;
