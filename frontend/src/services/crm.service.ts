import api from './api';

type Envelope<T> = { success: boolean; data: T };

export interface Contact {
  id: string; firstName: string; lastName?: string; email?: string; phone?: string;
  company?: string; jobTitle?: string; country?: string; tags: string[]; score: number;
  source?: string; createdAt: string;
}

export interface Lead {
  id: string; name: string; email?: string; phone?: string; company?: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
  score: number; value?: number; source?: string; tags: string[]; createdAt: string;
}

export interface Pipeline {
  id: string; name: string; stages: string;
}

export interface Deal {
  id: string; title: string; value: number; currency: string; stage: string;
  probability: number; closeDate?: string; contactName?: string; pipelineId: string;
  tags: string[]; createdAt: string; pipeline?: { name: string; stages: string };
}

export interface CRMStats {
  totalContacts: number; totalLeads: number; totalDeals: number;
  totalDealValue: number; wonDeals: number; activePipelines: number;
}

export const crmService = {
  async getDashboard(): Promise<CRMStats> {
    const { data } = await api.get<Envelope<CRMStats>>('/crm/dashboard');
    return data.data;
  },
  async listContacts(params?: { search?: string; page?: number }): Promise<{ contacts: Contact[]; total: number }> {
    const { data } = await api.get<Envelope<{ contacts: Contact[]; total: number }>>('/crm/contacts', { params });
    return data.data;
  },
  async createContact(payload: Partial<Contact>): Promise<Contact> {
    const { data } = await api.post<Envelope<Contact>>('/crm/contacts', payload);
    return data.data;
  },
  async updateContact(id: string, payload: Partial<Contact>): Promise<Contact> {
    const { data } = await api.put<Envelope<Contact>>(`/crm/contacts/${id}`, payload);
    return data.data;
  },
  async deleteContact(id: string): Promise<void> {
    await api.delete(`/crm/contacts/${id}`);
  },
  async listLeads(params?: { status?: string }): Promise<{ leads: Lead[]; total: number }> {
    const { data } = await api.get<Envelope<{ leads: Lead[]; total: number }>>('/crm/leads', { params });
    return data.data;
  },
  async createLead(payload: Partial<Lead>): Promise<Lead> {
    const { data } = await api.post<Envelope<Lead>>('/crm/leads', payload);
    return data.data;
  },
  async updateLead(id: string, payload: Partial<Lead>): Promise<Lead> {
    const { data } = await api.put<Envelope<Lead>>(`/crm/leads/${id}`, payload);
    return data.data;
  },
  async listPipelines(): Promise<Pipeline[]> {
    const { data } = await api.get<Envelope<Pipeline[]>>('/crm/pipelines');
    return data.data;
  },
  async createPipeline(name: string, stages: string[]): Promise<Pipeline> {
    const { data } = await api.post<Envelope<Pipeline>>('/crm/pipelines', { name, stages });
    return data.data;
  },
  async listDeals(pipelineId?: string): Promise<Deal[]> {
    const { data } = await api.get<Envelope<Deal[]>>('/crm/deals', { params: { pipelineId } });
    return data.data;
  },
  async createDeal(payload: { pipelineId: string; stage: string; title: string } & Partial<Deal>): Promise<Deal> {
    const { data } = await api.post<Envelope<Deal>>('/crm/deals', payload);
    return data.data;
  },
  async updateDeal(id: string, payload: Partial<Deal>): Promise<Deal> {
    const { data } = await api.put<Envelope<Deal>>(`/crm/deals/${id}`, payload);
    return data.data;
  },
  async deleteDeal(id: string): Promise<void> {
    await api.delete(`/crm/deals/${id}`);
  },
};
