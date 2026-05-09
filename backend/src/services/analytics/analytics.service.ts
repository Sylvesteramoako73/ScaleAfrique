import { prisma } from '../../config/database';
import { advisorService } from '../ai/advisor.service';
import { AppError } from '../../api/middleware/errorHandler';

interface DateRange {
  startDate?: string;
  endDate?: string;
}

function parseRange(range: DateRange) {
  const end = range.endDate ? new Date(range.endDate) : new Date();
  const start = range.startDate ? new Date(range.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return { start, end };
}

export const analyticsService = {
  async getDashboard(userId: string, range: DateRange) {
    const { start, end } = parseRange(range);

    const [campaigns, analytics, activeCampaigns] = await Promise.all([
      prisma.campaign.findMany({
        where: { userId },
        select: { id: true, name: true, type: true, status: true, budget: true, metrics: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.analytics.findMany({
        where: { userId, date: { gte: start, lte: end } },
        orderBy: { date: 'asc' },
      }),
      prisma.campaign.count({ where: { userId, status: 'ACTIVE' } }),
    ]);

    const totals = analytics.reduce(
      (acc, a) => ({
        impressions: acc.impressions + a.impressions,
        clicks: acc.clicks + a.clicks,
        conversions: acc.conversions + a.conversions,
        spend: acc.spend + a.spend,
        revenue: acc.revenue + a.revenue,
      }),
      { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 },
    );

    const roi = totals.spend > 0 ? ((totals.revenue - totals.spend) / totals.spend) * 100 : 0;
    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const convRate = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;

    // Group analytics by date for chart data
    const dailyData = analytics.map((a) => ({
      date: a.date.toISOString().split('T')[0],
      impressions: a.impressions,
      clicks: a.clicks,
      conversions: a.conversions,
      spend: a.spend,
    }));

    // Channel breakdown as percentage of total impressions
    const channelMap = analytics.reduce<Record<string, number>>((acc, a) => {
      const ch = a.channel ?? 'unknown';
      acc[ch] = (acc[ch] ?? 0) + a.impressions;
      return acc;
    }, {});
    const totalImpressions = totals.impressions || 1;
    const channelBreakdown = Object.entries(channelMap).map(([channel, impressions]) => ({
      channel,
      value: Math.round((impressions / totalImpressions) * 100 * 10) / 10,
    }));

    // Top campaigns by impressions in the period
    const campaignImpressions = analytics.reduce<Record<string, number>>((acc, a) => {
      if (a.campaignId) acc[a.campaignId] = (acc[a.campaignId] ?? 0) + a.impressions;
      return acc;
    }, {});
    const topCampaigns = campaigns
      .map((c) => ({ ...c, periodImpressions: campaignImpressions[c.id] ?? 0 }))
      .sort((a, b) => b.periodImpressions - a.periodImpressions)
      .slice(0, 5);

    return {
      summary: { ...totals, roi, ctr, convRate, activeCampaigns },
      topCampaigns,
      channelBreakdown,
      dailyData,
    };
  },

  async getCampaignAnalytics(campaignId: string, userId: string, range: DateRange) {
    const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, userId } });
    if (!campaign) throw new AppError('Campaign not found', 404);

    const { start, end } = parseRange(range);
    const analytics = await prisma.analytics.findMany({
      where: { campaignId, date: { gte: start, lte: end } },
      orderBy: { date: 'asc' },
    });

    const totals = analytics.reduce(
      (acc, a) => ({
        impressions: acc.impressions + a.impressions,
        clicks: acc.clicks + a.clicks,
        conversions: acc.conversions + a.conversions,
        spend: acc.spend + a.spend,
        revenue: acc.revenue + a.revenue,
      }),
      { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 },
    );

    // Channel breakdown
    const byChannel = analytics.reduce<Record<string, typeof totals>>((acc, a) => {
      const ch = a.channel ?? 'unknown';
      if (!acc[ch]) acc[ch] = { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 };
      acc[ch].impressions += a.impressions;
      acc[ch].clicks += a.clicks;
      acc[ch].conversions += a.conversions;
      acc[ch].spend += a.spend;
      acc[ch].revenue += a.revenue;
      return acc;
    }, {});

    const roi = totals.spend > 0 ? ((totals.revenue - totals.spend) / totals.spend) * 100 : 0;

    return { campaign, analytics, totals: { ...totals, roi }, byChannel };
  },

  async getROI(userId: string) {
    const campaigns = await prisma.campaign.findMany({
      where: { userId },
      select: { id: true, name: true, type: true, status: true, budget: true, metrics: true },
    });

    const roiData = campaigns.map((c) => {
      const metrics = c.metrics as { spend?: number; revenue?: number; impressions?: number; clicks?: number; conversions?: number } | null;
      const spend = metrics?.spend ?? 0;
      const revenue = metrics?.revenue ?? 0;
      const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : 0;
      return {
        campaign: { id: c.id, name: c.name, type: c.type, status: c.status },
        spend,
        revenue,
        roi,
        profit: revenue - spend,
      };
    });

    const totalSpend = roiData.reduce((s, r) => s + r.spend, 0);
    const totalRevenue = roiData.reduce((s, r) => s + r.revenue, 0);
    const overallROI = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;

    return { campaigns: roiData, totals: { spend: totalSpend, revenue: totalRevenue, roi: overallROI } };
  },

  async getAIInsights(userId: string) {
    const profile = await prisma.startupProfile.findUnique({ where: { userId } });
    const campaigns = await prisma.campaign.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    return advisorService.generateInsights(userId, profile, campaigns);
  },

  async exportCSV(userId: string): Promise<string> {
    const analytics = await prisma.analytics.findMany({
      where: { userId },
      include: { campaign: { select: { name: true, type: true } } },
      orderBy: { date: 'desc' },
      take: 1000,
    });

    const headers = 'Date,Campaign,Type,Channel,Impressions,Clicks,Conversions,Spend,Revenue,ROI';
    const rows = analytics.map((a) => {
      const roi = a.spend > 0 ? (((a.revenue - a.spend) / a.spend) * 100).toFixed(2) : '0';
      return [
        a.date.toISOString().split('T')[0],
        a.campaign?.name ?? 'N/A',
        a.campaign?.type ?? 'N/A',
        a.channel ?? 'N/A',
        a.impressions,
        a.clicks,
        a.conversions,
        a.spend.toFixed(2),
        a.revenue.toFixed(2),
        `${roi}%`,
      ].join(',');
    });

    return [headers, ...rows].join('\n');
  },
};
