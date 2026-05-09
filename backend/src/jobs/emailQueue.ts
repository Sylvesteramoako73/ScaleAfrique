import { logger } from '../config/logger';

export interface EmailJobData {
  type: 'welcome' | 'verification' | 'password_reset' | 'campaign_report' | 'batch';
  to: string;
  name: string;
  token?: string;
  campaignName?: string;
  metrics?: { impressions: number; clicks: number; conversions: number; spend: number; revenue: number };
  recipients?: Array<{ email: string; name: string }>;
  subject?: string;
  htmlTemplate?: string;
}

// Simple in-process queue — no Redis required for local dev
const _queue: EmailJobData[] = [];

export function queueEmail(data: EmailJobData): void {
  _queue.push(data);
  logger.info(`Email queued: ${data.type} → ${data.to ?? 'batch'}`);
}
