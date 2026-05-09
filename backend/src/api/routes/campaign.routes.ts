import { Router } from 'express';
import {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  launchCampaign,
  pauseCampaign,
  duplicateCampaign,
  getCampaignAnalytics,
  getTemplates,
} from '../controllers/campaign.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/templates', getTemplates);
router.get('/', getCampaigns);
router.post('/', createCampaign);
router.get('/:id', getCampaign);
router.put('/:id', updateCampaign);
router.delete('/:id', deleteCampaign);
router.post('/:id/launch', launchCampaign);
router.post('/:id/pause', pauseCampaign);
router.post('/:id/duplicate', duplicateCampaign);
router.get('/:id/analytics', getCampaignAnalytics);

export default router;
