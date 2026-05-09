import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { chatbotController } from '../controllers/chatbot.controller';

const router = Router();

router.use(requireAuth);
router.get('/', chatbotController.list);
router.post('/', chatbotController.create);
router.get('/:id', chatbotController.get);
router.put('/:id', chatbotController.update);
router.delete('/:id', chatbotController.delete);
router.get('/:id/sessions', chatbotController.getSessions);

export default router;
