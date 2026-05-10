'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import { influencerService, Influencer, InfluencerRequest } from '../services/influencer.service';

const PLATFORMS = ['All', 'Instagram', 'Twitter', 'TikTok', 'YouTube', 'LinkedIn'];
const COUNTRIES = ['All', 'Nigeria', 'Kenya', 'Ghana', 'South Africa', 'Egypt', 'Ethiopia', 'Tanzania', 'Uganda', 'Senegal', 'Ivory Coast', 'Cameroon', 'Rwanda'];
const CATEGORIES = ['All', 'Tech', 'Business', 'Fashion', 'Food', 'Finance', 'Health', 'Travel', 'Agriculture', 'Lifestyle'];

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: 'bg-pink-100 text-pink-700',
  Twitter: 'bg-sky-100 text-sky-700',
  TikTok: 'bg-gray-900 text-white',
  YouTube: 'bg-red-100 text-red-700',
  LinkedIn: 'bg-blue-100 text-blue-700',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  DECLINED: 'bg-red-100 text-red-700',
};

const AVATAR_COLORS = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-pink-500', 'bg-indigo-500'];

function formatFollowers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export function Influencers() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'Discover' | 'My Requests'>('Discover');
  const [platform, setPlatform] = useState('All');
  const [country, setCountry] = useState('All');
  const [category, setCategory] = useState('All');
  const [contactTarget, setContactTarget] = useState<Influencer | null>(null);
  const [requestForm, setRequestForm] = useState({ campaignName: '', message: '', budget: '' });

  const { data: influencers = [], isLoading } = useQuery<Influencer[]>({
    queryKey: ['influencers', platform, country, category],
    queryFn: () => influencerService.list({
      platform: platform !== 'All' ? platform : undefined,
      country: country !== 'All' ? country : undefined,
      category: category !== 'All' ? category : undefined,
    }),
  });

  const { data: requests = [], isLoading: reqLoading } = useQuery<InfluencerRequest[]>({
    queryKey: ['influencer-requests'],
    queryFn: influencerService.listRequests,
    enabled: tab === 'My Requests',
  });

  const sendRequest = useMutation({
    mutationFn: () => influencerService.createRequest({
      influencerId: contactTarget!.id,
      campaignName: requestForm.campaignName,
      message: requestForm.message,
      budget: parseFloat(requestForm.budget) || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['influencer-requests'] });
      setContactTarget(null);
      setRequestForm({ campaignName: '', message: '', budget: '' });
      toast.success('Request sent!');
    },
    onError: () => toast.error('Failed to send request'),
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Influencer Marketing</h1>
        <p className="text-sm text-gray-500 mt-1">Discover and collaborate with African influencers</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100">
        {(['Discover', 'My Requests'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={clsx('px-5 py-2.5 text-sm font-medium border-b-2 transition-colors', tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700')}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Discover' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Platform', value: platform, options: PLATFORMS, onChange: setPlatform },
              { label: 'Country', value: country, options: COUNTRIES, onChange: setCountry },
              { label: 'Category', value: category, options: CATEGORIES, onChange: setCategory },
            ].map(({ label, value, options, onChange }) => (
              <div key={label}>
                <select
                  className="rounded-lg border border-gray-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                >
                  {options.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : influencers.length === 0 ? (
            <p className="text-center text-gray-400 py-12">No influencers found for these filters.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {influencers.map((inf, idx) => (
                <Card key={inf.id} hover>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={clsx('w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0', AVATAR_COLORS[idx % AVATAR_COLORS.length])}>
                      {inf.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-semibold text-gray-900 truncate">{inf.name}</p>
                        {inf.isVerified && <CheckCircle size={14} className="text-blue-500 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 truncate">@{inf.handle}</p>
                      <p className="text-xs text-gray-400">{inf.country}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className={clsx('px-2 py-0.5 rounded text-xs font-semibold', PLATFORM_COLORS[inf.platform] ?? 'bg-gray-100 text-gray-600')}>
                      {inf.platform}
                    </span>
                    {inf.category && <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">{inf.category}</span>}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{formatFollowers(inf.followers)}</p>
                      <p className="text-xs text-gray-400">Followers</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{inf.engagementRate.toFixed(1)}%</p>
                      <p className="text-xs text-gray-400">Engagement</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{inf.pricePerPost ? `$${inf.pricePerPost}` : 'N/A'}</p>
                      <p className="text-xs text-gray-400">Per post</p>
                    </div>
                  </div>
                  <Button size="sm" fullWidth variant="outline" onClick={() => setContactTarget(inf)}>Contact</Button>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'My Requests' && (
        <Card padding={false}>
          {reqLoading ? (
            <div className="flex justify-center p-8"><Spinner /></div>
          ) : requests.length === 0 ? (
            <p className="text-center text-gray-400 py-12">No requests sent yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Influencer', 'Campaign', 'Budget', 'Status', 'Date'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{r.influencer.name}</td>
                      <td className="px-4 py-3 text-gray-700">{r.campaignName}</td>
                      <td className="px-4 py-3 text-gray-600">{r.budget ? `$${r.budget}` : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={clsx('px-2 py-0.5 rounded text-xs font-semibold', STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-600')}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Contact Modal */}
      <Modal open={!!contactTarget} onClose={() => setContactTarget(null)} title={`Contact ${contactTarget?.name ?? ''}`} footer={
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setContactTarget(null)}>Cancel</Button>
          <Button loading={sendRequest.isPending} disabled={!requestForm.campaignName || !requestForm.message} onClick={() => sendRequest.mutate()}>Send Request</Button>
        </div>
      }>
        <div className="space-y-3">
          <Input label="Campaign Name" value={requestForm.campaignName} onChange={(e) => setRequestForm((f) => ({ ...f, campaignName: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" rows={4} value={requestForm.message} onChange={(e) => setRequestForm((f) => ({ ...f, message: e.target.value }))} placeholder="Describe your campaign and collaboration request..." />
          </div>
          <Input label="Budget ($)" type="number" value={requestForm.budget} onChange={(e) => setRequestForm((f) => ({ ...f, budget: e.target.value }))} placeholder="Optional" />
        </div>
      </Modal>
    </div>
  );
}
