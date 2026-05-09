import { Request, Response, NextFunction } from 'express';
import { coursesService } from '../../services/courses/courses.service';
import { AppError } from '../middleware/errorHandler';

const ws = (req: Request) => (req.query.workspaceId as string) || req.user!.id;

export const coursesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await coursesService.list(ws(req)) }); } catch (e) { next(e); }
  },
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const c = await coursesService.get(req.params.id, ws(req));
      if (!c) throw new AppError('Not found', 404);
      res.json({ success: true, data: c });
    } catch (e) { next(e); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body.title) throw new AppError('title required', 400);
      res.status(201).json({ success: true, data: await coursesService.create(ws(req), req.body) });
    } catch (e) { next(e); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await coursesService.update(req.params.id, ws(req), req.body) }); } catch (e) { next(e); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try { await coursesService.delete(req.params.id, ws(req)); res.json({ success: true }); } catch (e) { next(e); }
  },
  async addLesson(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body.title) throw new AppError('title required', 400);
      res.status(201).json({ success: true, data: await coursesService.addLesson(req.params.id, ws(req), req.body) });
    } catch (e) { next(e); }
  },
  async updateLesson(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await coursesService.updateLesson(req.params.lessonId, req.params.id, ws(req), req.body) }); } catch (e) { next(e); }
  },
  async deleteLesson(req: Request, res: Response, next: NextFunction) {
    try { await coursesService.deleteLesson(req.params.lessonId, req.params.id, ws(req)); res.json({ success: true }); } catch (e) { next(e); }
  },
  async enroll(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await coursesService.enroll(req.params.id, req.user!.id) }); } catch (e) { next(e); }
  },
};
