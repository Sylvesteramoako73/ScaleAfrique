'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { RefreshCw, X, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { socialService, SocialKeyword, SocialMention, SocialStats } from '../services/social.service';

type SentimentTab = 'All' | 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

const platformColors: Record<string, string> = {
  twitter: 'bg-blue-100 text-blue-700',
  reddit: 'bg-orange-100 text-orange-700',
  news: 'bg-gray-100 text-gray-700',
  linkedin: 'bg-blue-100 text-blue-800',
};

const sentimentColors: Record<string, string> = {
  POSITIVE: 'bg-green-100 text-green-700',
  NEGATIVE: 'bg-red-100 text-red-700',
  NEUTRAL: 'bg-gray-100 text-gray-600',
};

function daysAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  return d === 0 ? 'Today' : `${d}d ago`;
}

export function SocialListening() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<SentimentTab>('All');
  const [keyword, setKeyword] = useState('');

  const { data: stats, isLoading: statsLoading } = useQuery<SocialStats>({
    queryKey: ['social-stats'],
    queryFn: socialService.getStats,
  });

  const { data: keywords = [], isLoading: kwLoading } = useQuery<SocialKeyword[]>({
    queryKey: ['social-keywords'],
    queryFn: socialService.getKeywords,
  });

  const { data: mentions = [], isLoading: mentionsLoading } = useQuery<SocialMention[]>({
    queryKey: ['social-mentions', tab],
    queryFn: () => socialService.getMentions(undefined, tab === 'All' ? undefined : tab),
  });

  const addKw = useMutation({
    mutationFn: () => socialService.addKeyword(keyword),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['social-keywords'] });
      setKeyword('');
      toast.success('Keyword added');
    },
    onError: () => toast.error('Failed to add keyword'),
  });

  const removeKw = useMutation({
    mutationFn: (id: string) => socialService.removeKeyword(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['social-keywords'] }),
    onError: () => toast.error('Failed to remove keyword'),
  });

  const refresh = useMutation({
    mutationFn: socialService.refresh,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['social-mentions'] });
      qc.invalidateQueries({ queryKey: ['social-stats'] });
      toast.success(`Refreshed — ${data.added} new mentions`);
    },
    onError: () => toast.error('Refresh failed'),
  });

  const tabs: SentimentTab[] = ['All', 'POSITIVE', 'NEGATIVE', 'NEUTRAL'];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Listening</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor brand mentions across platforms</p>
        </div>
        <Button
          variant="outline"
          icon={<RefreshCw size={15} />}
          loading={refresh.isPending}
          onClick={() => refresh.mutate()}
        >
          Refresh
        </Button>
      </div>

      {/* Stats row */}
      {statsLoading ? (
        <div className="flex justify-center py-4"><Spinner /></div>
      ) : stats ? (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, cls: 'bg-blue-50 text-blue-700' },
            { label: 'Positive', value: stats.positive, cls: 'bg-green-50 text-green-700' },
            { label: 'Negative', value: stats.negative, cls: 'bg-red-50 text-red-700' },
            { label: 'Neutral', value: stats.neutral, cls: 'bg-gray-50 text-gray-700' },
          ].map(({ label, value, cls }) => (
            <Card key={label} className={clsx('text-center', cls)}>
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-sm font-medium mt-1">{label}</div>
            </Card>
          ))}
        </div>
      ) : null}

      {/* Add keyword */}
      <Card>
        <CardHeader>
          <CardTitle>Keywords</CardTitle>
        </CardHeader>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Add keyword to monitor..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && keyword && addKw.mutate()}
          />
          <Button
            icon={<Plus size={15} />}
            loading={addKw.isPending}
            disabled={!keyword}
            onClick={() => addKw.mutate()}
          >
            Add
          </Button>
        </div>
        {kwLoading ? (
          <Spinner size="sm" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <span
                key={kw.id}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium"
              >
                {kw.keyword}
                <button
                  onClick={() => removeKw.mutate(kw.id)}
                  className="hover:text-primary-900"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {keywords.length === 0 && (
              <p className="text-sm text-gray-400">No keywords yet. Add some above.</p>
            )}
          </div>
        )}
      </Card>

      {/* Tabs + mention feed */}
      <Card>
        <div className="flex gap-1 mb-5 border-b border-gray-100 pb-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                tab === t ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {t === 'All' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {mentionsLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : mentions.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No mentions found.</p>
        ) : (
          <div className="space-y-3">
            {mentions.map((m) => (
              <div key={m.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={clsx('px-2 py-0.5 rounded text-xs font-semibold capitalize', platformColors[m.platform.toLowerCase()] ?? 'bg-gray-100 text-gray-600')}>
                        {m.platform}
                      </span>
                      <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', sentimentColors[m.sentiment])}>
                        {m.sentiment.charAt(0) + m.sentiment.slice(1).toLowerCase()}
                      </span>
                      {m.author && <span className="text-xs text-gray-500">@{m.author}</span>}
                      <span className="text-xs text-gray-400 ml-auto">{daysAgo(m.publishedAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3">{m.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
