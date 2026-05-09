import api from './api';
import type { Campaign, CampaignFormData, PaginatedResponse } from '../types';

type Envelope<T> = { success: boolean; data: T };

export const campaignService = {
  async list(params?: { status?: string; type?: string; page?: number }): Promise<PaginatedResponse<Campaign>> {
    const { data } = await api.get<Envelope<{ campaigns: Campaign[]; total: number; page: number; limit: number }>>('/campaigns', { params });
    const { campaigns, total, page, limit } = data.data;
    return { items: campaigns ?? [], total, page, limit };
  },

  async get(id: string): Promise<Campaign> {
    const { data } = await api.get<Envelope<Campaign>>(`/campaigns/${id}`);
    return data.data;
  },

  async create(payload: CampaignFormData): Promise<Campaign> {
    const { data } = await api.post<Envelope<Campaign>>('/campaigns', payload);
    return data.data;
  },

  async update(id: string, payload: Partial<CampaignFormData>): Promise<Campaign> {
    const { data } = await api.put<Envelope<Campaign>>(`/campaigns/${id}`, payload);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/campaigns/${id}`);
  },

  async launch(id: string): Promise<Campaign> {
    const { data } = await api.post<Envelope<Campaign>>(`/campaigns/${id}/launch`);
    return data.data;
  },

  async pause(id: string): Promise<Campaign> {
    const { data } = await api.post<Envelope<Campaign>>(`/campaigns/${id}/pause`);
    return data.data;
  },

  async duplicate(id: string): Promise<Campaign> {
    const { data } = await api.post<Envelope<Campaign>>(`/campaigns/${id}/duplicate`);
    return data.data;
  },

  async getAnalytics(id: string): Promise<unknown> {
    const { data } = await api.get<Envelope<unknown>>(`/campaigns/${id}/analytics`);
    return data.data;
  },

  async getTemplates(): Promise<unknown[]> {
    const { data } = await api.get<Envelope<unknown[]>>('/campaigns/templates');
    return data.data;
  },
};
