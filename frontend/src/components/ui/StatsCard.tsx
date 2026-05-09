import React from 'react';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './Card';
import { formatNumber } from '../../utils/formatters';

interface StatsCardProps {
  label: string;
  value: number | string;
  trend?: number;
  icon?: React.ReactNode;
  prefix?: string;
  suffix?: string;
  format?: 'number' | 'percent' | 'raw';
  loading?: boolean;
}

export function StatsCard({ label, value, trend, icon, prefix, suffix, format = 'number', loading }: StatsCardProps) {
  const displayValue =
    loading ? '—' :
    typeof value === 'number' && format === 'number' ? formatNumber(value) :
    value;

  const isPositive = (trend ?? 0) >= 0;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {icon && (
          <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className="text-2xl font-bold text-gray-900">
          {loading ? <span className="h-7 w-24 bg-gray-100 rounded animate-pulse block" /> : (
            <>{prefix}{displayValue}{suffix}</>
          )}
        </p>
        {trend !== undefined && (
          <div
            className={clsx(
              'flex items-center gap-0.5 text-xs font-medium',
              isPositive ? 'text-green-600' : 'text-red-500'
            )}
          >
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
    </Card>
  );
}
