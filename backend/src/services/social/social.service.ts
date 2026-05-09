import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../../config/database';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PLATFORMS = ['twitter', 'reddit', 'news', 'linkedin'];
const SAMPLE_AUTHORS = ['@tech_africa', '@nairobi_startup', '@lagostech', '@accra_digital', '@kigali_hub', '@Cairo_Tech', 'NewsAfrica', 'TechCabal'];

function randomItem<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generateMockMention(keyword: string, workspaceId: string) {
  const platform = randomItem(PLATFORMS);
  const templates = [
    `Just discovered ${keyword} and it's changing the game for African entrepreneurs! 🚀`,
    `Has anyone tried ${keyword}? Looking for reviews from the community.`,
    `${keyword} is exactly what the African market needed. Impressive execution.`,
    `Not sure about ${keyword} yet. The pricing feels off for local markets.`,
    `Big news: ${keyword} just expanded to 5 new African countries! 🌍`,
    `${keyword} partnership with local payment providers is a smart move.`,
    `Why isn't ${keyword} available in my country yet? So frustrating.`,
    `The ${keyword} team really understands African business challenges.`,
  ];
  const sentiments = ['POSITIVE', 'NEGATIVE', 'NEUTRAL'];
  const weights = [0.5, 0.2, 0.3];
  const rand = Math.random();
  const sentiment = rand < weights[0] ? 'POSITIVE' : rand < weights[0] + weights[1] ? 'NEGATIVE' : 'NEUTRAL';
  const score = sentiment === 'POSITIVE' ? Math.random() * 0.5 + 0.5 : sentiment === 'NEGATIVE' ? -(Math.random() * 0.5 + 0.5) : Math.random() * 0.2 - 0.1;

  const daysAgo = randomInt(0, 7);
  const publishedAt = new Date(Date.now() - daysAgo * 86400000 - randomInt(0, 86400000));

  return {
    workspaceId,
    keyword,
    platform,
    content: randomItem(templates),
    author: randomItem(SAMPLE_AUTHORS),
    url: `https://${platform}.com/post/${Math.random().toString(36).slice(2)}`,
    sentiment,
    score,
    publishedAt,
  };
}

export const socialService = {
  async getKeywords(workspaceId: string) {
    return prisma.socialKeyword.findMany({ where: { workspaceId }, orderBy: { createdAt: 'desc' } });
  },

  async addKeyword(workspaceId: string, keyword: string) {
    const kw = await prisma.socialKeyword.create({ data: { workspaceId, keyword: keyword.trim().toLowerCase() } });
    // seed initial mentions
    const mentions = Array.from({ length: randomInt(5, 15) }, () => generateMockMention(keyword, workspaceId));
    await prisma.socialMention.createMany({ data: mentions });
    return kw;
  },

  async removeKeyword(workspaceId: string, id: string) {
    return prisma.socialKeyword.delete({ where: { id, workspaceId } });
  },

  async getMentions(workspaceId: string, keyword?: string, sentiment?: string) {
    return prisma.socialMention.findMany({
      where: { workspaceId, ...(keyword ? { keyword } : {}), ...(sentiment ? { sentiment } : {}) },
      orderBy: { publishedAt: 'desc' },
      take: 200,
    });
  },

  async refreshMentions(workspaceId: string) {
    const keywords = await prisma.socialKeyword.findMany({ where: { workspaceId, isActive: true } });
    const mentions = keywords.flatMap(k => Array.from({ length: randomInt(1, 4) }, () => generateMockMention(k.keyword, workspaceId)));
    if (mentions.length) await prisma.socialMention.createMany({ data: mentions });
    return mentions.length;
  },

  async getStats(workspaceId: string) {
    const [total, positive, negative, byPlatform] = await Promise.all([
      prisma.socialMention.count({ where: { workspaceId } }),
      prisma.socialMention.count({ where: { workspaceId, sentiment: 'POSITIVE' } }),
      prisma.socialMention.count({ where: { workspaceId, sentiment: 'NEGATIVE' } }),
      prisma.socialMention.groupBy({ by: ['platform'], where: { workspaceId }, _count: true }),
    ]);
    return { total, positive, negative, neutral: total - positive - negative, byPlatform };
  },

  async analyzeSentiment(content: string) {
    if (!process.env.ANTHROPIC_API_KEY) return { sentiment: 'NEUTRAL', summary: 'No API key configured.' };
    const r = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: `Analyze the sentiment of this social media mention and respond with JSON only: {"sentiment": "POSITIVE|NEGATIVE|NEUTRAL", "summary": "one sentence"}.\n\nMention: "${content}"` }],
    });
    try { return JSON.parse((r.content[0] as { text: string }).text); } catch { return { sentiment: 'NEUTRAL', summary: 'Analysis failed.' }; }
  },
};
