'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Mail, Crown, Shield, Eye, Trash2, Building2, Users } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { workspaceService, type Workspace, type WorkspaceMember } from '../services/workspace.service';
import { useAuthStore } from '../store/authStore';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';

const ROLE_ICONS: Record<string, React.ReactNode> = {
  OWNER: <Crown size={12} className="text-amber-500" />,
  ADMIN: <Shield size={12} className="text-primary-500" />,
  MEMBER: <Users size={12} className="text-gray-400" />,
  VIEWER: <Eye size={12} className="text-gray-400" />,
};

const ROLE_COLORS: Record<string, string> = {
  OWNER: 'bg-amber-50 text-amber-700',
  ADMIN: 'bg-primary-50 text-primary-700',
  MEMBER: 'bg-gray-100 text-gray-600',
  VIEWER: 'bg-gray-50 text-gray-500',
};

export function Team() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [newName, setNewName] = useState('');

  const { data: workspaces, isLoading } = useQuery({
    queryKey: ['workspaces'], queryFn: () => workspaceService.list(), staleTime: 60_000,
  });

  const activeId = selectedId ?? workspaces?.[0]?.id ?? null;

  const { data: detail } = useQuery({
    queryKey: ['workspaces', activeId],
    queryFn: () => workspaceService.get(activeId!),
    enabled: !!activeId,
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => workspaceService.create(name),
    onSuccess: ws => {
      qc.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success(`Workspace "${ws.name}" created`);
      setShowCreate(false); setNewName(''); setSelectedId(ws.id);
    },
    onError: () => toast.error('Failed to create workspace'),
  });

  const inviteMutation = useMutation({
    mutationFn: ({ wsId, email, role }: { wsId: string; email: string; role: string }) =>
      workspaceService.invite(wsId, email, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Member invited'); setShowInvite(false); setInviteEmail('');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to invite';
      toast.error(msg);
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ wsId, userId }: { wsId: string; userId: string }) =>
      workspaceService.removeMember(wsId, userId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workspaces'] }); toast.success('Member removed'); },
    onError: () => toast.error('Failed to remove member'),
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Team</h2>
          <p className="text-sm text-gray-500">Manage workspaces and collaborate with your team</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<Building2 size={14} />} onClick={() => setShowCreate(true)}>New workspace</Button>
          {activeId && <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowInvite(true)}>Invite member</Button>}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" className="text-primary-600" /></div>
      ) : !workspaces?.length ? (
        <Card className="text-center py-14">
          <p className="text-4xl mb-3">🏢</p>
          <p className="text-base font-semibold text-gray-900 mb-1">Create your first workspace</p>
          <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">Workspaces let you collaborate with your team and manage multiple client accounts separately.</p>
          <Button icon={<Plus size={14} />} onClick={() => setShowCreate(true)}>Create workspace</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Workspaces</p>
            {workspaces.map((ws: Workspace) => (
              <div key={ws.id} onClick={() => setSelectedId(ws.id)} className={clsx('p-3.5 rounded-xl border-2 cursor-pointer transition-all', activeId === ws.id ? 'border-primary-300 bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300')}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white text-sm font-bold shrink-0">{ws.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{ws.name}</p>
                    <p className="text-xs text-gray-400">{ws.memberCount} member{ws.memberCount !== 1 ? 's' : ''}</p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded-full shrink-0">{ws.plan}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            <Card padding={false}>
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <CardTitle>{detail?.name ?? workspaces[0]?.name ?? 'Workspace'} Members</CardTitle>
                <Button size="sm" variant="outline" icon={<Plus size={13} />} onClick={() => setShowInvite(true)}>Invite</Button>
              </div>
              {!detail ? (
                <div className="flex justify-center py-10"><Spinner size="sm" className="text-primary-600" /></div>
              ) : detail.members.length === 0 ? (
                <div className="text-center py-10"><p className="text-sm text-gray-400">No members yet. Invite your team.</p></div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {detail.members.map((m: WorkspaceMember) => (
                    <div key={m.id} className="flex items-center gap-3 px-4 py-3.5">
                      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold shrink-0">{m.user.name[0]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{m.user.name}</p>
                        <span className="flex items-center gap-1 text-xs text-gray-400"><Mail size={10} />{m.user.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={clsx('flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', ROLE_COLORS[m.role] ?? 'bg-gray-100 text-gray-600')}>
                          {ROLE_ICONS[m.role]}{m.role}
                        </span>
                        {m.role !== 'OWNER' && m.userId !== user?.id && (
                          <button onClick={() => activeId && removeMutation.mutate({ wsId: activeId, userId: m.userId })} className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Create Workspace</h3>
            <Input label="Workspace name" placeholder="e.g. My Agency, Acme Corp" value={newName} onChange={e => setNewName(e.target.value)} />
            <div className="flex gap-3 mt-5">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button className="flex-1" loading={createMutation.isPending} onClick={() => { if (newName.trim()) createMutation.mutate(newName.trim()); }}>Create</Button>
            </div>
          </div>
        </div>
      )}

      {showInvite && activeId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Invite Team Member</h3>
            <div className="space-y-3">
              <Input label="Email address" type="email" placeholder="colleague@company.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="ADMIN">Admin — full access, no billing</option>
                  <option value="MEMBER">Member — create and edit</option>
                  <option value="VIEWER">Viewer — read only</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">The person must already have a ScaleAfrique account.</p>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowInvite(false)}>Cancel</Button>
              <Button className="flex-1" loading={inviteMutation.isPending} onClick={() => { if (inviteEmail.trim()) inviteMutation.mutate({ wsId: activeId, email: inviteEmail.trim(), role: inviteRole }); }}>Send Invite</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
