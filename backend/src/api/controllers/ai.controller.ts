import { Request, Response, NextFunction } from 'express';
import { advisorService } from '../../services/ai/advisor.service';
import { aiChatSchema, aiStrategySchema, aiContentSchema } from '../../utils/validators';
import { prisma } from '../../config/database';

export async function chat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { message, conversationId } = aiChatSchema.parse(req.body);
    const result = await advisorService.chat(req.user!.id, message, conversationId);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function generateStrategy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = aiStrategySchema.parse(req.body);
    // Load the user's startup profile for personalisation
    const profile = await prisma.startupProfile.findUnique({ where: { userId: req.user!.id } });
    const strategy = await advisorService.generateStrategy(req.user!.id, profile, data);
    res.json({ success: true, data: strategy });
  } catch (err) { next(err); }
}

export async function getInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await prisma.startupProfile.findUnique({ where: { userId: req.user!.id } });
    const campaigns = await prisma.campaign.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    const insights = await advisorService.generateInsights(req.user!.id, profile, campaigns);
    res.json({ success: true, data: insights });
  } catch (err) { next(err); }
}

export async function generateContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = aiContentSchema.parse(req.body);
    const profile = await prisma.startupProfile.findUnique({ where: { userId: req.user!.id } });
    const content = await advisorService.generateContent(req.user!.id, profile, data);
    res.json({ success: true, data: content });
  } catch (err) { next(err); }
}

export async function getCalendarOpportunities(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await prisma.startupProfile.findUnique({ where: { userId: req.user!.id } });
    const result = await advisorService.getCalendarOpportunities(req.user!.id, profile);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getWeeklyDigest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await prisma.startupProfile.findUnique({ where: { userId: req.user!.id } });
    const start = new Date(Date.now() - 7 * 86400000);
    const analyticsRows = await prisma.analytics.findMany({
      where: { userId: req.user!.id, date: { gte: start } },
    });
    const totals = analyticsRows.reduce(
      (acc, a) => ({
        impressions: acc.impressions + a.impressions,
        clicks: acc.clicks + a.clicks,
        conversions: acc.conversions + a.conversions,
        spend: acc.spend + a.spend,
        revenue: acc.revenue + a.revenue,
      }),
      { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 },
    );
    const topCampaign = await prisma.campaign.findFirst({
      where: { userId: req.user!.id, status: 'ACTIVE' },
      orderBy: { updatedAt: 'desc' },
      select: { name: true },
    });
    const result = await advisorService.getWeeklyDigest(req.user!.id, profile, {
      ...totals,
      topCampaign: topCampaign?.name,
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function optimizeCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { campaignId } = req.body as { campaignId?: string };
    const campaign = campaignId
      ? await prisma.campaign.findFirst({ where: { id: campaignId, userId: req.user!.id } })
      : null;
    const suggestions = await advisorService.optimizeCampaign(req.user!.id, campaign);
    res.json({ success: true, data: suggestions });
  } catch (err) { next(err); }
}
