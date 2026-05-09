import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { affiliateController } from '../controllers/affiliate.controller';
const r = Router();
r.use(requireAuth);
r.get('/', affiliateController.listPrograms);
r.post('/', affiliateController.createProgram);
r.put('/:id', affiliateController.updateProgram);
r.delete('/:id', affiliateController.deleteProgram);
r.get('/:id/affiliates', affiliateController.listAffiliates);
r.post('/:id/affiliates', affiliateController.addAffiliate);
r.get('/:id/stats', affiliateController.getStats);
// Public click tracking
r.get('/track/:code', affiliateController.trackClick);
export default r;
