'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Download, Sparkles, RefreshCw } from 'lucide-react';
import { analyticsService } from '../services/analytics.service';
import { aiService } from '../services/ai.service';
import { StatsCard } from '../components/ui/StatsCard';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { formatNumber } from '../utils/formatters';

const DATE_RANGES = ['7d', '30d', '90d', '1y'] as const;
type Range = typeof DATE_RANGES[number];

const CHANNEL_COLORS = ['#1B5E20', '#F9A825', '#1565C0', '#6A1B9A', '#B71C1C'];

// Fallback data when API not available
const MOCK_DAILY = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  impressions: Math.floor(1200 + Math.random() * 800),
  clicks: Math.floor(90 + Math.random() * 80),
  conversions: Math.floor(8 + Math.random() * 15),
  spend: Math.floor(40 + Math.random() * 30),
}));

const MOCK_CHANNELS = [
  { channel: 'WhatsApp', value: 38 },
  { channel: 'Facebook', value: 27 },
  { channel: 'Email', value: 18 },
  { channel: 'Instagram', value: 12 },
  { channel: 'Google Ads', value: 5 },
];

export function Analytics() {
  const [range, setRange] = useState<Range>('30d');

  const { data: analytics } = useQuery({
    queryKey: ['analytics', 'dashboard', range],
    queryFn: () => analyticsService.getDashboard(range),
  });

  const { data: insightsData, isLoading: insightsLoading, refetch: refetchInsights, isRefetching: insightsRefetching } = useQuery({
    queryKey: ['ai', 'insights'],
    queryFn: () => aiService.getInsights(),
    staleTime: 10 * 60_000,
    retry: 1,
  });

  const daily = analytics?.dailyData ?? MOCK_DAILY;
  const channels = analytics?.channelBreakdown ?? MOCK_CHANNELS;
  const summary = analytics?.summary;

  const handleExport = async () => {
    const blob = await analyticsService.exportReport('csv');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scaleafrique-analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-500">Real-time performance across all your campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {DATE_RANGES.map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  range === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Impressions" value={summary?.impressions ?? 183200} trend={14.2} />
        <StatsCard label="Total Clicks" value={summary?.clicks ?? 12400} trend={9.8} />
        <StatsCard label="Conversions" value={summary?.conversions ?? 1820} trend={-2.1} />
        <StatsCard label="Avg. ROI" value={`${(summary?.roi ?? 3.8).toFixed(1)}×`} trend={18.5} format="raw" />
      </div>

      {/* Line chart — reach over time */}
      <Card>
        <CardHeader>
          <CardTitle>Reach & Engagement Over Time</CardTitle>
          <div className="flex gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary-600 inline-block" /> Impressions</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-400 inline-block" /> Clicks</span>
          </div>
        </CardHeader>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={daily} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} interval={4} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => formatNumber(v)} />
            <Tooltip formatter={(v: number) => formatNumber(v)} />
            <Line type="monotone" dataKey="impressions" stroke="#1B5E20" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="clicks" stroke="#F9A825" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart — channel performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Channel</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={channels} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="channel" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {channels.map((_, i) => (
                  <Cell key={i} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie chart — audience split */}
        <Card>
          <CardHeader>
            <CardTitle>Audience Channel Split</CardTitle>
          </CardHeader>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={channels} dataKey="value" nameKey="channel" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                  {channels.map((_, i) => (
                    <Cell key={i} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {channels.map(({ channel, value }, i) => (
                <div key={channel} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHANNEL_COLORS[i % CHANNEL_COLORS.length] }} />
                    <span className="text-xs text-gray-600">{channel}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-900">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* AI Insights panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-amber-500" />
            <CardTitle>AI Insights</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="info">Auto-generated</Badge>
            <button
              onClick={() => refetchInsights()}
              disabled={insightsRefetching}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors disabled:opacity-50"
              title="Refresh insights"
            >
              <RefreshCw size={13} className={insightsRefetching ? 'animate-spin' : ''} />
            </button>
          </div>
        </CardHeader>
        {insightsLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="md" className="text-amber-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(insightsData?.insights ?? [
              'Your WhatsApp campaigns are outperforming email by 3.2× on open rates. Consider reallocating 15% of email budget.',
              'Peak engagement occurs at 7–9 PM WAT. Scheduling posts in this window could boost reach by up to 28%.',
              'Nigerian and Ghanaian audiences show the highest conversion rates. Expand targeting to Ivory Coast next.',
              'Video content is generating 4× more shares than static images. A short product video could significantly lift ROI.',
            ]).map((insight, i) => {
              const icons = ['📈', '🕐', '🌍', '💡', '🚀'];
              return (
                <div key={i} className="flex gap-3 p-3 bg-amber-50 rounded-xl">
                  <span className="text-xl shrink-0">{icons[i % icons.length]}</span>
                  <p className="text-xs text-gray-700 leading-relaxed">{insight}</p>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
