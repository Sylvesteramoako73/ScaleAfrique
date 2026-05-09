import api from './api';
import type { AnalyticsDashboard, CampaignAnalytics } from '../types';

type Envelope<T> = { success: boolean; data: T };

export const analyticsService = {
  async getDashboard(range?: string): Promise<AnalyticsDashboard> {
    const { data } = await api.get<Envelope<AnalyticsDashboard>>('/analytics/dashboard', { params: { range } });
    return data.data;
  },

  async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics> {
    const { data } = await api.get<Envelope<CampaignAnalytics>>(`/analytics/campaigns/${campaignId}`);
    return data.data;
  },

  async getROI(params?: { startDate?: string; endDate?: string }): Promise<unknown> {
    const { data } = await api.get<Envelope<unknown>>('/analytics/roi', { params });
    return data.data;
  },

  async getInsights(): Promise<{ insights: string[] }> {
    const { data } = await api.get<Envelope<{ insights: string[] }>>('/analytics/insights');
    return data.data;
  },

  async exportReport(format: 'csv' | 'pdf'): Promise<Blob> {
    const { data } = await api.get('/analytics/export', {
      params: { format },
      responseType: 'blob',
    });
    return data;
  },
};
