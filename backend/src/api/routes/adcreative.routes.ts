import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { adCreativeController } from '../controllers/adcreative.controller';
const r = Router();
r.use(requireAuth);
r.get('/', adCreativeController.list);
r.post('/generate', adCreativeController.generate);
r.delete('/:id', adCreativeController.delete);
export default r;
