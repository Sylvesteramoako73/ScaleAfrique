import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { funnelController } from '../controllers/funnel.controller';

const router = Router();

router.use(requireAuth);
router.get('/', funnelController.list);
router.post('/', funnelController.create);
router.get('/:id', funnelController.get);
router.put('/:id', funnelController.update);
router.delete('/:id', funnelController.delete);
router.post('/:id/publish', funnelController.publish);
router.post('/:id/unpublish', funnelController.unpublish);
router.get('/:id/submissions', funnelController.getSubmissions);
router.post('/:id/pages', funnelController.upsertPage);
router.put('/:id/pages/:pageId', funnelController.upsertPage);
router.delete('/:id/pages/:pageId', funnelController.deletePage);

export default router;
