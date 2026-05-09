'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import Link from 'next/link';
import { aiService } from '../../services/ai.service';

const FALLBACK_INSIGHTS = [
  'WhatsApp Business campaigns show 3× higher open rates than email in most African markets. Consider shifting budget.',
  'Audiences in West Africa are most active on Facebook between 6–9 PM local time. Schedule posts in that window.',
  'Localising your ad copy in regional languages can increase CTR by up to 35% based on industry benchmarks.',
  'Micro-influencers (5K–50K followers) deliver the best cost-per-engagement in African markets.',
  'Mobile money integrations in your checkout flow reduce drop-off by 20–40% across Sub-Saharan Africa.',
];

export function AIInsightWidget() {
  const [shownIndex, setShownIndex] = useState(0);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['ai', 'insights'],
    queryFn: () => aiService.getInsights(),
    staleTime: 10 * 60_000,
    retry: 1,
  });

  const insights = data?.insights?.length ? data.insights : FALLBACK_INSIGHTS;

  const next = () => {
    if (insights.length > 1) {
      setShownIndex(i => (i + 1) % insights.length);
    } else {
      refetch();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50">
            <Sparkles size={15} className="text-amber-500" />
          </div>
          <CardTitle>AI Insight</CardTitle>
        </div>
        <button
          onClick={next}
          disabled={isRefetching}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRefetching ? 'animate-spin' : ''} />
        </button>
      </CardHeader>
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Spinner size="sm" className="text-amber-500" />
        </div>
      ) : (
        <p className="text-sm text-gray-700 leading-relaxed">{insights[shownIndex]}</p>
      )}
      <div className="mt-4">
        <Link href="/ai-advisor">
          <Button variant="outline" size="sm" iconRight={<ArrowRight size={14} />}>
            Ask AI Advisor
          </Button>
        </Link>
      </div>
    </Card>
  );
}
