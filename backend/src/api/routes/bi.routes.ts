import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { biService } from '../../services/bi/bi.service';

const router = Router();
router.use(requireAuth);

router.get('/report', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = Math.min(Number(req.query.days ?? 30), 90);
    const data = await biService.getReport(req.user!.id, days);
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

export default router;
