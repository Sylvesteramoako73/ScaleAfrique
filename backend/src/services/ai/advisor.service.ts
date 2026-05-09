import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config';
import { redisHelpers } from '../../config/redis';
import { logger } from '../../config/logger';
import { StartupProfile, Campaign } from '@prisma/client';

const client = new Anthropic({ apiKey: config.anthropic.apiKey });

const SYSTEM_PROMPT = `You are ScaleAfrique AI — an expert marketing advisor specialising in African startup ecosystems and SME growth. You have deep, up-to-date knowledge of:

**African Markets:**
- West Africa: Ghana (GHS, MTN MoMo, Vodafone Cash, AirtelTigo Money, Jumia), Nigeria (NGN, Flutterwave, Paystack, Kuda, PiggyVest, Jumia, Konga)
- East Africa: Kenya (KES, M-Pesa, Airtel Money, Equity Bank, Safaricom), Tanzania, Uganda, Rwanda
- Southern Africa: South Africa (ZAR, SnapScan, Ozow, Yoco), Zimbabwe, Zambia
- North Africa: Egypt (EGP, Fawry, instapay), Morocco (MAD), Tunisia

**Digital & Social Landscape:**
- Platform preferences by country (Facebook dominant in West Africa, WhatsApp for commerce, TikTok growing, Twitter strong in Kenya/Nigeria)
- Mobile-first consumers; average smartphone penetration ~50% across Sub-Saharan Africa, higher in urban areas
- SMS and USSD marketing still effective for rural and less-connected segments
- Radio and digital radio important for local reach
- Influencer marketing highly effective, especially micro-influencers (10K–100K followers)

**Payment & Commerce:**
- Mobile money is the primary payment rail across most of Africa
- Cash on delivery remains high in many markets
- BNPL growing rapidly (Carbon, Lipa Later, M-Kopa)
- Cross-border payments complex; use Flutterwave, Chipper Cash, Nala

**Cultural & Language Context:**
- Markets are multilingual; localisation drives engagement (Swahili, Yoruba, Hausa, Twi, Zulu, Amharic, Arabic)
- Community and trust are critical purchase drivers
- Family and peer recommendations highly influential
- Religious calendars (Ramadan, Christmas, Eid, Easter) drive significant purchase spikes
- Football, music (Afrobeats, Bongo, Amapiano) are powerful cultural touchpoints

**Startup Ecosystem:**
- Key hubs: Lagos, Nairobi, Cape Town, Cairo, Accra, Kigali, Abidjan
- Major investors: Partech Africa, TLcom Capital, Novastar Ventures, 4DX Ventures, GreenHouse Capital
- Incubators/accelerators: MEST Africa, GreenHouse Capital, Chandaria Business Centre, iHub

**Your Role:**
- Give actionable, specific, data-driven marketing advice
- Always contextualise recommendations to the user's specific market and startup stage
- Suggest realistic budgets in local currencies when relevant
- Include channel-specific tactics (WhatsApp broadcast lists, Facebook/Instagram ads, email drip sequences)
- Reference local platforms, payment systems, and cultural moments where relevant
- Be encouraging but honest about challenges
- Format responses with clear structure: use markdown headers, bullet points, and bold text for scanability
- Keep responses focused and actionable — no fluff

Always respond in English unless the user writes in another language, in which case match their language.`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ConversationHistory {
  messages: Message[];
  updatedAt: number;
}

const HISTORY_TTL = 24 * 60 * 60; // 24 hours
const MAX_HISTORY_MESSAGES = 20;

async function getConversationHistory(conversationId: string): Promise<Message[]> {
  const data = await redisHelpers.getJSON<ConversationHistory>(`conv:${conversationId}`);
  return data?.messages ?? [];
}

async function saveConversationHistory(conversationId: string, messages: Message[]): Promise<void> {
  const trimmed = messages.slice(-MAX_HISTORY_MESSAGES);
  await redisHelpers.setJSON(`conv:${conversationId}`, HISTORY_TTL, {
    messages: trimmed,
    updatedAt: Date.now(),
  });
}

