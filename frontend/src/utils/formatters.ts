import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-GH'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(date: string | Date, pattern = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern);
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatROI(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}x`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    SCHEDULED: 'bg-blue-100 text-blue-700',
    DRAFT: 'bg-gray-100 text-gray-600',
    PAUSED: 'bg-yellow-100 text-yellow-700',
    COMPLETED: 'bg-purple-100 text-purple-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
}

export function getTrendColor(trend: number): string {
  return trend >= 0 ? 'text-green-600' : 'text-red-500';
}

export function getTrendIcon(trend: number): string {
  return trend >= 0 ? '↑' : '↓';
}
