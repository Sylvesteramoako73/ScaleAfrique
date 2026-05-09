import { prisma } from '../../config/database';
import { AppError } from '../../api/middleware/errorHandler';
import type { CampaignCreateInput } from '../../utils/validators';

interface ListOptions {
  status?: string;
  type?: string;
  page: number;
  limit: number;
}

const toStr = (val: unknown) => (val !== undefined ? JSON.stringify(val) : undefined);

export const campaignService = {
  async getUserCampaigns(userId: string, options: ListOptions) {
    const { status, type, page, limit } = options;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
    };

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { emailCampaigns: true, socialPosts: true, analytics: true } },
        },
      }),
      prisma.campaign.count({ where }),
    ]);

    return { campaigns, total, page, limit };
  },

  async getCampaign(id: string, userId: string) {
    return prisma.campaign.findFirst({
      where: { id, userId },
      include: {
        emailCampaigns: true,
        socialPosts: { orderBy: { createdAt: 'desc' } },
        analytics: { orderBy: { date: 'desc' }, take: 30 },
      },
    });
  },

  async createCampaign(userId: string, data: CampaignCreateInput) {
    return prisma.campaign.create({
      data: {
        userId,
        name: data.name,
        type: data.type,
        objective: data.objective,
        description: data.description,
        channels: data.channels ?? [],
        budget: data.budget,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        targeting: toStr(data.targeting),
        content: toStr(data.content),
        status: 'DRAFT',
      },
    });
  },

  async updateCampaign(id: string, userId: string, data: Partial<CampaignCreateInput>) {
    const existing = await prisma.campaign.findFirst({ where: { id, userId } });
    if (!existing) throw new AppError('Campaign not found', 404);
    if (existing.status === 'ACTIVE') {
      throw new AppError('Cannot edit an active campaign. Pause it first.', 400);
    }

    return prisma.campaign.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.type ? { type: data.type } : {}),
        ...(data.objective !== undefined ? { objective: data.objective } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.channels ? { channels: data.channels } : {}),
        ...(data.budget !== undefined ? { budget: data.budget } : {}),
        ...(data.startDate ? { startDate: new Date(data.startDate) } : {}),
        ...(data.endDate ? { endDate: new Date(data.endDate) } : {}),
        ...(data.targeting !== undefined ? { targeting: toStr(data.targeting) } : {}),
        ...(data.content !== undefined ? { content: toStr(data.content) } : {}),
      },
    });
  },

  async deleteCampaign(id: string, userId: string) {
    const existing = await prisma.campaign.findFirst({ where: { id, userId } });
    if (!existing) throw new AppError('Campaign not found', 404);
    if (existing.status === 'ACTIVE') {
      throw new AppError('Cannot delete an active campaign. Pause it first.', 400);
    }
    return prisma.campaign.delete({ where: { id } });
  },

  async launchCampaign(id: string, userId: string) {
    const existing = await prisma.campaign.findFirst({ where: { id, userId } });
    if (!existing) throw new AppError('Campaign not found', 404);
    if (existing.status === 'ACTIVE') {
      throw new AppError('Campaign is already active', 400);
    }
    return prisma.campaign.update({
      where: { id },
      data: { status: 'ACTIVE', startDate: existing.startDate ?? new Date() },
    });
  },

  async pauseCampaign(id: string, userId: string) {
    const existing = await prisma.campaign.findFirst({ where: { id, userId } });
    if (!existing) throw new AppError('Campaign not found', 404);
    if (existing.status !== 'ACTIVE') {
      throw new AppError('Only active campaigns can be paused', 400);
    }
    return prisma.campaign.update({ where: { id }, data: { status: 'PAUSED' } });
  },

  async duplicateCampaign(id: string, userId: string) {
    const source = await prisma.campaign.findFirst({ where: { id, userId } });
    if (!source) throw new AppError('Campaign not found', 404);

    const { id: _id, createdAt: _c, updatedAt: _u, status: _s, metrics: _m, ...rest } = source;

    return prisma.campaign.create({
      data: {
        ...rest,
        name: `${rest.name} (Copy)`,
        status: 'DRAFT',
        startDate: null,
        endDate: null,
      },
    });
  },
};