export const advisorService = {
  async chat(userId: string, message: string, conversationId?: string): Promise<{
    reply: string;
    conversationId: string;
  }> {
    const convId = conversationId ?? `${userId}_${Date.now()}`;
    const history = await getConversationHistory(convId);

    const newHistory: Message[] = [...history, { role: 'user', content: message }];

    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
      });

      const reply = response.content[0].type === 'text' ? response.content[0].text : '';
      const updatedHistory: Message[] = [...newHistory, { role: 'assistant', content: reply }];
      await saveConversationHistory(convId, updatedHistory);

      return { reply, conversationId: convId };
    } catch (error) {
      logger.error('AI chat error', { error });
      throw new Error('AI advisor is temporarily unavailable. Please try again shortly.');
    }
  },

  async generateStrategy(
    userId: string,
    profile: Partial<StartupProfile> | null,
    options: { goals?: string[]; budget?: number; timeframe?: string },
  ): Promise<{ strategy: string }> {
    const profileContext = profile
      ? `Company: ${profile.companyName ?? 'Unknown'}, Industry: ${profile.industry ?? 'Unknown'}, Stage: ${profile.growthStage ?? 'EARLY'}, Country: ${profile.country ?? 'Africa'}, Budget: $${profile.monthlyBudget ?? 'unspecified'}/month, Target Audience: ${profile.targetAudience ?? 'unspecified'}`
      : 'No startup profile available.';

    const goalsText = options.goals?.join(', ') ?? 'grow brand awareness and acquire customers';
    const budgetText = options.budget ? `$${options.budget}` : 'unspecified';
    const timeframeText = options.timeframe ?? '3 months';

    const prompt = `Generate a comprehensive, actionable marketing strategy for this African startup:

**Startup Profile:**
${profileContext}

**Goals:** ${goalsText}
**Monthly Budget:** ${budgetText}
**Timeframe:** ${timeframeText}

Please provide:
1. Executive Summary (2-3 sentences)
2. Recommended Channel Mix (with % budget allocation)
3. Month-by-Month Action Plan
4. Key Metrics to Track (KPIs)
5. Quick Wins (actions to take in the first 2 weeks)
6. Risks and Mitigations

Make it specific to the African market context.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const strategy = response.content[0].type === 'text' ? response.content[0].text : '';
    return { strategy };
  },

  async generateInsights(
    userId: string,
    profile: Partial<StartupProfile> | null,
    campaigns: Partial<Campaign>[],
  ): Promise<{ insights: string[] }> {
    const profileText = profile
      ? `${profile.companyName} (${profile.industry}, ${profile.country})`
      : 'your startup';

    const campaignSummary = campaigns.length > 0
      ? campaigns.map((c) => `- ${c.name} (${c.type}, ${c.status})`).join('\n')
      : 'No campaigns yet.';

    const prompt = `Provide 5 concise, actionable marketing insights for ${profileText}.

Recent campaigns:
${campaignSummary}

Return exactly 5 insights as a JSON array of strings. Each insight should be 1-2 sentences, specific, and actionable. Format: ["insight1", "insight2", ...]`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '[]';
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const insights: string[] = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      return { insights };
    } catch {
      return {
        insights: [
          'Explore WhatsApp Business API for direct customer communication at scale.',
          'Consider partnering with local mobile money providers for seamless payment integration.',
          'Leverage micro-influencers in your target market for authentic brand reach.',
          'Test SMS campaigns for lower-funnel nurturing in markets with lower data penetration.',
          'Run A/B tests on your ad creative with culturally-relevant imagery.',
        ],
      };
    }
  },

  async generateContent(
    userId: string,
    profile: Partial<StartupProfile> | null,
    options: { type: string; brief: string; platform?: string; tone?: string; language?: string },
  ): Promise<{ content: string; variations: string[] }> {
    const companyName = profile?.companyName ?? 'our company';
    const country = profile?.country ?? 'Africa';

    const prompt = `Generate marketing content for ${companyName} (${country}).

**Content Type:** ${options.type}
**Platform:** ${options.platform ?? 'general'}
**Tone:** ${options.tone ?? 'professional but friendly'}
**Language:** ${options.language ?? 'English'}
**Brief:** ${options.brief}

Provide:
1. Primary version
2. Two alternative variations

Format as JSON: {"primary": "...", "variations": ["...", "..."]}

Make it culturally relevant to ${country} and the African context.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      return {
        content: parsed.primary ?? text,
        variations: parsed.variations ?? [],
      };
    } catch {
      return { content: text, variations: [] };
    }
  },

  async getCalendarOpportunities(
    userId: string,
    profile: Partial<StartupProfile> | null,
  ): Promise<{ opportunities: Array<{ date: string; event: string; type: string; suggestion: string; urgency: 'high' | 'medium' | 'low' }> }> {
    const today = new Date().toISOString().split('T')[0];
    const country = profile?.country ?? 'West Africa';
    const industry = profile?.industry ?? 'general';

    const prompt = `You are helping an African startup plan their marketing calendar.

Today's date: ${today}
Business location: ${country}
Industry: ${industry}

List the 6 most relevant upcoming marketing opportunities for this business in the next 60 days. Include:
- Religious events (Ramadan, Eid, Christmas, Easter where relevant)
- National holidays and independence days for ${country}
- African cultural events and festivals
- Global commercial moments (Mother's Day, Father's Day, Black Friday, etc.)
- Industry-specific opportunities if applicable

Return ONLY a JSON array with this exact format (no other text):
[{"date":"YYYY-MM-DD","event":"Event Name","type":"religious|national|cultural|commercial","suggestion":"1-2 sentence campaign idea","urgency":"high|medium|low"}]`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '[]';
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const opportunities = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      return { opportunities };
    } catch {
      return { opportunities: [] };
    }
  },

  async getWeeklyDigest(
    userId: string,
    profile: Partial<StartupProfile> | null,
    analytics: { impressions: number; clicks: number; conversions: number; spend: number; revenue: number; topCampaign?: string },
  ): Promise<{ digest: string; recommendations: string[] }> {
    const companyName = profile?.companyName ?? 'your startup';
    const country = profile?.country ?? 'Africa';
    const roi = analytics.spend > 0 ? (((analytics.revenue - analytics.spend) / analytics.spend) * 100).toFixed(1) : '0';

    const prompt = `Generate a brief weekly performance digest for ${companyName} (${country}).

This week's metrics:
- Impressions: ${analytics.impressions.toLocaleString()}
- Clicks: ${analytics.clicks.toLocaleString()}
- Conversions: ${analytics.conversions.toLocaleString()}
- Spend: $${analytics.spend.toFixed(2)}
- Revenue: $${analytics.revenue.toFixed(2)}
- ROI: ${roi}%
${analytics.topCampaign ? `- Active campaign: ${analytics.topCampaign}` : ''}

Return ONLY JSON (no other text): {"digest":"2-3 sentence honest encouraging summary","recommendations":["rec1","rec2","rec3"]}`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      return {
        digest: parsed.digest ?? 'Your campaigns are running — keep the momentum going!',
        recommendations: parsed.recommendations ?? [],
      };
    } catch {
      return {
        digest: 'Keep pushing — every campaign is a learning opportunity.',
        recommendations: [
          'Review your top-performing ad creative and replicate the formula.',
          'Test a WhatsApp broadcast to your existing customer list.',
          'Set up a retargeting audience from this week\'s website visitors.',
        ],
      };
    }
  },

  async optimizeCampaign(
    userId: string,
    campaign: Partial<Campaign> | null,
  ): Promise<{ suggestions: string[] }> {
    const campaignContext = campaign
      ? `Campaign: ${campaign.name}, Type: ${campaign.type}, Status: ${campaign.status}, Budget: $${campaign.budget ?? 'N/A'}`
      : 'No specific campaign selected.';

    const prompt = `Provide 5 specific optimisation suggestions for this campaign:
${campaignContext}

Return as JSON array: ["suggestion1", "suggestion2", ...]
Each suggestion should be actionable and specific to African markets.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '[]';
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const suggestions: string[] = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      return { suggestions };
    } catch {
      return {
        suggestions: [
          'Increase mobile-optimised landing page load speed — 53% of users abandon pages that take >3 seconds.',
          'Add local language copy variants to improve CTR by up to 40%.',
          'Schedule posts for peak engagement times: 7-9am and 7-10pm local time.',
          'Use short-form video content on Facebook Reels and TikTok for higher organic reach.',
          'A/B test CTA copy — "Get Started" vs. "Start Free Today" typically shows 15-25% lift.',
        ],
      };
    }
  },
};
