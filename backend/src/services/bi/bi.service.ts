import { prisma } from '../../config/database';

export const biService = {
  async getReport(userId: string, days: number) {
    const since = new Date(Date.now() - days * 86_400_000);
    const wsId = userId; // default workspace = userId

    const [
      analyticsAgg,
      analyticsDaily,
      topCampaigns,
      crmStats,
      ecomStats,
      funnelStats,
      chatStats,
      recentOrders,
    ] = await Promise.all([
      // Overall KPIs
      prisma.analytics.aggregate({
        where: { userId, date: { gte: since } },
        _sum: { impressions: true, clicks: true, conversions: true, spend: true, revenue: true },
      }),

      // Daily revenue + clicks for chart (last `days` days)
      prisma.analytics.groupBy({
        by: ['date'],
        where: { userId, date: { gte: since } },
        _sum: { revenue: true, clicks: true, conversions: true },
        orderBy: { date: 'asc' },
      }),

      // Top campaigns by revenue
      prisma.analytics.groupBy({
        by: ['campaignId'],
        where: { userId, date: { gte: since }, campaignId: { not: null } },
        _sum: { impressions: true, clicks: true, conversions: true, revenue: true, spend: true },
        orderBy: { _sum: { revenue: 'desc' } },
        take: 5,
      }),

      // CRM stats
      Promise.all([
        prisma.contact.count({ where: { workspaceId: wsId } }),
        prisma.lead.count({ where: { workspaceId: wsId } }),
        prisma.deal.aggregate({ where: { workspaceId: wsId, stage: 'WON' }, _sum: { value: true }, _count: true }),
        prisma.deal.aggregate({ where: { workspaceId: wsId }, _sum: { value: true }, _count: true }),
      ]),

      // E-commerce stats
      prisma.order.aggregate({
        where: { workspaceId: wsId, createdAt: { gte: since } },
        _sum: { total: true },
        _count: true,
      }),

      // Funnel conversion stats
      prisma.funnelSubmission.count({ where: { funnel: { workspaceId: wsId }, createdAt: { gte: since } } }),

      // Chatbot session count
      prisma.chatSession.count({ where: { chatbot: { workspaceId: wsId }, createdAt: { gte: since } } }),

      // Orders over time for chart
      prisma.order.findMany({
        where: { workspaceId: wsId, createdAt: { gte: since } },
        select: { createdAt: true, total: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Resolve campaign names
    const campaignIds = topCampaigns.map(c => c.campaignId).filter(Boolean) as string[];
    const campaigns = await prisma.campaign.findMany({
      where: { id: { in: campaignIds } },
      select: { id: true, name: true, type: true, status: true },
    });
    const campaignMap = new Map(campaigns.map(c => [c.id, c]));

    const [contacts, leads, wonDeals, allDeals] = crmStats;

    // Build daily chart data — fill gaps with 0
    const dailyMap = new Map(
      analyticsDaily.map(d => [d.date.toISOString().slice(0, 10), d])
    );
    const chartDays = Array.from({ length: Math.min(days, 30) }, (_, i) => {
      const d = new Date(since.getTime() + i * 86_400_000);
      const key = d.toISOString().slice(0, 10);
      const row = dailyMap.get(key);
      return {
        date: key,
        revenue: row?._sum.revenue ?? 0,
        clicks: row?._sum.clicks ?? 0,
        conversions: row?._sum.conversions ?? 0,
      };
    });

    // Order revenue by day
    const orderByDay = new Map<string, number>();
    recentOrders.forEach(o => {
      const key = o.createdAt.toISOString().slice(0, 10);
      orderByDay.set(key, (orderByDay.get(key) ?? 0) + o.total);
    });

    const totalRevenue = (analyticsAgg._sum.revenue ?? 0) + (ecomStats._sum.total ?? 0);
    const totalSpend = analyticsAgg._sum.spend ?? 0;
    const totalClicks = analyticsAgg._sum.clicks ?? 0;
    const totalImpressions = analyticsAgg._sum.impressions ?? 0;
    const totalConversions = analyticsAgg._sum.conversions ?? 0;

    return {
      kpis: {
        revenue: totalRevenue,
        spend: totalSpend,
        roi: totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0,
        clicks: totalClicks,
        impressions: totalImpressions,
        conversions: totalConversions,
        ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        orders: ecomStats._count,
        orderRevenue: ecomStats._sum.total ?? 0,
        contacts,
        leads,
        wonDeals: wonDeals._count,
        wonRevenue: wonDeals._sum.value ?? 0,
        pipelineValue: allDeals._sum.value ?? 0,
        funnelLeads: funnelStats,
        chatSessions: chatStats,
      },
      chart: chartDays,
      topCampaigns: topCampaigns.map(c => ({
        id: c.campaignId,
        name: campaignMap.get(c.campaignId!)?.name ?? 'Unknown',
        type: campaignMap.get(c.campaignId!)?.type ?? '—',
        status: campaignMap.get(c.campaignId!)?.status ?? '—',
        impressions: c._sum.impressions ?? 0,
        clicks: c._sum.clicks ?? 0,
        conversions: c._sum.conversions ?? 0,
        revenue: c._sum.revenue ?? 0,
        spend: c._sum.spend ?? 0,
        ctr: (c._sum.impressions ?? 0) > 0 ? ((c._sum.clicks ?? 0) / (c._sum.impressions ?? 1)) * 100 : 0,
      })),
    };
  },
};
