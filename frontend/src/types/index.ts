export type Role = 'ADMIN' | 'MEMBER' | 'GUEST';
export type GrowthStage = 'IDEA' | 'EARLY' | 'GROWTH' | 'SCALE';
export type CampaignType = 'EMAIL' | 'SOCIAL' | 'ADS' | 'MULTI_CHANNEL';
export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
export type SocialPlatform = 'TWITTER' | 'FACEBOOK' | 'INSTAGRAM' | 'LINKEDIN';
export type EventType = 'WEBINAR' | 'WORKSHOP' | 'NETWORKING';
export type ResourceType = 'GUIDE' | 'TEMPLATE' | 'TOOL' | 'CASE_STUDY';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  startupProfile?: StartupProfile;
}

export interface StartupProfile {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  growthStage: GrowthStage;
  region?: string;
  country?: string;
  website?: string;
  description?: string;
  teamSize?: number;
  monthlyBudget?: number;
  targetAudience?: string;
  languages: string[];
  logoUrl?: string;
}

export interface Campaign {
  id: string;
  userId: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  channels: string[];
  budget?: number;
  startDate?: string;
  endDate?: string;
  targeting?: Record<string, unknown>;
  content?: Record<string, unknown>;
  metrics?: CampaignMetrics;
  objective?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  roi?: number;
}

export interface AnalyticsData {
  id: string;
  userId: string;
  campaignId?: string;
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  roi?: number;
  channel?: string;
}

export interface DashboardSummary {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  roi: number;
  ctr: number;
  convRate: number;
  activeCampaigns: number;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIConversation {
  id: string;
  title?: string;
  messages: AIMessage[];
  updatedAt: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  likes: number;
  views: number;
  isPublished: boolean;
  imageUrl?: string;
  createdAt: string;
  user: Pick<User, 'id' | 'name' | 'avatar'> & {
    startupProfile?: Pick<StartupProfile, 'companyName' | 'country'>;
  };
  _count?: { comments: number };
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  likes: number;
  createdAt: string;
  user: Pick<User, 'id' | 'name' | 'avatar'>;
}

export interface Event {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  type: EventType;
  startDate: string;
  endDate: string;
  location?: string;
  maxAttendees?: number;
  isOnline: boolean;
  meetingLink?: string;
  tags: string[];
  imageUrl?: string;
  organizer: Pick<User, 'id' | 'name' | 'avatar'>;
  _count?: { attendees: number };
}

export interface Resource {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: ResourceType;
  fileUrl?: string;
  downloads: number;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  user: Pick<User, 'id' | 'name'>;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// Automation Workflows
export type AutomationTriggerType =
  | 'new_signup'
  | 'campaign_launched'
  | 'campaign_completed'
  | 'no_activity_7d'
  | 'purchase'
  | 'cart_abandon';

export type AutomationActionType =
  | 'send_email'
  | 'send_sms'
  | 'send_whatsapp'
  | 'wait'
  | 'add_tag'
  | 'create_campaign';

export interface AutomationTrigger {
  type: AutomationTriggerType;
  conditions?: Record<string, unknown>;
}

export interface AutomationAction {
  type: AutomationActionType;
  config: Record<string, unknown>;
  delay?: number;
}

export interface Automation {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isActive: boolean;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  stats: { runs: number; lastRun: string | null };
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsDashboard {
  summary: DashboardSummary;
  dailyData: Array<{ date: string; impressions: number; clicks: number; conversions: number; spend: number }>;
  channelBreakdown: Array<{ channel: string; value: number }>;
  topCampaigns: Campaign[];
}

export interface CampaignAnalytics {
  campaign: Campaign;
  dailyData: AnalyticsData[];
  summary: DashboardSummary;
}

export interface CampaignFormData {
  name: string;
  type: CampaignType;
  objective?: string;
  description?: string;
  channels: string[];
  budget?: number;
  startDate?: string;
  endDate?: string;
  targeting?: Record<string, unknown>;
  content?: Record<string, unknown>;
}
