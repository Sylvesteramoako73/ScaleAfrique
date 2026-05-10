'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import { useCampaigns, useLaunchCampaign, useDeleteCampaign } from '../hooks/useCampaigns';
import { CampaignCard } from '../components/campaigns/CampaignCard';
import { Button } from '../components/ui/Button';
import { StatsCard } from '../components/ui/StatsCard';
import { Spinner } from '../components/ui/Spinner';

const FILTERS = ['All', 'EMAIL', 'SOCIAL', 'ADS', 'MULTI_CHANNEL'] as const;
type Filter = typeof FILTERS[number];

const STATUS_TABS = ['All', 'ACTIVE', 'SCHEDULED', 'DRAFT', 'COMPLETED'];

export function Campaigns() {
  const [typeFilter, setTypeFilter] = useState<Filter>('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useCampaigns({
    type: typeFilter === 'All' ? undefined : typeFilter,
    status: statusFilter === 'All' ? undefined : statusFilter,
  });
  const { mutate: launch } = useLaunchCampaign();
  const { mutate: remove } = useDeleteCampaign();

  const campaigns = (data?.items ?? []).filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    total: data?.total ?? 0,
    active: campaigns.filter(c => c.status === 'ACTIVE').length,
    scheduled: campaigns.filter(c => c.status === 'SCHEDULED').length,
    completed: campaigns.filter(c => c.status === 'COMPLETED').length,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Campaigns</h2>
          <p className="text-sm text-gray-500">Manage and track all your marketing campaigns</p>
        </div>
        <Link href="/campaigns/new">
          <Button icon={<Plus size={16} />}>New Campaign</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard label="Total Campaigns" value={counts.total} format="raw" />
        <StatsCard label="Active" value={counts.active} format="raw" />
        <StatsCard label="Scheduled" value={counts.scheduled} format="raw" />
        <StatsCard label="Completed" value={counts.completed} format="raw" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                typeFilter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f === 'MULTI_CHANNEL' ? 'Multi' : f}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {STATUS_TABS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" className="text-primary-600" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📣</p>
          <h3 className="text-lg font-semibold text-gray-900">No campaigns yet</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">Launch your first campaign and start reaching customers across Africa.</p>
          <Link href="/campaigns/new">
            <Button icon={<Plus size={15} />}>Create first campaign</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map(c => (
            <CampaignCard
              key={c.id}
              campaign={c}
              onLaunch={launch}
              onDelete={remove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
