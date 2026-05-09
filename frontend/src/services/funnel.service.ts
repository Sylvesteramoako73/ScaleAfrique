import { api } from './api';

export type BlockType = 'hero' | 'text' | 'image' | 'form' | 'cta' | 'spacer';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select';
  required: boolean;
  options?: string[];
}

export interface Block {
  id: string;
  type: BlockType;
  // hero
  title?: string;
  subtitle?: string;
  bgColor?: string;
  textColor?: string;
  // text
  content?: string;
  align?: 'left' | 'center' | 'right';
  // image
  url?: string;
  alt?: string;
  // form
  fields?: FormField[];
  submitLabel?: string;
  successMessage?: string;
  // cta
  label?: string;
  href?: string;
  style?: 'primary' | 'secondary';
  // spacer
  height?: number;
}

export interface FunnelPage {
  id: string;
  funnelId: string;
  name: string;
  order: number;
  blocks: Block[];
}

export interface Funnel {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description?: string;
  status: 'DRAFT' | 'PUBLISHED';
  pages?: FunnelPage[];
  _count?: { pages: number; submissions: number };
  createdAt: string;
  updatedAt: string;
}

export const funnelService = {
  async list(): Promise<Funnel[]> {
    const r = await api.get('/funnels');
    return r.data.data;
  },
  async get(id: string): Promise<Funnel> {
    const r = await api.get(`/funnels/${id}`);
    return r.data.data;
  },
  async create(name: string, description?: string): Promise<Funnel> {
    const r = await api.post('/funnels', { name, description });
    return r.data.data;
  },
  async update(id: string, data: Partial<Pick<Funnel, 'name' | 'description' | 'status'>>): Promise<Funnel> {
    const r = await api.put(`/funnels/${id}`, data);
    return r.data.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/funnels/${id}`);
  },
  async publish(id: string): Promise<Funnel> {
    const r = await api.post(`/funnels/${id}/publish`);
    return r.data.data;
  },
  async unpublish(id: string): Promise<Funnel> {
    const r = await api.post(`/funnels/${id}/unpublish`);
    return r.data.data;
  },
  async savePage(funnelId: string, page: FunnelPage): Promise<FunnelPage> {
    const r = await api.put(`/funnels/${funnelId}/pages/${page.id}`, { blocks: page.blocks, name: page.name, order: page.order });
    return r.data.data;
  },
  async addPage(funnelId: string, name: string): Promise<FunnelPage> {
    const r = await api.post(`/funnels/${funnelId}/pages`, { name, blocks: [] });
    return r.data.data;
  },
  async deletePage(funnelId: string, pageId: string): Promise<void> {
    await api.delete(`/funnels/${funnelId}/pages/${pageId}`);
  },
  async getSubmissions(funnelId: string) {
    const r = await api.get(`/funnels/${funnelId}/submissions`);
    return r.data.data;
  },
};
