'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, TrendingUp, DollarSign, Users, MousePointer, GitBranch, MessageSquare, Filter, Crosshair } from 'lucide-react';
import { clsx } from 'clsx';
import { api } from '../services/api';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';

type Days = 7 | 30 | 90;

interface BIReport {
  kpis: {
    revenue: number; spend: number; roi: number;
    clicks: number; impressions: number; conversions: number; ctr: number;
    orders: number; orderRevenue: number;
    contacts: number; leads: number; wonDeals: number; wonRevenue: number; pipelineValue: number;
    funnelLeads: number; chatSessions: number;
  };
  chart: { date: string; revenue: number; clicks: number; conversions: number }[];
  topCampaigns: { id: string; name: string; type: string; status: string; impressions: number; clicks: number; conversions: number; revenue: number; spend: number; ctr: number }[];
}

const RANGE_OPTIONS: { label: string; days: Days }[] = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

function fmt(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(Math.round(n)); }
function money(n: number) { return `$${n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n.toFixed(0)}`; }
function pct(n: number) { return `${n.toFixed(1)}%`; }

function KPI({ label, value, icon, sub, positive }: { label: string; value: string; icon: React.ReactNode; sub?: string; positive?: boolean }) {
  return (
    <Card className="flex items-start gap-3">
      <div className="p-2 rounded-xl bg-primary-50 text-primary-600 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
        {sub && <p className={clsx('text-xs mt-0.5', positive === false ? 'text-red-500' : 'text-gray-400')}>{sub}</p>}
      </div>
    </Card>
  );
}

function BarChart({ data }: { data: BIReport['chart'] }) {
  const max = Math.max(...data.map(d => d.revenue), 1);
  return (
    <div className="flex items-end gap-1 h-32 w-full">
      {data.map((d, i) => {
        const height = Math.max((d.revenue / max) * 100, 2);
        const label = d.date.slice(5); // MM-DD
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute bottom-8 hidden group-hover:flex flex-col items-center z-10">
              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                {d.date}: {money(d.revenue)}
              </div>
              <div className="w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
            </div>
            <div
              className="w-full rounded-t-sm bg-primary-500 hover:bg-primary-600 transition-colors cursor-pointer"
              style={{ height: `${height}%` }}
            />
            {data.length <= 14 && (
              <span className="text-[9px] text-gray-400 rotate-45 origin-left translate-x-1">{label}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function exportCSV(campaigns: BIReport['topCampaigns']) {
  const header = 'Campaign,Type,Status,Impressions,Clicks,Conversions,CTR%,Revenue,Spend';
  const rows = campaigns.map(c =>
    [c.name, c.type, c.status, c.impressions, c.clicks, c.conversions, c.ctr.toFixed(2), c.revenue.toFixed(2), c.spend.toFixed(2)].join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'bi-report.csv'; a.click();
  URL.revokeObjectURL(url);
}

export function BIEngine() {
  const [days, setDays] = useState<Days>(30);

  const { data, isLoading, error } = useQuery({
    queryKey: ['bi', 'report', days],
    queryFn: async () => {
      const r = await api.get(`/bi/report?days=${days}`);
      return r.data.data as BIReport;
    },
    staleTime: 60_000,
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">BI Engine</h2>
          <p className="text-sm text-gray-500">Real-time insights across your entire platform</p>
        </div>
        <div className="flex items-center gap-2">
          {RANGE_OPTIONS.map(o => (
            <button
              key={o.days}
              onClick={() => setDays(o.days)}
              className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', days === o.days ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" className="text-primary-600" /></div>
      ) : error || !data ? (
        <Card className="text-center py-12">
          <p className="text-sm text-gray-500">No data yet. Start running campaigns to see insights here.</p>
        </Card>
      ) : (
        <>
          {/* KPI grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <KPI label="Total Revenue" value={money(data.kpis.revenue)} icon={<DollarSign size={16} />} sub={`${money(data.kpis.orderRevenue)} from store`} />
            <KPI label="Ad Spend" value={money(data.kpis.spend)} icon={<TrendingUp size={16} />} sub={`ROI: ${pct(data.kpis.roi)}`} positive={data.kpis.roi >= 0} />
            <KPI label="Clicks" value={fmt(data.kpis.clicks)} icon={<MousePointer size={16} />} sub={`CTR: ${pct(data.kpis.ctr)}`} />
            <KPI label="Conversions" value={fmt(data.kpis.conversions)} icon={<Crosshair size={16} />} sub={`${data.kpis.orders} orders`} />
            <KPI label="CRM Contacts" value={fmt(data.kpis.contacts)} icon={<Users size={16} />} sub={`${data.kpis.leads} leads`} />
            <KPI label="Won Deals" value={`${data.kpis.wonDeals}`} icon={<GitBranch size={16} />} sub={`${money(data.kpis.wonRevenue)} value`} />
            <KPI label="Funnel Leads" value={fmt(data.kpis.funnelLeads)} icon={<Filter size={16} />} sub={`last ${days}d`} />
            <KPI label="Chat Sessions" value={fmt(data.kpis.chatSessions)} icon={<MessageSquare size={16} />} sub={`last ${days}d`} />
          </div>

          {/* Revenue chart */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Revenue Over Time</CardTitle>
              <span className="text-xs text-gray-400">Campaigns + Store</span>
            </div>
            {data.chart.every(d => d.revenue === 0) ? (
              <div className="h-32 flex items-center justify-center text-sm text-gray-400">No revenue data for this period</div>
            ) : (
              <BarChart data={data.chart} />
            )}
          </Card>

          {/* Top campaigns table */}
          <Card padding={false}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <CardTitle>Top Campaigns</CardTitle>
              <Button size="sm" variant="outline" icon={<Download size={13} />} onClick={() => exportCSV(data.topCampaigns)}>Export CSV</Button>
            </div>
            {!data.topCampaigns.length ? (
              <p className="text-sm text-gray-400 text-center py-8">No campaign data yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      {['Campaign', 'Type', 'Status', 'Impressions', 'Clicks', 'CTR', 'Conversions', 'Revenue'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.topCampaigns.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 max-w-[160px] truncate">{c.name}</td>
                        <td className="px-4 py-3 text-gray-500 capitalize">{c.type?.toLowerCase()}</td>
                        <td className="px-4 py-3">
                          <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>{c.status}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{fmt(c.impressions)}</td>
                        <td className="px-4 py-3 text-gray-600">{fmt(c.clicks)}</td>
                        <td className="px-4 py-3 text-gray-600">{pct(c.ctr)}</td>
                        <td className="px-4 py-3 text-gray-600">{fmt(c.conversions)}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{money(c.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Pipeline snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="text-center">
              <p className="text-xs text-gray-500 mb-1">Pipeline Value</p>
              <p className="text-2xl font-bold text-gray-900">{money(data.kpis.pipelineValue)}</p>
            </Card>
            <Card className="text-center">
              <p className="text-xs text-gray-500 mb-1">Store Orders</p>
              <p className="text-2xl font-bold text-gray-900">{data.kpis.orders}</p>
            </Card>
            <Card className="text-center">
              <p className="text-xs text-gray-500 mb-1">Impressions</p>
              <p className="text-2xl font-bold text-gray-900">{fmt(data.kpis.impressions)}</p>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
