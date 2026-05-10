'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus, Megaphone, Bot, Users, ArrowRight, Zap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { analyticsService } from '../services/analytics.service';
import { campaignService } from '../services/campaign.service';
import { StatsCard } from '../components/ui/StatsCard';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AIInsightWidget } from '../components/dashboard/AIInsightWidget';
import { MarketingCalendarWidget } from '../components/dashboard/MarketingCalendarWidget';
import { Spinner } from '../components/ui/Spinner';
import { formatNumber, formatRelativeDate } from '../utils/formatters';

const QUICK_ACTIONS = [
  { label: 'New Campaign', icon: Megaphone, to: '/campaigns/new', color: 'bg-primary-50 text-primary-600' },
  { label: 'AI Advisor', icon: Bot, to: '/ai-advisor', color: 'bg-amber-50 text-amber-600' },
  { label: 'Automations', icon: Zap, to: '/automations', color: 'bg-purple-50 text-purple-600' },
  { label: 'Community', icon: Users, to: '/community', color: 'bg-blue-50 text-blue-600' },
];

export function Dashboard() {
  const { user } = useAuthStore();

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsService.getDashboard('30d'),
    staleTime: 60_000,
  });

  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns', { page: 1, limit: 5 }],
    queryFn: () => campaignService.list(),
    staleTime: 30_000,
  });

  const summary = analytics?.summary;
  const recentCampaigns = campaignsData?.items?.slice(0, 5) ?? [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-500 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold">
          Good day, {user?.name?.split(' ')[0] ?? 'there'} 👋
        </h2>
        <p className="text-primary-100 text-sm mt-1">
          {user?.startupProfile?.companyName
            ? `Here's what's happening with ${user.startupProfile.companyName} today.`
            : "Here's your marketing overview for today."}
        </p>
        <Link href="/campaigns/new">
          <Button variant="secondary" size="sm" className="mt-4" icon={<Plus size={15} />}>
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Reach"
          value={summary?.impressions ?? 0}
          trend={summary?.impressions ? 12.4 : undefined}
          format="number"
          loading={analyticsLoading}
        />
        <StatsCard
          label="Clicks"
          value={summary?.clicks ?? 0}
          trend={summary?.clicks ? 8.1 : undefined}
          loading={analyticsLoading}
        />
        <StatsCard
          label="Conversions"
          value={summary?.conversions ?? 0}
          trend={summary?.conversions ? -3.2 : undefined}
          loading={analyticsLoading}
        />
        <StatsCard
          label="Active Campaigns"
          value={summary?.activeCampaigns ?? 0}
          format="raw"
          loading={analyticsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaigns */}
        <div className="lg:col-span-2 space-y-4">
          <Card padding={false}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Recent Campaigns</h3>
              <Link href="/campaigns" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {campaignsLoading ? (
              <div className="flex justify-center py-10">
                <Spinner size="md" className="text-primary-600" />
              </div>
            ) : recentCampaigns.length === 0 ? (
              <div className="text-center py-10 px-5">
                <p className="text-3xl mb-2">📣</p>
                <p className="text-sm font-medium text-gray-700">No campaigns yet</p>
                <p className="text-xs text-gray-500 mt-1 mb-3">Create your first campaign to start reaching customers.</p>
                <Link href="/campaigns/new">
                  <Button size="sm" icon={<Plus size={13} />}>Create campaign</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentCampaigns.map(c => (
                  <Link key={c.id} href={`/campaigns/${c.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.type} · {formatRelativeDate(c.createdAt)}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-center">
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{formatNumber(c.metrics?.impressions ?? 0)}</p>
                        <p className="text-xs text-gray-400">Reach</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{formatNumber(c.metrics?.clicks ?? 0)}</p>
                        <p className="text-xs text-gray-400">Clicks</p>
                      </div>
                    </div>
                    <Badge variant="status" status={c.status} dot>{c.status}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Quick actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map(({ label, icon: Icon, to, color }) => (
              <Link key={to} href={to}>
                <Card hover className="flex flex-col items-center gap-2 py-4 cursor-pointer text-center">
                  <div className={`p-3 rounded-xl ${color}`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <AIInsightWidget />
          <MarketingCalendarWidget />

          {/* Analytics snapshot */}
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
              <Link href="/analytics" className="text-xs text-primary-600 hover:underline">
                Full report
              </Link>
            </CardHeader>
            <div className="space-y-3">
              {[
                { label: 'CTR', value: summary?.ctr != null ? `${summary.ctr.toFixed(2)}%` : '—' },
                { label: 'Conv. Rate', value: summary?.convRate != null ? `${summary.convRate.toFixed(2)}%` : '—' },
                { label: 'Total Spend', value: summary?.spend != null ? `$${summary.spend.toFixed(0)}` : '—' },
                { label: 'Revenue', value: summary?.revenue != null ? `$${summary.revenue.toFixed(0)}` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
