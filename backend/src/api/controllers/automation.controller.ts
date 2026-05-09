import { Request, Response, NextFunction } from 'express';
import { automationService } from '../../services/automation/automation.service';
import { z } from 'zod';

const triggerSchema = z.object({
  type: z.enum(['new_signup', 'campaign_launched', 'campaign_completed', 'no_activity_7d', 'purchase', 'cart_abandon']),
  conditions: z.record(z.unknown()).optional(),
});

const actionSchema = z.object({
  type: z.enum(['send_email', 'send_sms', 'send_whatsapp', 'wait', 'add_tag', 'create_campaign']),
  config: z.record(z.unknown()),
  delay: z.number().optional(),
});

const automationSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().optional(),
  trigger: triggerSchema,
  actions: z.array(actionSchema).min(1),
  isActive: z.boolean().optional(),
});

export async function listAutomations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const automations = await automationService.list(req.user!.id);
    res.json({ success: true, data: automations });
  } catch (err) { next(err); }
}

export async function getAutomation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const automation = await automationService.get(req.params.id, req.user!.id);
    res.json({ success: true, data: automation });
  } catch (err) { next(err); }
}

export async function createAutomation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = automationSchema.parse(req.body);
    const automation = await automationService.create(req.user!.id, data);
    res.status(201).json({ success: true, data: automation });
  } catch (err) { next(err); }
}

export async function updateAutomation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = automationSchema.partial().parse(req.body);
    const automation = await automationService.update(req.params.id, req.user!.id, data);
    res.json({ success: true, data: automation });
  } catch (err) { next(err); }
}

export async function deleteAutomation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await automationService.delete(req.params.id, req.user!.id);
    res.json({ success: true, message: 'Automation deleted' });
  } catch (err) { next(err); }
}

export async function toggleAutomation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const automation = await automationService.toggle(req.params.id, req.user!.id);
    res.json({ success: true, data: automation });
  } catch (err) { next(err); }
}
