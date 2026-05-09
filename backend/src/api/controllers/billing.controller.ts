import { Request, Response, NextFunction } from 'express';
import { billingService } from '../../services/billing/billing.service';

export async function getPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await billingService.getPlans();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function getMySubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await billingService.getUserSubscription(req.user!.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function startTrial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await billingService.createFreeTrial(req.user!.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function upgradePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { plan, paystackSubCode, paystackCustomerCode } = req.body as { plan?: string; paystackSubCode?: string; paystackCustomerCode?: string };
    if (!plan) { res.status(400).json({ success: false, message: 'Plan is required' }); return; }
    const data = await billingService.upgradePlan(req.user!.id, plan, { subCode: paystackSubCode, customerCode: paystackCustomerCode });
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function cancelSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await billingService.cancelSubscription(req.user!.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}
