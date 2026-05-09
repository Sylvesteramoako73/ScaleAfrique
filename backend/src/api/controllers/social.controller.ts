import { Request, Response, NextFunction } from 'express';
import { socialService } from '../../services/social/social.service';

const ws = (req: Request) => (req.query.workspaceId as string) || req.user!.id;

export const socialController = {
  async getKeywords(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await socialService.getKeywords(ws(req)) }); } catch (e) { next(e); }
  },
  async addKeyword(req: Request, res: Response, next: NextFunction) {
    try {
      const kw = await socialService.addKeyword(ws(req), req.body.keyword);
      res.status(201).json({ success: true, data: kw });
    } catch (e) { next(e); }
  },
  async removeKeyword(req: Request, res: Response, next: NextFunction) {
    try { await socialService.removeKeyword(ws(req), req.params.id); res.json({ success: true }); } catch (e) { next(e); }
  },
  async getMentions(req: Request, res: Response, next: NextFunction) {
    try {
      const mentions = await socialService.getMentions(ws(req), req.query.keyword as string, req.query.sentiment as string);
      res.json({ success: true, data: mentions });
    } catch (e) { next(e); }
  },
  async getStats(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await socialService.getStats(ws(req)) }); } catch (e) { next(e); }
  },
  async refresh(req: Request, res: Response, next: NextFunction) {
    try { const count = await socialService.refreshMentions(ws(req)); res.json({ success: true, data: { added: count } }); } catch (e) { next(e); }
  },
};
