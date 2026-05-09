import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../../config/database';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface AdVariation {
  headline: string;
  body: string;
  cta: string;
  hook?: string;
}

export const adCreativeService = {
  async list(workspaceId: string) {
    return prisma.adCreative.findMany({ where: { workspaceId }, orderBy: { createdAt: 'desc' } });
  },

  async get(id: string, workspaceId: string) {
    return prisma.adCreative.findFirst({ where: { id, workspaceId } });
  },

  async generate(workspaceId: string, params: {
    name: string;
    platform: string;
    productName: string;
    productDescription: string;
    targetAudience?: string;
    tone?: string;
    count?: number;
  }) {
    const { name, platform, productName, productDescription, targetAudience, tone = 'professional', count = 3 } = params;

    let variations: AdVariation[] = [];

    if (process.env.ANTHROPIC_API_KEY) {
      const prompt = `You are an expert African digital marketing copywriter. Generate ${count} unique ad creative variations for the following:

Product/Service: ${productName}
Description: ${productDescription}
Platform: ${platform}
Target Audience: ${targetAudience ?? 'African entrepreneurs and consumers'}
Tone: ${tone}

Respond ONLY with a valid JSON array of ${count} objects, each with: headline (max 60 chars), body (max 150 chars), cta (max 20 chars), hook (attention-grabbing opening, max 30 chars).

Consider African market context, local pain points, and cultural nuances.`;

      const r = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      });

      try {
        const text = (r.content[0] as { text: string }).text;
        const match = text.match(/\[[\s\S]*\]/);
        if (match) variations = JSON.parse(match[0]);
      } catch { /* fall through to defaults */ }
    }

    if (!variations.length) {
      variations = Array.from({ length: count }, (_, i) => ({
        hook: i === 0 ? 'Grow faster →' : i === 1 ? 'Limited offer 🔥' : 'Join 10,000+ users',
        headline: `${productName} — Built for Africa`,
        body: `${productDescription}. Perfect for ${targetAudience ?? 'African businesses'}.`,
        cta: ['Get Started', 'Learn More', 'Try Free'][i] ?? 'Sign Up',
      }));
    }

    return prisma.adCreative.create({
      data: { workspaceId, name, platform, productName, targetAudience, tone, variations: variations as never },
    });
  },

  async delete(id: string, workspaceId: string) {
    return prisma.adCreative.delete({ where: { id, workspaceId } });
  },
};
