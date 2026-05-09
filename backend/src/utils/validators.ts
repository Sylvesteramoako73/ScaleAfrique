import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
});

export const campaignCreateSchema = z.object({
  name: z.string().min(2).max(200),
  type: z.enum(['EMAIL', 'SOCIAL', 'ADS', 'MULTI_CHANNEL']),
  objective: z.string().optional(),
  description: z.string().optional(),
  channels: z.array(z.string()).optional(),
  budget: z.number().positive().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  targeting: z.record(z.unknown()).optional(),
  content: z.record(z.unknown()).optional(),
});

export const campaignUpdateSchema = campaignCreateSchema.partial();

export const onboardingSchema = z.object({
  companyName: z.string().min(2).max(200),
  industry: z.string().min(1),
  growthStage: z.enum(['IDEA', 'EARLY', 'GROWTH', 'SCALE']),
  region: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  teamSize: z.number().int().positive().optional(),
  monthlyBudget: z.number().positive().optional(),
  targetAudience: z.string().optional(),
  languages: z.array(z.string()).optional(),
});

export const communityPostSchema = z.object({
  title: z.string().min(5).max(300),
  content: z.string().min(10),
  category: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

export const commentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export const aiChatSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().optional(),
});

export const aiStrategySchema = z.object({
  goals: z.array(z.string()).optional(),
  budget: z.number().optional(),
  timeframe: z.string().optional(),
});

export const aiContentSchema = z.object({
  type: z.enum(['social_post', 'email', 'ad_copy', 'blog_post', 'whatsapp']),
  brief: z.string().min(10).max(1000),
  platform: z.string().optional(),
  tone: z.string().optional(),
  language: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CampaignCreateInput = z.infer<typeof campaignCreateSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type AIChatInput = z.infer<typeof aiChatSchema>;
export type AIContentInput = z.infer<typeof aiContentSchema>;
