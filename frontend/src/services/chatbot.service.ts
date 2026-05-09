import { api } from './api';
import axios from 'axios';

export interface Chatbot {
  id: string;
  workspaceId: string;
  name: string;
  persona: string;
  greeting: string;
  systemPrompt: string;
  primaryColor: string;
  isActive: boolean;
  _count?: { sessions: number };
  createdAt: string;
  updatedAt: string;
}

export interface ChatSession {
  id: string;
  chatbotId: string;
  visitorId: string;
  messages: { role: 'user' | 'assistant'; content: string; timestamp: string }[];
  createdAt: string;
  updatedAt: string;
}

export const chatbotService = {
  async list(): Promise<Chatbot[]> {
    const r = await api.get('/chatbots');
    return r.data.data;
  },
  async get(id: string): Promise<Chatbot> {
    const r = await api.get(`/chatbots/${id}`);
    return r.data.data;
  },
  async create(data: Pick<Chatbot, 'name' | 'persona' | 'greeting' | 'systemPrompt' | 'primaryColor'>): Promise<Chatbot> {
    const r = await api.post('/chatbots', data);
    return r.data.data;
  },
  async update(id: string, data: Partial<Chatbot>): Promise<Chatbot> {
    const r = await api.put(`/chatbots/${id}`, data);
    return r.data.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/chatbots/${id}`);
  },
  async getSessions(id: string): Promise<ChatSession[]> {
    const r = await api.get(`/chatbots/${id}/sessions`);
    return r.data.data;
  },
  // Public (no auth)
  async getPublic(id: string) {
    const r = await axios.get(`/api/v1/public/chatbots/${id}`);
    return r.data.data as Pick<Chatbot, 'id' | 'name' | 'greeting' | 'primaryColor'>;
  },
  async chat(id: string, visitorId: string, message: string): Promise<{ reply: string }> {
    const r = await axios.post(`/api/v1/public/chatbots/${id}/chat`, { visitorId, message });
    return r.data.data;
  },
};
