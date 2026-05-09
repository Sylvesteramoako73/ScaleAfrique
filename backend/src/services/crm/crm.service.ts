import { prisma } from '../../config/database';
import { AppError } from '../../api/middleware/errorHandler';

export const crmService = {
  async getDashboardStats(workspaceId: string) {
    const [totalContacts, totalLeads, deals, activePipelines] = await Promise.all([
      prisma.contact.count({ where: { workspaceId } }),
      prisma.lead.count({ where: { workspaceId } }),
      prisma.deal.findMany({ where: { workspaceId }, select: { value: true, stage: true } }),
      prisma.pipeline.count({ where: { workspaceId } }),
    ]);
    const totalDealValue = deals.reduce((s, d) => s + d.value, 0);
    const wonDeals = deals.filter(d => ['Won', 'CLOSED_WON'].includes(d.stage)).length;
    return { totalContacts, totalLeads, totalDeals: deals.length, totalDealValue, wonDeals, activePipelines };
  },

  async listContacts(workspaceId: string, opts: { search?: string; tag?: string; page?: number; limit?: number }) {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 50;
    const where: Record<string, unknown> = { workspaceId };
    if (opts.search) {
      where.OR = [
        { firstName: { contains: opts.search, mode: 'insensitive' } },
        { lastName: { contains: opts.search, mode: 'insensitive' } },
        { email: { contains: opts.search, mode: 'insensitive' } },
        { company: { contains: opts.search, mode: 'insensitive' } },
      ];
    }
    if (opts.tag) where.tags = { has: opts.tag };
    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.contact.count({ where }),
    ]);
    return { contacts, total, page, limit };
  },

  async getContact(id: string, workspaceId: string) {
    const contact = await prisma.contact.findFirst({
      where: { id, workspaceId },
      include: { leads: { orderBy: { createdAt: 'desc' } }, activities: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
    if (!contact) throw new AppError('Contact not found', 404);
    return contact;
  },

  async createContact(workspaceId: string, userId: string, data: {
    firstName: string; lastName?: string; email?: string; phone?: string;
    company?: string; jobTitle?: string; country?: string; city?: string; tags?: string[]; source?: string;
  }) {
    return prisma.contact.create({ data: { workspaceId, userId, ...data, tags: data.tags ?? [] } });
  },

  async updateContact(id: string, workspaceId: string, data: Record<string, unknown>) {
    const existing = await prisma.contact.findFirst({ where: { id, workspaceId } });
    if (!existing) throw new AppError('Contact not found', 404);
    return prisma.contact.update({ where: { id }, data });
  },

  async deleteContact(id: string, workspaceId: string) {
    const existing = await prisma.contact.findFirst({ where: { id, workspaceId } });
    if (!existing) throw new AppError('Contact not found', 404);
    await prisma.contact.delete({ where: { id } });
  },

  async listLeads(workspaceId: string, opts: { status?: string; page?: number; limit?: number }) {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 50;
    const where: Record<string, unknown> = { workspaceId };
    if (opts.status) where.status = opts.status;
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit, include: { contact: true } }),
      prisma.lead.count({ where }),
    ]);
    return { leads, total, page, limit };
  },

  async createLead(workspaceId: string, userId: string, data: {
    name: string; email?: string; phone?: string; company?: string;
    source?: string; value?: number; notes?: string; tags?: string[];
  }) {
    return prisma.lead.create({ data: { workspaceId, userId, ...data, tags: data.tags ?? [], status: 'NEW' } });
  },

  async updateLead(id: string, workspaceId: string, data: Record<string, unknown>) {
    const existing = await prisma.lead.findFirst({ where: { id, workspaceId } });
    if (!existing) throw new AppError('Lead not found', 404);
    return prisma.lead.update({ where: { id }, data });
  },

  async listPipelines(workspaceId: string) {
    return prisma.pipeline.findMany({
      where: { workspaceId },
      include: { _count: { select: { deals: true } } },
    });
  },

  async createPipeline(workspaceId: string, userId: string, name: string, stages: string[]) {
    return prisma.pipeline.create({ data: { workspaceId, userId, name, stages: JSON.stringify(stages) } });
  },

  async listDeals(workspaceId: string, pipelineId?: string) {
    return prisma.deal.findMany({
      where: { workspaceId, ...(pipelineId ? { pipelineId } : {}) },
      orderBy: { createdAt: 'desc' },
      include: { pipeline: { select: { name: true, stages: true } } },
    });
  },

  async createDeal(workspaceId: string, userId: string, data: {
    title: string; pipelineId: string; value?: number; stage: string;
    probability?: number; closeDate?: Date; contactName?: string; contactEmail?: string;
  }) {
    return prisma.deal.create({ data: { workspaceId, userId, value: 0, tags: [], ...data } });
  },

  async updateDeal(id: string, workspaceId: string, data: Record<string, unknown>) {
    const existing = await prisma.deal.findFirst({ where: { id, workspaceId } });
    if (!existing) throw new AppError('Deal not found', 404);
    return prisma.deal.update({ where: { id }, data });
  },

  async deleteDeal(id: string, workspaceId: string) {
    const existing = await prisma.deal.findFirst({ where: { id, workspaceId } });
    if (!existing) throw new AppError('Deal not found', 404);
    await prisma.deal.delete({ where: { id } });
  },

  async createActivity(userId: string, data: {
    type: string; title: string; body?: string; dueAt?: Date;
    contactId?: string; leadId?: string; dealId?: string;
  }) {
    return prisma.activity.create({ data: { userId, ...data } });
  },
};
