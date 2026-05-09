import { api } from './api';
export interface SocialKeyword { id: string; keyword: string; isActive: boolean; createdAt: string; }
export interface SocialMention { id: string; keyword: string; platform: string; content: string; author?: string; url?: string; sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'; score: number; publishedAt: string; }
export interface SocialStats { total: number; positive: number; negative: number; neutral: number; byPlatform: { platform: string; _count: number }[]; }
export const socialService = {
  async getKeywords() { return (await api.get('/social/keywords')).data.data as SocialKeyword[]; },
  async addKeyword(keyword: string) { return (await api.post('/social/keywords', { keyword })).data.data as SocialKeyword; },
  async removeKeyword(id: string) { await api.delete(`/social/keywords/${id}`); },
  async getMentions(keyword?: string, sentiment?: string) { return (await api.get('/social/mentions', { params: { keyword, sentiment } })).data.data as SocialMention[]; },
  async getStats() { return (await api.get('/social/stats')).data.data as SocialStats; },
  async refresh() { return (await api.post('/social/refresh')).data.data as { added: number }; },
};
