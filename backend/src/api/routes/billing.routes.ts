import { Router } from 'express';
import { getPlans, getMySubscription, startTrial, upgradePlan, cancelSubscription } from '../controllers/billing.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.get('/plans', getPlans);
router.use(requireAuth);
router.get('/subscription', getMySubscription);
router.post('/trial', startTrial);
router.post('/upgrade', upgradePlan);
router.post('/cancel', cancelSubscription);

export default router;
