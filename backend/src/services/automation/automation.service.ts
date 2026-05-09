import { prisma } from '../../config/database';
import { AppError } from '../../api/middleware/errorHandler';

interface AutomationTrigger {
  type: 'new_signup' | 'campaign_launched' | 'campaign_completed' | 'no_activity_7d' | 'purchase' | 'cart_abandon';
  conditions?: Record<string, unknown>;
}

interface AutomationAction {
  type: 'send_email' | 'send_sms' | 'send_whatsapp' | 'wait' | 'add_tag' | 'create_campaign';
  config: Record<string, unknown>;
  delay?: number; // minutes
}

interface AutomationInput {
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  isActive?: boolean;
}

const toStr = (val: unknown) => JSON.stringify(val);
const fromStr = <T>(val: string | null): T => {
  try { return val ? JSON.parse(val) : {} as T; } catch { return {} as T; }
};

export const automationService = {
  async list(userId: string) {
    const automations = await prisma.automation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return automations.map(a => ({
      ...a,
      trigger: fromStr<AutomationTrigger>(a.trigger),
      actions: fromStr<AutomationAction[]>(a.actions),
      stats: fromStr<{ runs: number; lastRun: string | null }>(a.stats),
    }));
  },

  async get(id: string, userId: string) {
    const a = await prisma.automation.findFirst({ where: { id, userId } });
    if (!a) throw new AppError('Automation not found', 404);
    return {
      ...a,
      trigger: fromStr<AutomationTrigger>(a.trigger),
      actions: fromStr<AutomationAction[]>(a.actions),
      stats: fromStr<{ runs: number; lastRun: string | null }>(a.stats),
    };
  },

  async create(userId: string, input: AutomationInput) {
    const a = await prisma.automation.create({
      data: {
        userId,
        name: input.name,
        description: input.description,
        isActive: input.isActive ?? true,
        trigger: toStr(input.trigger),
        actions: toStr(input.actions),
      },
    });
    return { ...a, trigger: input.trigger, actions: input.actions, stats: { runs: 0, lastRun: null } };
  },

  async update(id: string, userId: string, input: Partial<AutomationInput>) {
    const existing = await prisma.automation.findFirst({ where: { id, userId } });
    if (!existing) throw new AppError('Automation not found', 404);
    const updated = await prisma.automation.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.trigger ? { trigger: toStr(input.trigger) } : {}),
        ...(input.actions ? { actions: toStr(input.actions) } : {}),
      },
    });
    return {
      ...updated,
      trigger: input.trigger ?? fromStr<AutomationTrigger>(existing.trigger),
      actions: input.actions ?? fromStr<AutomationAction[]>(existing.actions),
      stats: fromStr<{ runs: number; lastRun: string | null }>(updated.stats),
    };
  },

  async delete(id: string, userId: string) {
    const existing = await prisma.automation.findFirst({ where: { id, userId } });
    if (!existing) throw new AppError('Automation not found', 404);
    await prisma.automation.delete({ where: { id } });
  },

  async toggle(id: string, userId: string) {
    const existing = await prisma.automation.findFirst({ where: { id, userId } });
    if (!existing) throw new AppError('Automation not found', 404);
    const updated = await prisma.automation.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
    return updated;
  },

  // Called when a trigger event happens for a user
  async runForEvent(userId: string, eventType: string, eventData?: Record<string, unknown>) {
    const automations = await prisma.automation.findMany({
      where: { userId, isActive: true },
    });

    const matching = automations.filter(a => {
      const trigger = fromStr<AutomationTrigger>(a.trigger);
      return trigger.type === eventType;
    });

    for (const automation of matching) {
      // Increment run count
      const stats = fromStr<{ runs: number; lastRun: string | null }>(automation.stats);
      await prisma.automation.update({
        where: { id: automation.id },
        data: {
          stats: toStr({ runs: (stats.runs ?? 0) + 1, lastRun: new Date().toISOString() }),
        },
      });
    }

    return matching.length;
  },
};
