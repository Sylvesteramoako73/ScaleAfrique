import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../../services/analytics/analytics.service';

export async function getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { range = '30d', startDate, endDate } = req.query as { range?: string; startDate?: string; endDate?: string };
    let start: Date, end: Date;
    end = endDate ? new Date(endDate) : new Date();
    if (startDate) {
      start = new Date(startDate);
    } else {
      const days = range === '7d' ? 7 : range === '90d' ? 90 : range === '1y' ? 365 : 30;
      start = new Date(Date.now() - days * 86400000);
    }
    const dashboard = await analyticsService.getDashboard(req.user!.id, { startDate: start.toISOString(), endDate: end.toISOString() });
    res.json({ success: true, data: dashboard });
  } catch (err) { next(err); }
}

export async function getCampaignAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const analytics = await analyticsService.getCampaignAnalytics(req.params.id, req.user!.id, { startDate, endDate });
    res.json({ success: true, data: analytics });
  } catch (err) { next(err); }
}

export async function getROI(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const roi = await analyticsService.getROI(req.user!.id);
    res.json({ success: true, data: roi });
  } catch (err) { next(err); }
}

export async function getInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const insights = await analyticsService.getAIInsights(req.user!.id);
    res.json({ success: true, data: insights });
  } catch (err) { next(err); }
}

export async function exportReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const csv = await analyticsService.exportCSV(req.user!.id);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="scaleafrique-report.csv"');
    res.send(csv);
  } catch (err) { next(err); }
}
