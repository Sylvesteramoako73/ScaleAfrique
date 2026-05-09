import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { listAutomations, getAutomation, createAutomation, updateAutomation, deleteAutomation, toggleAutomation } from '../controllers/automation.controller';

const router = Router();
router.use(requireAuth);

router.get('/', listAutomations);
router.get('/:id', getAutomation);
router.post('/', createAutomation);
router.put('/:id', updateAutomation);
router.delete('/:id', deleteAutomation);
router.post('/:id/toggle', toggleAutomation);

export default router;
