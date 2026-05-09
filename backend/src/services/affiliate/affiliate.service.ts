import { prisma } from '../../config/database';

function generateCode(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}${suffix}`;
}

export const affiliateService = {
  async listPrograms(workspaceId: string) {
    return prisma.affiliateProgram.findMany({
      where: { workspaceId },
      include: { _count: { select: { affiliates: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async createProgram(workspaceId: string, data: { name: string; commissionRate?: number; cookieDays?: number }) {
    return prisma.affiliateProgram.create({ data: { workspaceId, ...data } });
  },

  async updateProgram(id: string, workspaceId: string, data: Partial<{ name: string; commissionRate: number; cookieDays: number; isActive: boolean }>) {
    return prisma.affiliateProgram.update({ where: { id, workspaceId }, data });
  },

  async deleteProgram(id: string, workspaceId: string) {
    return prisma.affiliateProgram.delete({ where: { id, workspaceId } });
  },

  async listAffiliates(programId: string, workspaceId: string) {
    const program = await prisma.affiliateProgram.findFirst({ where: { id: programId, workspaceId } });
    if (!program) throw new Error('Not found');
    return prisma.affiliate.findMany({ where: { programId }, orderBy: { earnings: 'desc' } });
  },

  async addAffiliate(programId: string, workspaceId: string, data: { name: string; email: string }) {
    const program = await prisma.affiliateProgram.findFirst({ where: { id: programId, workspaceId } });
    if (!program) throw new Error('Not found');
    let code = generateCode(data.name);
    // ensure uniqueness
    while (await prisma.affiliate.findFirst({ where: { code } })) { code = generateCode(data.name); }
    return prisma.affiliate.create({ data: { programId, ...data, code } });
  },

  async recordClick(code: string) {
    return prisma.affiliate.updateMany({ where: { code }, data: { clicks: { increment: 1 } } });
  },

  async recordConversion(code: string, value: number) {
    const aff = await prisma.affiliate.findFirst({ where: { code } });
    if (!aff) return null;
    const program = await prisma.affiliateProgram.findUnique({ where: { id: aff.programId } });
    const commission = (program?.commissionRate ?? 10) / 100 * value;
    return prisma.affiliate.update({
      where: { id: aff.id },
      data: { conversions: { increment: 1 }, earnings: { increment: commission } },
    });
  },

  async getProgramStats(programId: string, workspaceId: string) {
    const program = await prisma.affiliateProgram.findFirst({ where: { id: programId, workspaceId } });
    if (!program) throw new Error('Not found');
    const stats = await prisma.affiliate.aggregate({
      where: { programId },
      _sum: { clicks: true, conversions: true, earnings: true },
      _count: true,
    });
    return {
      affiliates: stats._count,
      clicks: stats._sum.clicks ?? 0,
      conversions: stats._sum.conversions ?? 0,
      totalEarnings: stats._sum.earnings ?? 0,
    };
  },
};
