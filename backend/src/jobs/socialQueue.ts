import { logger } from '../config/logger';

export interface SocialJobData {
  type: 'post' | 'schedule';
  socialPostId: string;
  platform: string;
  content: string;
  mediaUrls?: string[];
  scheduledAt?: string;
}

const _queue: SocialJobData[] = [];

export function scheduleSocialPost(data: SocialJobData): void {
  _queue.push(data);
  logger.info(`Social post queued: ${data.platform}`);
}
