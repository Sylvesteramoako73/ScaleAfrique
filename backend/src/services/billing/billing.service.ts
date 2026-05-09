import { prisma } from '../../config/database';
import { AppError } from '../../api/middleware/errorHandler';

export const billingService = {
  async getPlans() {
    return prisma.plan.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } });
  },

  async getUserSubscription(userId: string) {
    return prisma.subscription.findUnique({ where: { userId }, include: { plan: true } });
  },

  async createFreeTrial(userId: string) {
    const freePlan = await prisma.plan.findUnique({ where: { name: 'FREE' } });
    if (!freePlan) throw new AppError('Free plan not configured', 500);

    const existing = await prisma.subscription.findUnique({ where: { userId } });
    if (existing) return existing;

    const now = new Date();
    const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    return prisma.subscription.create({
      data: { userId, planId: freePlan.id, status: 'TRIALING', currentPeriodStart: now, currentPeriodEnd: trialEnd, trialEnd },
      include: { plan: true },
    });
  },

  async upgradePlan(userId: string, planName: string, paystackData?: { subCode?: string; customerCode?: string }) {
    const plan = await prisma.plan.findUnique({ where: { name: planName } });
    if (!plan) throw new AppError('Plan not found', 404);

    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return prisma.subscription.upsert({
      where: { userId },
      update: {
        planId: plan.id, status: 'ACTIVE', currentPeriodStart: now, currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false, paystackSubCode: paystackData?.subCode, paystackCustomerCode: paystackData?.customerCode,
      },
      create: {
        userId, planId: plan.id, status: 'ACTIVE', currentPeriodStart: now, currentPeriodEnd: periodEnd,
        paystackSubCode: paystackData?.subCode, paystackCustomerCode: paystackData?.customerCode,
      },
      include: { plan: true },
    });
  },

  async cancelSubscription(userId: string) {
    return prisma.subscription.update({ where: { userId }, data: { cancelAtPeriodEnd: true } });
  },
};
