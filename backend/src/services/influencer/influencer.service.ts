import { prisma } from '../../config/database';

// Seed influencer data if empty
async function seedInfluencers() {
  const count = await prisma.influencer.count();
  if (count > 0) return;

  await prisma.influencer.createMany({ data: [
    { name: 'Amara Nwosu', handle: '@amara_tech_ng', platform: 'instagram', country: 'Nigeria', category: 'Tech', followers: 285000, engagementRate: 4.2, pricePerPost: 800, bio: 'Tech entrepreneur & startup advisor', isVerified: true },
    { name: 'Kofi Mensah', handle: '@kofi.business', platform: 'instagram', country: 'Ghana', category: 'Business', followers: 142000, engagementRate: 5.8, pricePerPost: 450, bio: 'SME growth strategist', isVerified: true },
    { name: 'Zanele Dlamini', handle: '@zanele_style', platform: 'instagram', country: 'South Africa', category: 'Fashion', followers: 510000, engagementRate: 3.1, pricePerPost: 1200, bio: 'Pan-African fashion icon', isVerified: true },
    { name: 'Mwangi Kariuki', handle: '@mwangi_finance', platform: 'twitter', country: 'Kenya', category: 'Finance', followers: 89000, engagementRate: 7.3, pricePerPost: 300, bio: 'Fintech & investing for Africans', isVerified: false },
    { name: 'Fatima Al-Hassan', handle: '@fatima.creates', platform: 'tiktok', country: 'Egypt', category: 'Lifestyle', followers: 920000, engagementRate: 9.1, pricePerPost: 1500, bio: 'Lifestyle creator with a North African twist', isVerified: true },
    { name: 'Chidi Okonkwo', handle: '@chidi_codes', platform: 'youtube', country: 'Nigeria', category: 'Tech', followers: 195000, engagementRate: 6.4, pricePerPost: 600, bio: 'Full-stack dev & African tech scene', isVerified: true },
    { name: 'Nomvula Zulu', handle: '@nomvula.eats', platform: 'instagram', country: 'South Africa', category: 'Food', followers: 73000, engagementRate: 8.2, pricePerPost: 250, bio: 'African cuisine & restaurant reviews', isVerified: false },
    { name: 'Ibrahim Diallo', handle: '@ibrahim_dakar', platform: 'instagram', country: 'Senegal', category: 'Travel', followers: 198000, engagementRate: 5.5, pricePerPost: 550, bio: 'Showcasing the beauty of West Africa', isVerified: true },
    { name: 'Aisha Kamara', handle: '@aisha_health_sl', platform: 'tiktok', country: 'Sierra Leone', category: 'Health', followers: 340000, engagementRate: 11.2, pricePerPost: 700, bio: 'Women\'s health advocate for Africa', isVerified: false },
    { name: 'Tendai Moyo', handle: '@tendai_agritech', platform: 'twitter', country: 'Zimbabwe', category: 'Agriculture', followers: 45000, engagementRate: 9.8, pricePerPost: 180, bio: 'AgriTech innovation across Southern Africa', isVerified: false },
  ]});
}

export const influencerService = {
  async list(filters: { platform?: string; country?: string; category?: string; minFollowers?: number }) {
    await seedInfluencers();
    return prisma.influencer.findMany({
      where: {
        ...(filters.platform ? { platform: filters.platform } : {}),
        ...(filters.country ? { country: filters.country } : {}),
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.minFollowers ? { followers: { gte: filters.minFollowers } } : {}),
      },
      orderBy: { followers: 'desc' },
    });
  },

  async get(id: string) {
    return prisma.influencer.findUnique({ where: { id } });
  },

  async listRequests(workspaceId: string) {
    return prisma.influencerRequest.findMany({
      where: { workspaceId },
      include: { influencer: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async createRequest(workspaceId: string, data: { influencerId: string; campaignName: string; message: string; budget?: number }) {
    return prisma.influencerRequest.create({
      data: { workspaceId, ...data },
      include: { influencer: true },
    });
  },

  async updateRequestStatus(id: string, workspaceId: string, status: string) {
    return prisma.influencerRequest.update({ where: { id, workspaceId }, data: { status } });
  },
};
