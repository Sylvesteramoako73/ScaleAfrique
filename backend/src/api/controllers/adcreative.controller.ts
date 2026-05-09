import { Request, Response, NextFunction } from 'express';
import { adCreativeService } from '../../services/adcreative/adcreative.service';
import { AppError } from '../middleware/errorHandler';

const ws = (req: Request) => (req.query.workspaceId as string) || req.user!.id;

export const adCreativeController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await adCreativeService.list(ws(req)) }); } catch (e) { next(e); }
  },
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, platform, productName, productDescription, targetAudience, tone, count } = req.body;
      if (!name || !platform || !productName || !productDescription) throw new AppError('name, platform, productName, productDescription required', 400);
      const creative = await adCreativeService.generate(ws(req), { name, platform, productName, productDescription, targetAudience, tone, count });
      res.status(201).json({ success: true, data: creative });
    } catch (e) { next(e); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try { await adCreativeService.delete(req.params.id, ws(req)); res.json({ success: true }); } catch (e) { next(e); }
  },
};
