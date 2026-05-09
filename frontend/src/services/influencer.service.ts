import { api } from './api';
export interface Influencer { id: string; name: string; handle: string; platform: string; country: string; category: string; followers: number; engagementRate: number; pricePerPost?: number; bio?: string; avatar?: string; isVerified: boolean; }
export interface InfluencerRequest { id: string; influencerId: string; influencer: Influencer; campaignName: string; message: string; budget?: number; status: string; createdAt: string; }
export const influencerService = {
  async list(filters?: { platform?: string; country?: string; category?: string }) { return (await api.get('/influencers', { params: filters })).data.data as Influencer[]; },
  async listRequests() { return (await api.get('/influencers/requests')).data.data as InfluencerRequest[]; },
  async createRequest(data: { influencerId: string; campaignName: string; message: string; budget?: number }) { return (await api.post('/influencers/requests', data)).data.data as InfluencerRequest; },
};
