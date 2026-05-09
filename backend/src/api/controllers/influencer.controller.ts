import { Request, Response, NextFunction } from 'express';
import { influencerService } from '../../services/influencer/influencer.service';

const ws = (req: Request) => (req.query.workspaceId as string) || req.user!.id;

export const influencerController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { platform, country, category, minFollowers } = req.query;
      res.json({ success: true, data: await influencerService.list({ platform: platform as string, country: country as string, category: category as string, minFollowers: minFollowers ? Number(minFollowers) : undefined }) });
    } catch (e) { next(e); }
  },
  async listRequests(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await influencerService.listRequests(ws(req)) }); } catch (e) { next(e); }
  },
  async createRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await influencerService.createRequest(ws(req), req.body);
      res.status(201).json({ success: true, data: r });
    } catch (e) { next(e); }
  },
  async updateRequestStatus(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await influencerService.updateRequestStatus(req.params.id, ws(req), req.body.status) }); } catch (e) { next(e); }
  },
};
