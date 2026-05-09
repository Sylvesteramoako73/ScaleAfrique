'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, ArrowLeft, Copy, Users, MousePointer, TrendingUp, DollarSign } from 'lucide-react';
import { clsx } from 'clsx';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import { affiliateService, type AffiliateProgram, type Affiliate, type ProgramStats } from '../services/affiliate.service';

export function Affiliate() {
  const qc = useQueryClient();
  const [selectedProgram, setSelectedProgram] = useState<AffiliateProgram | null>(null);
  const [showNewProgram, setShowNewProgram] = useState(false);
  const [showAddAffiliate, setShowAddAffiliate] = useState(false);
  const [programForm, setProgramForm] = useState({ name: '', commissionRate: '10', cookieDays: '30' });
  const [affiliateForm, setAffiliateForm] = useState({ name: '', email: '' });

  const { data: programs = [], isLoading } = useQuery<AffiliateProgram[]>({ queryKey: ['affiliate-programs'], queryFn: affiliateService.listPrograms });

  const { data: affiliates = [], isLoading: affLoading } = useQuery<Affiliate[]>({
    queryKey: ['affiliates', selectedProgram?.id],
    queryFn: () => affiliateService.listAffiliates(selectedProgram!.id),
    enabled: !!selectedProgram,
  });

  const { data: stats } = useQuery<ProgramStats>({
    queryKey: ['affiliate-stats', selectedProgram?.id],
    queryFn: () => affiliateService.getStats(selectedProgram!.id),
    enabled: !!selectedProgram,
  });

  const createProgram = useMutation({
    mutationFn: () => affiliateService.createProgram({
      name: programForm.name,
      commissionRate: parseFloat(programForm.commissionRate),
      cookieDays: parseInt(programForm.cookieDays),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['affiliate-programs'] });
      setShowNewProgram(false);
      setProgramForm({ name: '', commissionRate: '10', cookieDays: '30' });
      toast.success('Program created');
    },
    onError: () => toast.error('Failed to create program'),
  });

  const addAffiliate = useMutation({
    mutationFn: () => affiliateService.addAffiliate(selectedProgram!.id, affiliateForm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['affiliates', selectedProgram?.id] });
      qc.invalidateQueries({ queryKey: ['affiliate-stats', selectedProgram?.id] });
      setShowAddAffiliate(false);
      setAffiliateForm({ name: '', email: '' });
      toast.success('Affiliate added');
    },
    onError: () => toast.error('Failed to add affiliate'),
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied!');
  };

  if (selectedProgram) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <button onClick={() => setSelectedProgram(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={16} /> Back to Programs
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{selectedProgram.name}</h2>
            <p className="text-sm text-gray-500">{selectedProgram.commissionRate}% commission · {selectedProgram.cookieDays}-day cookie</p>
          </div>
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowAddAffiliate(true)}>Add Affiliate</Button>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Affiliates', value: stats.affiliates, icon: <Users size={16} /> },
              { label: 'Total Clicks', value: stats.clicks.toLocaleString(), icon: <MousePointer size={16} /> },
              { label: 'Conversions', value: stats.conversions.toLocaleString(), icon: <TrendingUp size={16} /> },
              { label: 'Total Earnings', value: `$${stats.totalEarnings.toFixed(2)}`, icon: <DollarSign size={16} /> },
            ].map(({ label, value, icon }) => (
              <Card key={label}>
                <div className="flex items-center gap-2 text-gray-500 mb-1">{icon}<span className="text-xs">{label}</span></div>
                <div className="text-xl font-bold text-gray-900">{value}</div>
              </Card>
            ))}
          </div>
        )}

        {/* Affiliate link preview */}
        <Card>
          <p className="text-xs text-gray-500 mb-1 font-medium">Referral URL Format</p>
          <code className="text-xs bg-gray-50 border border-gray-200 rounded px-3 py-2 block text-gray-700">
            {typeof window !== 'undefined' ? window.location.origin : 'https://app.afrimarket.io'}/?ref=<span className="text-primary-600">[AFFILIATE_CODE]</span>
          </code>
        </Card>

        {/* Affiliates table */}
        <Card padding={false}>
          <div className="p-5 border-b border-gray-100">
            <CardTitle>Affiliates ({affiliates.length})</CardTitle>
          </div>
          {affLoading ? (
            <div className="flex justify-center p-8"><Spinner /></div>
          ) : affiliates.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-sm">No affiliates yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Name', 'Email', 'Code', 'Clicks', 'Conversions', 'Earnings'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {affiliates.map((a) => (
                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                      <td className="px-4 py-3 text-gray-600">{a.email}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => copyCode(a.code)} className="flex items-center gap-1.5 font-mono text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors">
                          {a.code}<Copy size={11} />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{a.clicks.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">{a.conversions.toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold text-green-700">${a.earnings.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Modal open={showAddAffiliate} onClose={() => setShowAddAffiliate(false)} title="Add Affiliate" footer={
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowAddAffiliate(false)}>Cancel</Button>
            <Button loading={addAffiliate.isPending} disabled={!affiliateForm.name || !affiliateForm.email} onClick={() => addAffiliate.mutate()}>Add Affiliate</Button>
          </div>
        }>
          <div className="space-y-3">
            <Input label="Name" value={affiliateForm.name} onChange={(e) => setAffiliateForm((f) => ({ ...f, name: e.target.value }))} />
            <Input label="Email" type="email" value={affiliateForm.email} onChange={(e) => setAffiliateForm((f) => ({ ...f, email: e.target.value }))} />
            <p className="text-xs text-gray-400">A unique referral code will be auto-generated.</p>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Affiliate Programs</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your affiliate and referral programs</p>
        </div>
        <Button icon={<Plus size={15} />} onClick={() => setShowNewProgram(true)}>New Program</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : programs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p>No programs yet. Create your first affiliate program!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((p) => (
            <div key={p.id} className="cursor-pointer" onClick={() => setSelectedProgram(p)}><Card>
              <div className="flex items-center justify-between mb-3">
                <span className={clsx('px-2 py-0.5 rounded text-xs font-semibold', p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                  {p.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400"><Users size={12} />{p._count?.affiliates ?? 0}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{p.name}</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-primary-600 font-bold">{p.commissionRate}% commission</span>
                <span className="text-gray-400">{p.cookieDays}d cookie</span>
              </div>
            </Card></div>
          ))}
        </div>
      )}

      <Modal open={showNewProgram} onClose={() => setShowNewProgram(false)} title="New Affiliate Program" footer={
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setShowNewProgram(false)}>Cancel</Button>
          <Button loading={createProgram.isPending} disabled={!programForm.name} onClick={() => createProgram.mutate()}>Create Program</Button>
        </div>
      }>
        <div className="space-y-3">
          <Input label="Program Name" value={programForm.name} onChange={(e) => setProgramForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Commission Rate (%)" type="number" value={programForm.commissionRate} onChange={(e) => setProgramForm((f) => ({ ...f, commissionRate: e.target.value }))} />
          <Input label="Cookie Duration (days)" type="number" value={programForm.cookieDays} onChange={(e) => setProgramForm((f) => ({ ...f, cookieDays: e.target.value }))} />
        </div>
      </Modal>
    </div>
  );
}
