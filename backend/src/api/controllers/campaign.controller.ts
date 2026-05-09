import { Request, Response, NextFunction } from 'express';
import { campaignService } from '../../services/campaigns/campaign.service';
import { analyticsService } from '../../services/analytics/analytics.service';
import { campaignCreateSchema, campaignUpdateSchema } from '../../utils/validators';
import { AppError } from '../middleware/errorHandler';
import { prisma } from '../../config/database';

export async function getCampaigns(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, type, page = '1', limit = '20' } = req.query as Record<string, string>;
    const campaigns = await campaignService.getUserCampaigns(req.user!.id, {
      status, type, page: parseInt(page), limit: parseInt(limit),
    });
    res.json({ success: true, data: campaigns });
  } catch (err) { next(err); }
}

export async function getCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const campaign = await campaignService.getCampaign(req.params.id, req.user!.id);
    if (!campaign) throw new AppError('Campaign not found', 404);
    res.json({ success: true, data: campaign });
  } catch (err) { next(err); }
}

export async function createCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = campaignCreateSchema.parse(req.body);
    const campaign = await campaignService.createCampaign(req.user!.id, data);
    res.status(201).json({ success: true, data: campaign });
  } catch (err) { next(err); }
}

export async function updateCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = campaignUpdateSchema.parse(req.body);
    const campaign = await campaignService.updateCampaign(req.params.id, req.user!.id, data);
    res.json({ success: true, data: campaign });
  } catch (err) { next(err); }
}

export async function deleteCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await campaignService.deleteCampaign(req.params.id, req.user!.id);
    res.json({ success: true, message: 'Campaign deleted' });
  } catch (err) { next(err); }
}

export async function launchCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const campaign = await campaignService.launchCampaign(req.params.id, req.user!.id);
    res.json({ success: true, data: campaign, message: 'Campaign launched successfully' });
  } catch (err) { next(err); }
}

export async function pauseCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const campaign = await campaignService.pauseCampaign(req.params.id, req.user!.id);
    res.json({ success: true, data: campaign, message: 'Campaign paused' });
  } catch (err) { next(err); }
}

export async function duplicateCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const campaign = await campaignService.duplicateCampaign(req.params.id, req.user!.id);
    res.status(201).json({ success: true, data: campaign, message: 'Campaign duplicated' });
  } catch (err) { next(err); }
}

export async function getCampaignAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const analytics = await analyticsService.getCampaignAnalytics(req.params.id, req.user!.id, { startDate, endDate });
    res.json({ success: true, data: analytics });
  } catch (err) { next(err); }
}

export async function getTemplates(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const templates = [
      {
        id: 'tpl_social_launch',
        name: 'Product Launch — Social Media',
        type: 'SOCIAL',
        description: 'Multi-platform social campaign for launching a new product in African markets.',
        channels: ['facebook', 'instagram', 'twitter'],
        targeting: { ageRange: [18, 45], interests: ['technology', 'business'] },
        content: { caption: 'Introducing [PRODUCT_NAME] — built for Africa. Try it today!', hashtags: ['#MadeForAfrica', '#Innovation'] },
      },
      {
        id: 'tpl_email_nurture',
        name: 'Lead Nurture — Email Sequence',
        type: 'EMAIL',
        description: 'A 5-email welcome and nurture sequence for new leads.',
        channels: ['email'],
        content: { subject: 'Welcome to [COMPANY] — Here\'s what to expect', sequences: 5 },
      },
      {
        id: 'tpl_ramadan',
        name: 'Ramadan Campaign — Multi-Channel',
        type: 'MULTI_CHANNEL',
        description: 'Culturally-attuned campaign for North and West African markets during Ramadan.',
        channels: ['email', 'facebook', 'whatsapp'],
        targeting: { countries: ['Egypt', 'Nigeria', 'Morocco', 'Senegal'] },
      },
      {
        id: 'tpl_referral',
        name: 'Referral & Word-of-Mouth',
        type: 'MULTI_CHANNEL',
        description: 'Drive referrals through WhatsApp and social sharing incentives.',
        channels: ['whatsapp', 'facebook'],
        content: { incentive: 'Give GHS 10, Get GHS 10', cta: 'Share your link' },
      },
    ];
    res.json({ success: true, data: templates });
  } catch (err) { next(err); }
}
