import { Router } from 'express';
import {
  getDashboard,
  getCampaignAnalytics,
  getROI,
  getInsights,
  exportReport,
} from '../controllers/analytics.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/dashboard', getDashboard);
router.get('/campaigns/:id', getCampaignAnalytics);
router.get('/roi', getROI);
router.get('/insights', getInsights);
router.get('/export', exportReport);

export default router;
