import api from './api';
import type { Automation, AutomationTrigger, AutomationAction } from '../types';

type Envelope<T> = { success: boolean; data: T };

export const automationService = {
  async list(): Promise<Automation[]> {
    const { data } = await api.get<Envelope<Automation[]>>('/automations');
    return data.data;
  },

  async create(payload: { name: string; description?: string; trigger: AutomationTrigger; actions: AutomationAction[] }): Promise<Automation> {
    const { data } = await api.post<Envelope<Automation>>('/automations', payload);
    return data.data;
  },

  async update(id: string, payload: Partial<{ name: string; description: string; trigger: AutomationTrigger; actions: AutomationAction[]; isActive: boolean }>): Promise<Automation> {
    const { data } = await api.put<Envelope<Automation>>(`/automations/${id}`, payload);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/automations/${id}`);
  },

  async toggle(id: string): Promise<Automation> {
    const { data } = await api.post<Envelope<Automation>>(`/automations/${id}/toggle`);
    return data.data;
  },
};
