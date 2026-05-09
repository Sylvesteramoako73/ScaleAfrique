'use client';

import { MoreVertical, Play, Pause, Copy, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { formatNumber, formatDate } from '../../utils/formatters';
import type { Campaign } from '../../types';

const CHANNEL_ICONS: Record<string, string> = {
  EMAIL: '📧',
  SOCIAL: '📱',
  ADS: '📢',
  MULTI_CHANNEL: '🔀',
};

interface CampaignCardProps {
  campaign: Campaign;
  onLaunch?: (id: string) => void;
  onPause?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function CampaignCard({ campaign, onLaunch, onPause, onDelete }: CampaignCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Card hover className="relative">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-xl shrink-0">
            {CHANNEL_ICONS[campaign.type] ?? '📣'}
          </div>
          <div className="min-w-0">
            <Link
              href={`/campaigns/${campaign.id}`}
              className="block text-sm font-semibold text-gray-900 hover:text-primary-600 truncate"
            >
              {campaign.name}
            </Link>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatDate(campaign.startDate ?? campaign.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="status" status={campaign.status} dot>
            {campaign.status}
          </Badge>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
            >
              <MoreVertical size={15} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-7 w-36 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1">
                {campaign.status === 'DRAFT' && onLaunch && (
                  <button
                    onClick={() => { onLaunch(campaign.id); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    <Play size={13} /> Launch
                  </button>
                )}
                {campaign.status === 'ACTIVE' && onPause && (
                  <button
                    onClick={() => { onPause(campaign.id); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    <Pause size={13} /> Pause
                  </button>
                )}
                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                  <Copy size={13} /> Duplicate
                </button>
                {onDelete && (
                  <button
                    onClick={() => { onDelete(campaign.id); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-50">
        {[
          { label: 'Reach', value: campaign.metrics?.impressions ?? 0 },
          { label: 'Clicks', value: campaign.metrics?.clicks ?? 0 },
          { label: 'Conv.', value: campaign.metrics?.conversions ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="text-sm font-semibold text-gray-900">{formatNumber(value)}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
