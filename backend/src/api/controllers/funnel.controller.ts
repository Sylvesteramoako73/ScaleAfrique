import { Request, Response, NextFunction } from 'express';
import { funnelService } from '../../services/funnel/funnel.service';
import { AppError } from '../middleware/errorHandler';

function wsId(req: Request): string {
  return (req.query.workspaceId as string) || req.user!.id;
}

export const funnelController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const funnels = await funnelService.list(wsId(req));
      res.json({ success: true, data: funnels });
    } catch (e) { next(e); }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const funnel = await funnelService.get(req.params.id, wsId(req));
      if (!funnel) throw new AppError('Funnel not found', 404);
      res.json({ success: true, data: funnel });
    } catch (e) { next(e); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;
      if (!name) throw new AppError('Name is required', 400);
      const funnel = await funnelService.create(wsId(req), name, description);
      res.status(201).json({ success: true, data: funnel });
    } catch (e) { next(e); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const funnel = await funnelService.update(req.params.id, wsId(req), req.body);
      res.json({ success: true, data: funnel });
    } catch (e) { next(e); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await funnelService.delete(req.params.id, wsId(req));
      res.json({ success: true });
    } catch (e) { next(e); }
  },

  async upsertPage(req: Request, res: Response, next: NextFunction) {
    try {
      const pageId = req.params.pageId ?? null;
      const page = await funnelService.upsertPage(req.params.id, wsId(req), pageId, req.body);
      res.json({ success: true, data: page });
    } catch (e) { next(e); }
  },

  async deletePage(req: Request, res: Response, next: NextFunction) {
    try {
      await funnelService.deletePage(req.params.id, wsId(req), req.params.pageId);
      res.json({ success: true });
    } catch (e) { next(e); }
  },

  async publish(req: Request, res: Response, next: NextFunction) {
    try {
      const funnel = await funnelService.publish(req.params.id, wsId(req));
      res.json({ success: true, data: funnel });
    } catch (e) { next(e); }
  },

  async unpublish(req: Request, res: Response, next: NextFunction) {
    try {
      const funnel = await funnelService.unpublish(req.params.id, wsId(req));
      res.json({ success: true, data: funnel });
    } catch (e) { next(e); }
  },

  async getSubmissions(req: Request, res: Response, next: NextFunction) {
    try {
      const submissions = await funnelService.getSubmissions(req.params.id, wsId(req));
      res.json({ success: true, data: submissions });
    } catch (e) { next(e); }
  },

  // Public endpoints (no auth)
  async getPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const funnel = await funnelService.getBySlug(req.params.slug);
      if (!funnel) throw new AppError('Funnel not found', 404);
      res.json({ success: true, data: funnel });
    } catch (e) { next(e); }
  },

  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = req.ip ?? req.socket.remoteAddress;
      const result = await funnelService.submit(req.params.slug, req.body.pageId, req.body.data, ip);
      res.json({ success: true, data: result });
    } catch (e) { next(e); }
  },
};
