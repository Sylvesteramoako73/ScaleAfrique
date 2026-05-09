import { Request, Response, NextFunction } from 'express';
import { chatbotService } from '../../services/chatbot/chatbot.service';
import { AppError } from '../middleware/errorHandler';

function wsId(req: Request): string {
  return (req.query.workspaceId as string) || req.user!.id;
}

export const chatbotController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ success: true, data: await chatbotService.list(wsId(req)) });
    } catch (e) { next(e); }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const bot = await chatbotService.get(req.params.id, wsId(req));
      if (!bot) throw new AppError('Not found', 404);
      res.json({ success: true, data: bot });
    } catch (e) { next(e); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, persona, greeting, systemPrompt, primaryColor } = req.body;
      if (!name || !systemPrompt) throw new AppError('name and systemPrompt are required', 400);
      const bot = await chatbotService.create(wsId(req), { name, persona, greeting, systemPrompt, primaryColor });
      res.status(201).json({ success: true, data: bot });
    } catch (e) { next(e); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const bot = await chatbotService.update(req.params.id, wsId(req), req.body);
      res.json({ success: true, data: bot });
    } catch (e) { next(e); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await chatbotService.delete(req.params.id, wsId(req));
      res.json({ success: true });
    } catch (e) { next(e); }
  },

  async getSessions(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ success: true, data: await chatbotService.getSessions(req.params.id, wsId(req)) });
    } catch (e) { next(e); }
  },

  // Public endpoints
  async getPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const bot = await chatbotService.getPublic(req.params.id);
      if (!bot) throw new AppError('Not found', 404);
      res.json({ success: true, data: bot });
    } catch (e) { next(e); }
  },

  async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { visitorId, message } = req.body;
      if (!message?.trim()) throw new AppError('message is required', 400);
      const vid = visitorId || req.ip || 'anonymous';
      const result = await chatbotService.chat(req.params.id, vid, message);
      res.json({ success: true, data: result });
    } catch (e) { next(e); }
  },

  async chatStream(req: Request, res: Response, next: NextFunction) {
    try {
      const { visitorId, message } = req.body;
      if (!message?.trim()) throw new AppError('message is required', 400);
      const vid = visitorId || req.ip || 'anonymous';
      await chatbotService.chatStream(req.params.id, vid, message, res);
    } catch (e) { next(e); }
  },
};
