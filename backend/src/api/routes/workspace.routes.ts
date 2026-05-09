import { Router } from 'express';
import { listWorkspaces, createWorkspace, getWorkspace, inviteMember, removeMember } from '../controllers/workspace.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);
router.get('/', listWorkspaces);
router.post('/', createWorkspace);
router.get('/:id', getWorkspace);
router.post('/:id/members', inviteMember);
router.delete('/:id/members/:userId', removeMember);

export default router;
