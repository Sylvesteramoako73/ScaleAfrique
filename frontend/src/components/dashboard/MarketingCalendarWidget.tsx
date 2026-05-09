import { Calendar, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import { aiService, type CalendarOpportunity } from '../../services/ai.service';
import { clsx } from 'clsx';

const URGENCY_STYLES: Record<CalendarOpportunity['urgency'], string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-gray-600',
};

const TYPE_EMOJI: Record<string, string> = {
  religious: '🕌',
  national: '🇬🇭',
  cultural: '🎉',
  commercial: '🛒',
};

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

export function MarketingCalendarWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ['ai', 'calendar-opportunities'],
    queryFn: () => aiService.getCalendarOpportunities(),
    staleTime: 60 * 60_000,
    retry: 1,
  });

  const opportunities = data?.opportunities ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary-50">
            <Calendar size={15} className="text-primary-600" />
          </div>
          <CardTitle>Marketing Calendar</CardTitle>
          <div className="flex items-center gap-1 ml-1">
            <Sparkles size={11} className="text-amber-400" />
            <span className="text-xs text-amber-600 font-medium">AI</span>
          </div>
        </div>
      </CardHeader>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner size="sm" className="text-primary-600" />
        </div>
      ) : opportunities.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">Loading your marketing calendar…</p>
      ) : (
        <div className="space-y-3">
          {opportunities.slice(0, 4).map((opp, i) => {
            const days = daysUntil(opp.date);
            const dateLabel = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d away`;
            return (
              <div key={i} className="flex gap-3 p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <span className="text-lg shrink-0">{TYPE_EMOJI[opp.type] ?? '📅'}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-semibold text-gray-900">{opp.event}</p>
                    <span className={clsx('text-[10px] font-medium px-1.5 py-0.5 rounded-full', URGENCY_STYLES[opp.urgency])}>
                      {dateLabel}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{opp.suggestion}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
