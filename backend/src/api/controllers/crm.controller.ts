import { Request, Response, NextFunction } from 'express';
import { crmService } from '../../services/crm/crm.service';

function workspaceId(req: Request): string {
  return (req.query.workspaceId as string) || req.user!.id;
}

export async function getCRMDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await crmService.getDashboardStats(workspaceId(req));
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function listContacts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await crmService.listContacts(workspaceId(req), {
      search: req.query.search as string,
      tag: req.query.tag as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 50,
    });
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function getContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await crmService.getContact(req.params.id, workspaceId(req));
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function createContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await crmService.createContact(workspaceId(req), req.user!.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

export async function updateContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await crmService.updateContact(req.params.id, workspaceId(req), req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function deleteContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await crmService.deleteContact(req.params.id, workspaceId(req));
    res.json({ success: true, message: 'Contact deleted' });
  } catch (err) { next(err); }
}

export async function listLeads(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await crmService.listLeads(workspaceId(req), {
      status: req.query.status as string,
      page: Number(req.query.page) || 1,
    });
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function createLead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await crmService.createLead(workspaceId(req), req.user!.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

export async function updateLead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await crmService.updateLead(req.params.id, workspaceId(req), req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function listPipelines(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await crmService.listPipelines(workspaceId(req));
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function createPipeline(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, stages } = req.body as { name: string; stages: string[] };
    const data = await crmService.createPipeline(workspaceId(req), req.user!.id, name, stages ?? []);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

export async function listDeals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await crmService.listDeals(workspaceId(req), req.query.pipelineId as string);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function createDeal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await crmService.createDeal(workspaceId(req), req.user!.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

export async function updateDeal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await crmService.updateDeal(req.params.id, workspaceId(req), req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function deleteDeal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await crmService.deleteDeal(req.params.id, workspaceId(req));
    res.json({ success: true, message: 'Deal deleted' });
  } catch (err) { next(err); }
}

export async function createActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await crmService.createActivity(req.user!.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}
