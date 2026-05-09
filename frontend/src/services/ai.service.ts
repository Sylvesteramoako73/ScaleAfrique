import api from './api';

export interface ChatResponse { reply: string; conversationId: string }
export interface StrategyResponse { strategy: string; channels: string[]; budget: Record<string, number> }
export interface CalendarOpportunity {
  date: string;
  event: string;
  type: 'religious' | 'national' | 'cultural' | 'commercial';
  suggestion: string;
  urgency: 'high' | 'medium' | 'low';
}

type Envelope<T> = { success: boolean; data: T };

export const aiService = {
  async chat(message: string, conversationId?: string): Promise<ChatResponse> {
    const { data } = await api.post<Envelope<ChatResponse>>('/ai/advisor/chat', { message, conversationId });
    return data.data;
  },

  async generateStrategy(profile: unknown): Promise<StrategyResponse> {
    const { data } = await api.post<Envelope<StrategyResponse>>('/ai/advisor/strategy', { profile });
    return data.data;
  },

  async getInsights(): Promise<{ insights: string[] }> {
    const { data } = await api.get<Envelope<{ insights: string[] }>>('/ai/advisor/insights');
    return data.data;
  },

  async generateContent(type: string, brief: string): Promise<{ content: string }> {
    const { data } = await api.post<Envelope<{ content: string }>>('/ai/content/generate', { type, brief });
    return data.data;
  },

  async optimizeCampaign(campaignId: string): Promise<{ suggestions: string[] }> {
    const { data } = await api.post<Envelope<{ suggestions: string[] }>>('/ai/campaigns/optimize', { campaignId });
    return data.data;
  },

  async getCalendarOpportunities(): Promise<{ opportunities: CalendarOpportunity[] }> {
    const { data } = await api.get<Envelope<{ opportunities: CalendarOpportunity[] }>>('/ai/calendar-opportunities');
    return data.data;
  },

  async getWeeklyDigest(): Promise<{ digest: string; recommendations: string[] }> {
    const { data } = await api.get<Envelope<{ digest: string; recommendations: string[] }>>('/ai/weekly-digest');
    return data.data;
  },
};
