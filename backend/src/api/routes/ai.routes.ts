import { Router } from 'express';
import {
  chat,
  generateStrategy,
  getInsights,
  generateContent,
  optimizeCampaign,
  getCalendarOpportunities,
  getWeeklyDigest,
} from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(requireAuth);
router.use(aiLimiter);

router.post('/advisor/chat', chat);
router.post('/advisor/strategy', generateStrategy);
router.get('/advisor/insights', getInsights);
router.post('/content/generate', generateContent);
router.post('/campaigns/optimize', optimizeCampaign);
router.get('/calendar-opportunities', getCalendarOpportunities);
router.get('/weekly-digest', getWeeklyDigest);

export default router;
