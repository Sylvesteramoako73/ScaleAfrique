import api from './api';

type Envelope<T> = { success: boolean; data: T };

export interface Workspace {
  id: string; name: string; slug: string; plan: string;
  role: string; memberCount: number; createdAt: string;
}

export interface WorkspaceMember {
  id: string; userId: string; role: string; joinedAt?: string;
  user: { id: string; name: string; email: string; avatar?: string };
}

export const workspaceService = {
  async list(): Promise<Workspace[]> {
    const { data } = await api.get<Envelope<Workspace[]>>('/workspaces');
    return data.data;
  },
  async create(name: string): Promise<Workspace> {
    const { data } = await api.post<Envelope<Workspace>>('/workspaces', { name });
    return data.data;
  },
  async get(id: string): Promise<Workspace & { members: WorkspaceMember[] }> {
    const { data } = await api.get<Envelope<Workspace & { members: WorkspaceMember[] }>>(`/workspaces/${id}`);
    return data.data;
  },
  async invite(workspaceId: string, email: string, role?: string): Promise<WorkspaceMember> {
    const { data } = await api.post<Envelope<WorkspaceMember>>(`/workspaces/${workspaceId}/members`, { email, role });
    return data.data;
  },
  async removeMember(workspaceId: string, userId: string): Promise<void> {
    await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
  },
};
