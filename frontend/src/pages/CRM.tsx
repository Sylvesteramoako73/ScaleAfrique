'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Users, TrendingUp, DollarSign, Target, Mail, Phone, Building, ChevronRight, Star } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { crmService, type Contact, type Lead, type Deal } from '../services/crm.service';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { formatNumber } from '../utils/formatters';

type Tab = 'overview' | 'contacts' | 'leads' | 'deals';

const LEAD_STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-yellow-100 text-yellow-700',
  QUALIFIED: 'bg-green-100 text-green-700',
  CONVERTED: 'bg-primary-100 text-primary-700',
  LOST: 'bg-red-100 text-red-700',
};

const DEFAULT_STAGES = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'];

export function CRM() {
  const [tab, setTab] = useState<Tab>('overview');
  const [search, setSearch] = useState('');
  const [showNewContact, setShowNewContact] = useState(false);
  const [showNewLead, setShowNewLead] = useState(false);
  const [showNewDeal, setShowNewDeal] = useState(false);
  const [newContact, setNewContact] = useState({ firstName: '', lastName: '', email: '', phone: '', company: '' });
  const [newLead, setNewLead] = useState({ name: '', email: '', company: '', source: '', value: '' });
  const [newDeal, setNewDeal] = useState({ title: '', value: '', stage: DEFAULT_STAGES[0], contactName: '' });
  const qc = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['crm', 'dashboard'], queryFn: () => crmService.getDashboard(), staleTime: 60_000,
  });
  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ['crm', 'contacts', search], queryFn: () => crmService.listContacts({ search: search || undefined }),
    staleTime: 30_000, enabled: tab === 'contacts' || tab === 'overview',
  });
  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ['crm', 'leads'], queryFn: () => crmService.listLeads(),
    staleTime: 30_000, enabled: tab === 'leads' || tab === 'overview',
  });
  const { data: pipelines } = useQuery({
    queryKey: ['crm', 'pipelines'], queryFn: () => crmService.listPipelines(), staleTime: 120_000,
  });
  const { data: deals, isLoading: dealsLoading } = useQuery({
    queryKey: ['crm', 'deals'], queryFn: () => crmService.listDeals(), staleTime: 30_000, enabled: tab === 'deals',
  });

  const createContact = useMutation({
    mutationFn: (d: Partial<Contact>) => crmService.createContact(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['crm'] }); toast.success('Contact added'); setShowNewContact(false); setNewContact({ firstName: '', lastName: '', email: '', phone: '', company: '' }); },
    onError: () => toast.error('Failed to add contact'),
  });
  const createLead = useMutation({
    mutationFn: (d: Partial<Lead>) => crmService.createLead(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['crm'] }); toast.success('Lead added'); setShowNewLead(false); setNewLead({ name: '', email: '', company: '', source: '', value: '' }); },
    onError: () => toast.error('Failed to add lead'),
  });
  const updateLead = useMutation({
    mutationFn: ({ id, ...d }: Partial<Lead> & { id: string }) => crmService.updateLead(id, d),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crm', 'leads'] }),
  });
  const updateDeal = useMutation({
    mutationFn: ({ id, ...d }: Partial<Deal> & { id: string }) => crmService.updateDeal(id, d),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crm', 'deals'] }),
  });

  const contacts = contactsData?.contacts ?? [];
  const leads = leadsData?.leads ?? [];
  const allDeals = deals ?? [];
  const firstPipeline = pipelines?.[0];
  const stages = (() => { try { return firstPipeline ? JSON.parse(firstPipeline.stages) as string[] : DEFAULT_STAGES; } catch { return DEFAULT_STAGES; } })();
  const dealsByStage = stages.reduce<Record<string, Deal[]>>((acc, s) => { acc[s] = allDeals.filter(d => d.stage === s); return acc; }, {});

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">CRM</h2>
          <p className="text-sm text-gray-500">Manage contacts, leads, and your sales pipeline</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={() => setShowNewContact(true)}>Contact</Button>
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowNewLead(true)}>Add Lead</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? <div className="col-span-4 flex justify-center py-6"><Spinner size="md" className="text-primary-600" /></div> : <>
          {[
            { icon: <Users size={18} className="text-blue-600" />, bg: 'bg-blue-50', val: stats?.totalContacts ?? 0, label: 'Contacts' },
            { icon: <Target size={18} className="text-amber-600" />, bg: 'bg-amber-50', val: stats?.totalLeads ?? 0, label: 'Leads' },
            { icon: <TrendingUp size={18} className="text-primary-600" />, bg: 'bg-primary-50', val: stats?.totalDeals ?? 0, label: 'Deals' },
            { icon: <DollarSign size={18} className="text-green-600" />, bg: 'bg-green-50', val: `$${formatNumber(stats?.totalDealValue ?? 0)}`, label: 'Pipeline Value', raw: true },
          ].map(({ icon, bg, val, label, raw }) => (
            <Card key={label} className="flex items-center gap-3 p-4">
              <div className={clsx('p-2.5 rounded-xl', bg)}>{icon}</div>
              <div><p className="text-2xl font-bold text-gray-900">{raw ? val : formatNumber(val as number)}</p><p className="text-xs text-gray-500">{label}</p></div>
            </Card>
          ))}
        </>}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['overview', 'contacts', 'leads', 'deals'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={clsx('px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors', tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
            {t === 'deals' ? 'Pipeline' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card padding={false}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <CardTitle>Recent Contacts</CardTitle>
              <button onClick={() => setTab('contacts')} className="text-xs text-primary-600 hover:underline flex items-center gap-1">View all <ChevronRight size={12} /></button>
            </div>
            {contactsLoading ? <div className="flex justify-center py-8"><Spinner size="sm" className="text-primary-600" /></div> : contacts.length === 0 ? (
              <div className="text-center py-10"><p className="text-sm text-gray-400">No contacts yet.</p><Button size="sm" className="mt-3" icon={<Plus size={13} />} onClick={() => setShowNewContact(true)}>Add contact</Button></div>
            ) : (
              <div className="divide-y divide-gray-50">
                {contacts.slice(0, 6).map(c => (
                  <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-semibold shrink-0">{c.firstName[0]}</div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900">{c.firstName} {c.lastName}</p><p className="text-xs text-gray-400">{c.company ?? c.email ?? '—'}</p></div>
                    <div className="flex items-center gap-1 text-xs text-gray-400"><Star size={11} className="text-amber-400" />{c.score}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card padding={false}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <CardTitle>Recent Leads</CardTitle>
              <button onClick={() => setTab('leads')} className="text-xs text-primary-600 hover:underline flex items-center gap-1">View all <ChevronRight size={12} /></button>
            </div>
            {leadsLoading ? <div className="flex justify-center py-8"><Spinner size="sm" className="text-primary-600" /></div> : leads.length === 0 ? (
              <div className="text-center py-10"><p className="text-sm text-gray-400">No leads yet.</p><Button size="sm" className="mt-3" icon={<Plus size={13} />} onClick={() => setShowNewLead(true)}>Add lead</Button></div>
            ) : (
              <div className="divide-y divide-gray-50">
                {leads.slice(0, 6).map(l => (
                  <div key={l.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900">{l.name}</p><p className="text-xs text-gray-400">{l.company ?? l.source ?? '—'}</p></div>
                    <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', LEAD_STATUS_COLORS[l.status] ?? 'bg-gray-100 text-gray-600')}>{l.status}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Contacts */}
      {tab === 'contacts' && (
        <Card padding={false}>
          <div className="p-4 border-b border-gray-100">
            <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input placeholder="Search contacts…" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /></div>
          </div>
          {contactsLoading ? <div className="flex justify-center py-10"><Spinner size="md" className="text-primary-600" /></div> : contacts.length === 0 ? (
            <div className="text-center py-12"><p className="text-3xl mb-2">👥</p><p className="text-sm font-medium text-gray-700 mb-1">No contacts yet</p><Button size="sm" icon={<Plus size={13} />} onClick={() => setShowNewContact(true)}>Add first contact</Button></div>
          ) : (
            <div className="divide-y divide-gray-50">
              {contacts.map(c => (
                <div key={c.id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold shrink-0">{c.firstName[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{c.firstName} {c.lastName}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {c.email && <span className="flex items-center gap-1 text-xs text-gray-400"><Mail size={11} />{c.email}</span>}
                      {c.phone && <span className="flex items-center gap-1 text-xs text-gray-400"><Phone size={11} />{c.phone}</span>}
                      {c.company && <span className="flex items-center gap-1 text-xs text-gray-400"><Building size={11} />{c.company}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0"><Star size={11} className="text-amber-400" />{c.score}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Leads */}
      {tab === 'leads' && (
        <Card padding={false}>
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <CardTitle>All Leads</CardTitle>
            <Button size="sm" variant="outline" icon={<Plus size={13} />} onClick={() => setShowNewLead(true)}>New lead</Button>
          </div>
          {leadsLoading ? <div className="flex justify-center py-10"><Spinner size="md" className="text-primary-600" /></div> : leads.length === 0 ? (
            <div className="text-center py-12"><p className="text-3xl mb-2">🎯</p><p className="text-sm font-medium text-gray-700 mb-3">No leads yet</p><Button size="sm" icon={<Plus size={13} />} onClick={() => setShowNewLead(true)}>Add first lead</Button></div>
          ) : (
            <div className="divide-y divide-gray-50">
              {leads.map(l => (
                <div key={l.id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{l.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">{l.email && <span className="text-xs text-gray-400">{l.email}</span>}{l.company && <span className="text-xs text-gray-400">{l.company}</span>}{l.source && <span className="text-xs text-gray-400">via {l.source}</span>}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {l.value != null && <span className="text-xs font-semibold text-gray-700">${formatNumber(l.value)}</span>}
                    <select value={l.status} onChange={e => updateLead.mutate({ id: l.id, status: e.target.value as Lead['status'] })} className={clsx('text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none', LEAD_STATUS_COLORS[l.status] ?? 'bg-gray-100 text-gray-600')}>
                      {['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Pipeline / Kanban */}
      {tab === 'deals' && (
        <div className="space-y-4">
          <div className="flex justify-end"><Button size="sm" icon={<Plus size={13} />} onClick={() => setShowNewDeal(true)}>New deal</Button></div>
          {dealsLoading ? <div className="flex justify-center py-10"><Spinner size="md" className="text-primary-600" /></div> : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {stages.map(stage => {
                const stageDeals = dealsByStage[stage] ?? [];
                const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);
                const stageIdx = stages.indexOf(stage);
                return (
                  <div key={stage} className="flex-shrink-0 w-60 bg-gray-50 rounded-2xl p-3">
                    <div className="mb-3"><p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{stage}</p><p className="text-xs text-gray-400">{stageDeals.length} deal{stageDeals.length !== 1 ? 's' : ''} · ${formatNumber(stageValue)}</p></div>
                    <div className="space-y-2">
                      {stageDeals.map(deal => (
                        <div key={deal.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:border-primary-200 transition-colors group">
                          <p className="text-sm font-medium text-gray-900 mb-1">{deal.title}</p>
                          {deal.contactName && <p className="text-xs text-gray-400 mb-2">{deal.contactName}</p>}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-primary-600">${formatNumber(deal.value)}</span>
                            <div className="flex items-center gap-1"><div className="w-10 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-primary-500 rounded-full" style={{ width: `${deal.probability}%` }} /></div><span className="text-xs text-gray-400">{deal.probability}%</span></div>
                          </div>
                          <div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {stageIdx > 0 && <button onClick={() => updateDeal.mutate({ id: deal.id, stage: stages[stageIdx - 1] })} className="flex-1 text-xs py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600">← Back</button>}
                            {stageIdx < stages.length - 1 && <button onClick={() => updateDeal.mutate({ id: deal.id, stage: stages[stageIdx + 1] })} className="flex-1 text-xs py-1 rounded bg-primary-50 hover:bg-primary-100 text-primary-700">Next →</button>}
                          </div>
                        </div>
                      ))}
                      {stageDeals.length === 0 && <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-xl"><p className="text-xs text-gray-400">No deals</p></div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showNewContact && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Add Contact</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="First name *" value={newContact.firstName} onChange={e => setNewContact(f => ({ ...f, firstName: e.target.value }))} />
                <Input label="Last name" value={newContact.lastName} onChange={e => setNewContact(f => ({ ...f, lastName: e.target.value }))} />
              </div>
              <Input label="Email" type="email" value={newContact.email} onChange={e => setNewContact(f => ({ ...f, email: e.target.value }))} />
              <Input label="Phone" value={newContact.phone} onChange={e => setNewContact(f => ({ ...f, phone: e.target.value }))} />
              <Input label="Company" value={newContact.company} onChange={e => setNewContact(f => ({ ...f, company: e.target.value }))} />
            </div>
            <div className="flex gap-3 mt-5">
              <Button variant="outline" className="flex-1" onClick={() => setShowNewContact(false)}>Cancel</Button>
              <Button className="flex-1" loading={createContact.isPending} onClick={() => { if (!newContact.firstName.trim()) { toast.error('First name required'); return; } createContact.mutate(newContact); }}>Add Contact</Button>
            </div>
          </div>
        </div>
      )}

      {showNewLead && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Add Lead</h3>
            <div className="space-y-3">
              <Input label="Name *" value={newLead.name} onChange={e => setNewLead(f => ({ ...f, name: e.target.value }))} />
              <Input label="Email" type="email" value={newLead.email} onChange={e => setNewLead(f => ({ ...f, email: e.target.value }))} />
              <Input label="Company" value={newLead.company} onChange={e => setNewLead(f => ({ ...f, company: e.target.value }))} />
              <Input label="Estimated value ($)" type="number" value={newLead.value} onChange={e => setNewLead(f => ({ ...f, value: e.target.value }))} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select value={newLead.source} onChange={e => setNewLead(f => ({ ...f, source: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Select source</option>
                  {['Website', 'Referral', 'Social Media', 'Email Campaign', 'Cold Outreach', 'Event', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button variant="outline" className="flex-1" onClick={() => setShowNewLead(false)}>Cancel</Button>
              <Button className="flex-1" loading={createLead.isPending} onClick={() => { if (!newLead.name.trim()) { toast.error('Name required'); return; } createLead.mutate({ ...newLead, value: newLead.value ? Number(newLead.value) : undefined }); }}>Add Lead</Button>
            </div>
          </div>
        </div>
      )}

      {showNewDeal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Add Deal</h3>
            <div className="space-y-3">
              <Input label="Deal title *" value={newDeal.title} onChange={e => setNewDeal(f => ({ ...f, title: e.target.value }))} />
              <Input label="Value ($)" type="number" value={newDeal.value} onChange={e => setNewDeal(f => ({ ...f, value: e.target.value }))} />
              <Input label="Contact name" value={newDeal.contactName} onChange={e => setNewDeal(f => ({ ...f, contactName: e.target.value }))} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                <select value={newDeal.stage} onChange={e => setNewDeal(f => ({ ...f, stage: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {stages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button variant="outline" className="flex-1" onClick={() => setShowNewDeal(false)}>Cancel</Button>
              <Button className="flex-1" onClick={async () => {
                if (!newDeal.title.trim()) { toast.error('Title required'); return; }
                let pipelineId = firstPipeline?.id;
                if (!pipelineId) {
                  const p = await crmService.createPipeline('Sales Pipeline', DEFAULT_STAGES);
                  pipelineId = p.id;
                  qc.invalidateQueries({ queryKey: ['crm', 'pipelines'] });
                }
                await crmService.createDeal({ title: newDeal.title, value: newDeal.value ? Number(newDeal.value) : 0, stage: newDeal.stage, contactName: newDeal.contactName || undefined, pipelineId });
                qc.invalidateQueries({ queryKey: ['crm', 'deals'] });
                qc.invalidateQueries({ queryKey: ['crm', 'dashboard'] });
                toast.success('Deal added');
                setShowNewDeal(false);
                setNewDeal({ title: '', value: '', stage: DEFAULT_STAGES[0], contactName: '' });
              }}>Add Deal</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
