import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getReflections, upsertReflection, deleteReflection,
  getDailyGoals, upsertDailyGoals,
  getWeeklyReport, saveWeeklyReport,
} from '../controllers/dataController.js';

const router = Router();

router.use(authMiddleware);

router.get('/reflections',          getReflections);
router.post('/reflections',         upsertReflection);
router.delete('/reflections/:id',   deleteReflection);

router.get('/daily-goals',          getDailyGoals);
router.post('/daily-goals',         upsertDailyGoals);

router.get('/weekly-report',        getWeeklyReport);
router.post('/weekly-report',       saveWeeklyReport);

export default router;
