import { api } from './api';
export interface AffiliateProgram { id: string; name: string; commissionRate: number; cookieDays: number; isActive: boolean; _count?: { affiliates: number }; }
export interface Affiliate { id: string; programId: string; name: string; email: string; code: string; clicks: number; conversions: number; earnings: number; status: string; }
export interface ProgramStats { affiliates: number; clicks: number; conversions: number; totalEarnings: number; }
export const affiliateService = {
  async listPrograms() { return (await api.get('/affiliates')).data.data as AffiliateProgram[]; },
  async createProgram(data: { name: string; commissionRate?: number; cookieDays?: number }) { return (await api.post('/affiliates', data)).data.data as AffiliateProgram; },
  async updateProgram(id: string, data: Partial<AffiliateProgram>) { return (await api.put(`/affiliates/${id}`, data)).data.data as AffiliateProgram; },
  async deleteProgram(id: string) { await api.delete(`/affiliates/${id}`); },
  async listAffiliates(programId: string) { return (await api.get(`/affiliates/${programId}/affiliates`)).data.data as Affiliate[]; },
  async addAffiliate(programId: string, data: { name: string; email: string }) { return (await api.post(`/affiliates/${programId}/affiliates`, data)).data.data as Affiliate; },
  async getStats(programId: string) { return (await api.get(`/affiliates/${programId}/stats`)).data.data as ProgramStats; },
};
