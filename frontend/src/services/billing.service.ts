import api from './api';

type Envelope<T> = { success: boolean; data: T };

export interface Plan {
  id: string; name: string; displayName: string; price: number;
  currency: string; interval: string; features: string; limits: string;
}

export interface Subscription {
  id: string; status: 'ACTIVE' | 'TRIALING' | 'CANCELLED' | 'PAST_DUE';
  currentPeriodEnd: string; cancelAtPeriodEnd: boolean; plan: Plan;
}

export const billingService = {
  async getPlans(): Promise<Plan[]> {
    const { data } = await api.get<Envelope<Plan[]>>('/billing/plans');
    return data.data;
  },
  async getSubscription(): Promise<Subscription | null> {
    try {
      const { data } = await api.get<Envelope<Subscription>>('/billing/subscription');
      return data.data;
    } catch { return null; }
  },
  async startTrial(): Promise<Subscription> {
    const { data } = await api.post<Envelope<Subscription>>('/billing/trial');
    return data.data;
  },
  async upgradePlan(plan: string): Promise<Subscription> {
    const { data } = await api.post<Envelope<Subscription>>('/billing/upgrade', { plan });
    return data.data;
  },
  async cancelSubscription(): Promise<Subscription> {
    const { data } = await api.post<Envelope<Subscription>>('/billing/cancel');
    return data.data;
  },
};
