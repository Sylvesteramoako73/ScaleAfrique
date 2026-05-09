import { Request, Response, NextFunction } from 'express';
import { affiliateService } from '../../services/affiliate/affiliate.service';
import { AppError } from '../middleware/errorHandler';

const ws = (req: Request) => (req.query.workspaceId as string) || req.user!.id;

export const affiliateController = {
  async listPrograms(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await affiliateService.listPrograms(ws(req)) }); } catch (e) { next(e); }
  },
  async createProgram(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body.name) throw new AppError('name required', 400);
      res.status(201).json({ success: true, data: await affiliateService.createProgram(ws(req), req.body) });
    } catch (e) { next(e); }
  },
  async updateProgram(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await affiliateService.updateProgram(req.params.id, ws(req), req.body) }); } catch (e) { next(e); }
  },
  async deleteProgram(req: Request, res: Response, next: NextFunction) {
    try { await affiliateService.deleteProgram(req.params.id, ws(req)); res.json({ success: true }); } catch (e) { next(e); }
  },
  async listAffiliates(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await affiliateService.listAffiliates(req.params.id, ws(req)) }); } catch (e) { next(e); }
  },
  async addAffiliate(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body.name || !req.body.email) throw new AppError('name and email required', 400);
      res.status(201).json({ success: true, data: await affiliateService.addAffiliate(req.params.id, ws(req), req.body) });
    } catch (e) { next(e); }
  },
  async getStats(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await affiliateService.getProgramStats(req.params.id, ws(req)) }); } catch (e) { next(e); }
  },
  async trackClick(req: Request, res: Response, next: NextFunction) {
    try { await affiliateService.recordClick(req.params.code); res.json({ success: true }); } catch (e) { next(e); }
  },
};
