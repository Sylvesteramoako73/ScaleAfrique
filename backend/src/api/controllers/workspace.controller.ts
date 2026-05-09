import { Request, Response, NextFunction } from 'express';
import { workspaceService } from '../../services/workspace/workspace.service';

export async function listWorkspaces(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await workspaceService.getUserWorkspaces(req.user!.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function createWorkspace(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name } = req.body as { name?: string };
    if (!name?.trim()) { res.status(400).json({ success: false, message: 'Name is required' }); return; }
    const data = await workspaceService.createWorkspace(req.user!.id, name.trim());
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

export async function getWorkspace(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await workspaceService.getWorkspace(req.params.id, req.user!.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function inviteMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, role } = req.body as { email?: string; role?: string };
    if (!email) { res.status(400).json({ success: false, message: 'Email is required' }); return; }
    const data = await workspaceService.inviteMember(req.params.id, req.user!.id, email, role);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

export async function removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await workspaceService.removeMember(req.params.id, req.user!.id, req.params.userId);
    res.json({ success: true, message: 'Member removed' });
  } catch (err) { next(err); }
}
