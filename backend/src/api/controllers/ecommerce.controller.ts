import { Request, Response, NextFunction } from 'express';
import { ecommerceService } from '../../services/ecommerce/ecommerce.service';
import { AppError } from '../middleware/errorHandler';

const ws = (req: Request) => (req.query.workspaceId as string) || req.user!.id;

export const ecommerceController = {
  async listProducts(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await ecommerceService.listProducts(ws(req)) }); } catch (e) { next(e); }
  },
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body.name || req.body.price === undefined) throw new AppError('name and price required', 400);
      const p = await ecommerceService.createProduct(ws(req), req.body);
      res.status(201).json({ success: true, data: p });
    } catch (e) { next(e); }
  },
  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await ecommerceService.updateProduct(req.params.id, ws(req), req.body) }); } catch (e) { next(e); }
  },
  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try { await ecommerceService.deleteProduct(req.params.id, ws(req)); res.json({ success: true }); } catch (e) { next(e); }
  },
  async listOrders(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await ecommerceService.listOrders(ws(req)) }); } catch (e) { next(e); }
  },
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const o = await ecommerceService.createOrder(ws(req), req.body);
      res.status(201).json({ success: true, data: o });
    } catch (e) { next(e); }
  },
  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await ecommerceService.updateOrderStatus(req.params.id, ws(req), req.body.status) }); } catch (e) { next(e); }
  },
  async getStats(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await ecommerceService.getDashboardStats(ws(req)) }); } catch (e) { next(e); }
  },
};
