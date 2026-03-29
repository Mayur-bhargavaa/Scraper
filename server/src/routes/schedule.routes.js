import { Router } from 'express';
import {
  createSchedule, getSchedules, updateSchedule,
  deleteSchedule, runScheduleNow,
} from '../controllers/schedule.controller.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);
router.post('/', createSchedule);
router.get('/', getSchedules);
router.put('/:id', updateSchedule);
router.delete('/:id', deleteSchedule);
router.post('/:id/run', runScheduleNow);

export default router;
