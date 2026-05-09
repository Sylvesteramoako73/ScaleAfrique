import { api } from './api';
export interface AdVariation { headline: string; body: string; cta: string; hook?: string; }
export interface AdCreative { id: string; name: string; platform: string; productName: string; targetAudience?: string; tone: string; variations: AdVariation[]; createdAt: string; }
export const adCreativeService = {
  async list() { return (await api.get('/ad-creatives')).data.data as AdCreative[]; },
  async generate(data: { name: string; platform: string; productName: string; productDescription: string; targetAudience?: string; tone?: string; count?: number }) {
    return (await api.post('/ad-creatives/generate', data)).data.data as AdCreative;
  },
  async delete(id: string) { await api.delete(`/ad-creatives/${id}`); },
};
