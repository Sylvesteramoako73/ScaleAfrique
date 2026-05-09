import api from './api';
import type { CommunityPost, Comment, Event, Resource } from '../types';

type Envelope<T> = { success: boolean; data: T };

export const communityService = {
  async getPosts(params?: { category?: string; tag?: string; page?: number; limit?: number }) {
    const { data } = await api.get<Envelope<{ posts: CommunityPost[]; total: number }>>('/community/posts', { params });
    return data.data;
  },

  async createPost(payload: { title: string; content: string; category: string; tags?: string[] }) {
    const { data } = await api.post<Envelope<CommunityPost>>('/community/posts', payload);
    return data.data;
  },

  async likePost(id: string) {
    const { data } = await api.post<Envelope<{ likes: number }>>(`/community/posts/${id}/like`);
    return data.data;
  },

  async getComments(postId: string) {
    const { data } = await api.get<Envelope<Comment[]>>(`/community/posts/${postId}/comments`);
    return data.data;
  },

  async createComment(postId: string, content: string) {
    const { data } = await api.post<Envelope<Comment>>(`/community/posts/${postId}/comments`, { content });
    return data.data;
  },

  async getEvents() {
    const { data } = await api.get<Envelope<Event[]>>('/community/events');
    return data.data;
  },

  async createEvent(payload: {
    title: string; description: string; type: string;
    startDate: string; endDate: string; isOnline?: boolean; meetingLink?: string; tags?: string[];
  }) {
    const { data } = await api.post<Envelope<Event>>('/community/events', payload);
    return data.data;
  },

  async getResources(params?: { type?: string; tag?: string }) {
    const { data } = await api.get<Envelope<Resource[]>>('/community/resources', { params });
    return data.data;
  },
};
