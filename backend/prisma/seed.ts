import { PrismaClient, Role, GrowthStage, CampaignType, CampaignStatus, EventType, ResourceType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Admin users
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin1 = await prisma.user.upsert({
    where: { email: 'admin@scaleafrique.com' },
    update: {},
    create: {
      email: 'admin@scaleafrique.com',
      password: adminPassword,
      name: 'ScaleAfrique Admin',
      role: Role.ADMIN,
      isVerified: true,
    },
  });

  const admin2 = await prisma.user.upsert({
    where: { email: 'support@scaleafrique.com' },
    update: {},
    create: {
      email: 'support@scaleafrique.com',
      password: adminPassword,
      name: 'ScaleAfrique Support',
      role: Role.ADMIN,
      isVerified: true,
    },
  });

  console.log('Created admin users:', admin1.email, admin2.email);

  // Sample startup users across Africa
  const userPassword = await bcrypt.hash('User@123', 12);

  const startups = [
    {
      email: 'kofi@payfast-gh.com',
      name: 'Kofi Mensah',
      country: 'Ghana',
      region: 'West Africa',
      companyName: 'PayFast GH',
      industry: 'Fintech',
      growthStage: GrowthStage.GROWTH,
      description: 'Mobile payment solutions for Ghanaian SMEs using MTN MoMo and Vodafone Cash.',
      teamSize: 12,
      monthlyBudget: 2500,
      targetAudience: 'SMEs, traders, mobile money users in Ghana',
      languages: ['English', 'Twi'],
      website: 'https://payfast-gh.com',
    },
    {
      email: 'amaka@farmconnect.ng',
      name: 'Amaka Okonkwo',
      country: 'Nigeria',
      region: 'West Africa',
      companyName: 'FarmConnect NG',
      industry: 'Agritech',
      growthStage: GrowthStage.EARLY,
      description: 'Connecting smallholder farmers to buyers and financial services across Nigeria.',
      teamSize: 8,
      monthlyBudget: 1500,
      targetAudience: 'Smallholder farmers, agricultural cooperatives, food buyers',
      languages: ['English', 'Yoruba', 'Hausa', 'Igbo'],
      website: 'https://farmconnect.ng',
    },
    {
      email: 'wanjiku@healthbridge.ke',
      name: 'Wanjiku Kamau',
      country: 'Kenya',
      region: 'East Africa',
      companyName: 'HealthBridge Kenya',
      industry: 'Healthtech',
      growthStage: GrowthStage.GROWTH,
      description: 'Telemedicine platform connecting patients to doctors via MPESA-enabled payments.',
      teamSize: 20,
      monthlyBudget: 4000,
      targetAudience: 'Urban and peri-urban Kenyans, insurance companies, hospitals',
      languages: ['English', 'Swahili'],
      website: 'https://healthbridge.co.ke',
    },
    {
      email: 'sipho@logistics360.co.za',
      name: 'Sipho Ndlovu',
      country: 'South Africa',
      region: 'Southern Africa',
      companyName: 'Logistics360',
      industry: 'Logistics',
      growthStage: GrowthStage.SCALE,
      description: 'Last-mile delivery and logistics platform for e-commerce in Southern Africa.',
      teamSize: 45,
      monthlyBudget: 10000,
      targetAudience: 'E-commerce businesses, retailers, township entrepreneurs',
      languages: ['English', 'Zulu', 'Afrikaans'],
      website: 'https://logistics360.co.za',
    },
    {
      email: 'fatma@edunile.eg',
      name: 'Fatma Hassan',
      country: 'Egypt',
      region: 'North Africa',
      companyName: 'EduNile',
      industry: 'EdTech',
      growthStage: GrowthStage.EARLY,
      description: 'Arabic-first e-learning platform for K-12 students across North Africa and MENA.',
      teamSize: 15,
      monthlyBudget: 3000,
      targetAudience: 'Students aged 10-18, parents, schools',
      languages: ['Arabic', 'English', 'French'],
      website: 'https://edunile.com',
    },
  ];

  const createdUsers: Array<{ id: string; email: string }> = [];
  for (const startup of startups) {
    const user = await prisma.user.upsert({
      where: { email: startup.email },
      update: {},
      create: {
        email: startup.email,
        password: userPassword,
        name: startup.name,
        role: Role.MEMBER,
        isVerified: true,
        startupProfile: {
          create: {
            companyName: startup.companyName,
            industry: startup.industry,
            growthStage: startup.growthStage,
            region: startup.region,
            country: startup.country,
            website: startup.website,
            description: startup.description,
            teamSize: startup.teamSize,
            monthlyBudget: startup.monthlyBudget,
            targetAudience: startup.targetAudience,
            languages: startup.languages,
          },
        },
      },
    });
    createdUsers.push({ id: user.id, email: user.email });
    console.log('Created startup user:', user.email);
  }

  // Sample campaigns
  const kofiUser = createdUsers[0];
  const amakaUser = createdUsers[1];
  const wanjikuUser = createdUsers[2];

  const campaign1 = await prisma.campaign.create({
    data: {
      userId: kofiUser.id,
      name: 'Q2 Mobile Money Awareness Campaign',
      type: CampaignType.MULTI_CHANNEL,
      status: CampaignStatus.ACTIVE,
      channels: ['email', 'social', 'sms'],
      budget: 1500,
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-06-30'),
      objective: 'brand_awareness',
      description: 'Increase awareness of PayFast GH mobile money features among Ghanaian SMEs.',
      targeting: {
        countries: ['Ghana'],
        demographics: { ageRange: [25, 50], gender: 'all' },
        interests: ['finance', 'business', 'mobile money'],
      },
      content: {
        headline: 'Pay Smarter with PayFast GH',
        body: 'Join 10,000+ Ghanaian businesses using PayFast for fast, secure mobile payments.',
        cta: 'Get Started Free',
      },
      metrics: { impressions: 45200, clicks: 2340, conversions: 187, spend: 850, revenue: 4200 },
    },
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      userId: amakaUser.id,
      name: 'Harvest Season Farmer Outreach',
      type: CampaignType.EMAIL,
      status: CampaignStatus.SCHEDULED,
      channels: ['email'],
      budget: 500,
      startDate: new Date('2026-05-15'),
      endDate: new Date('2026-07-31'),
      objective: 'lead_generation',
      description: 'Reach smallholder farmers before the harvest season to connect them with buyers.',
      targeting: {
        countries: ['Nigeria'],
        demographics: { ageRange: [20, 60], gender: 'all' },
        interests: ['farming', 'agriculture', 'business'],
      },
      content: {
        subject: 'Sell Your Harvest at the Best Prices — Join FarmConnect NG',
        body: 'Dear Farmer, are you ready for harvest season? Connect directly with buyers who pay fair prices.',
      },
      metrics: null,
    },
  });

  const campaign3 = await prisma.campaign.create({
    data: {
      userId: wanjikuUser.id,
      name: 'HealthBridge Launch Campaign — Nairobi',
      type: CampaignType.SOCIAL,
      status: CampaignStatus.COMPLETED,
      channels: ['facebook', 'twitter', 'instagram'],
      budget: 2000,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-03-31'),
      objective: 'conversions',
      description: 'Launch HealthBridge telemedicine in Nairobi targeting working professionals.',
      targeting: {
        countries: ['Kenya'],
        cities: ['Nairobi', 'Mombasa'],
        demographics: { ageRange: [22, 45], gender: 'all' },
        interests: ['health', 'technology', 'insurance'],
      },
      content: {
        caption: 'See a doctor from home. Pay with M-Pesa. #HealthBridgeKE',
      },
      metrics: { impressions: 128500, clicks: 8920, conversions: 643, spend: 1980, revenue: 12860 },
    },
  });

  console.log('Created campaigns:', campaign1.name, campaign2.name, campaign3.name);

  // Community posts
  const communityPostsData = [
    {
      userId: kofiUser.id,
      title: 'How We Grew Our Mobile Money User Base by 300% in 6 Months',
      content: 'When we launched PayFast GH, we had to overcome two major challenges: trust and awareness. Here\'s the exact playbook we used to grow from 500 to 2,000 active merchants in just 6 months...',
      category: 'Growth',
      tags: ['fintech', 'mobile money', 'ghana', 'growth hacking'],
    },
    {
      userId: amakaUser.id,
      title: 'Marketing to Farmers in Rural Nigeria: What Works and What Doesn\'t',
      content: 'After 18 months of running FarmConnect NG, we\'ve learned hard lessons about reaching rural farmers. WhatsApp broadcasts beat Facebook ads 10:1. Radio partnerships are underrated. Here\'s our full breakdown...',
      category: 'Marketing Strategy',
      tags: ['agritech', 'nigeria', 'rural marketing', 'whatsapp'],
    },
    {
      userId: wanjikuUser.id,
      title: 'M-Pesa Integration Changed Our Conversion Rates — Here\'s the Data',
      content: 'Before integrating M-Pesa, our checkout abandonment was 78%. After? 34%. The data is clear: payment method familiarity is the single biggest conversion factor in Kenya...',
      category: 'Product',
      tags: ['healthtech', 'kenya', 'mpesa', 'conversion'],
    },
    {
      userId: createdUsers[3].id,
      title: 'Scaling Last-Mile Delivery in Township South Africa',
      content: 'Township logistics is a completely different beast from suburban delivery. Lower address density, informal settlements, cash-on-delivery preferences. Here\'s how Logistics360 cracked it...',
      category: 'Operations',
      tags: ['logistics', 'south africa', 'townships', 'e-commerce'],
    },
    {
      userId: createdUsers[4].id,
      title: 'Building an EdTech Product for Arabic Speakers: UX Lessons',
      content: 'Right-to-left layout, cultural nuances in content, exam culture differences. Building EduNile for Arab students required fundamentally rethinking our UX assumptions from a Western default...',
      category: 'Product',
      tags: ['edtech', 'egypt', 'arabic', 'ux', 'localization'],
    },
    {
      userId: kofiUser.id,
      title: 'The State of Fintech in West Africa — 2026 Trends',
      content: 'From Ghana to Senegal, West African fintech is exploding. But the real opportunity isn\'t competing with Flutterwave or Wave — it\'s going deep in verticals they ignore...',
      category: 'Industry Insights',
      tags: ['fintech', 'west africa', 'trends', 'analysis'],
    },
    {
      userId: amakaUser.id,
      title: 'Free: Our Content Calendar Template for African Startups',
      content: 'We\'re sharing the exact content calendar template that helps FarmConnect NG stay consistent across WhatsApp, Facebook, and email. Adapted for African audiences and platforms...',
      category: 'Resources',
      tags: ['marketing', 'template', 'content calendar', 'free resource'],
    },
    {
      userId: wanjikuUser.id,
      title: 'How to Pitch African Investors: Lessons from 47 Meetings',
      content: 'After 47 investor meetings across Nairobi, Lagos, and Cape Town, I\'ve identified the 5 things African investors care about most — and they\'re different from what Silicon Valley VCs want...',
      category: 'Fundraising',
      tags: ['fundraising', 'investors', 'africa', 'pitching'],
    },
    {
      userId: createdUsers[3].id,
      title: 'WhatsApp Business API vs Regular WhatsApp for SME Marketing',
      content: 'Most startups start with WhatsApp Business. At scale, you need the API. Here\'s exactly when to make the switch, what it costs, and which BSPs work best in Southern Africa...',
      category: 'Marketing Strategy',
      tags: ['whatsapp', 'marketing', 'api', 'southern africa'],
    },
    {
      userId: createdUsers[4].id,
      title: 'North Africa Market Entry Checklist: 50+ Things You Must Know',
      content: 'Entering Egypt, Morocco, or Tunisia? Here\'s our hard-won checklist covering regulations, payment infrastructure, cultural marketing considerations, and the distribution channels that matter...',
      category: 'Market Entry',
      tags: ['north africa', 'egypt', 'morocco', 'market entry'],
    },
  ];

  for (const post of communityPostsData) {
    await prisma.communityPost.create({ data: post });
  }
  console.log('Created 10 community posts');

  // Events
  const events = [
    {
      organizerId: kofiUser.id,
      title: 'ScaleAfrique Fintech Marketing Masterclass',
      description: 'Deep dive into marketing strategies for fintech startups across West Africa. Covers digital acquisition, trust-building, and partnership marketing with mobile money providers.',
      type: EventType.WEBINAR,
      startDate: new Date('2026-05-20T10:00:00Z'),
      endDate: new Date('2026-05-20T12:00:00Z'),
      isOnline: true,
      meetingLink: 'https://zoom.us/j/example',
      maxAttendees: 200,
      tags: ['fintech', 'marketing', 'west africa'],
    },
    {
      organizerId: wanjikuUser.id,
      title: 'East Africa Startup Networking Night — Nairobi',
      description: 'Monthly in-person networking for East African founders, operators, and investors. This month\'s theme: Scaling beyond your home market.',
      type: EventType.NETWORKING,
      startDate: new Date('2026-05-25T18:00:00Z'),
      endDate: new Date('2026-05-25T21:00:00Z'),
      isOnline: false,
      location: 'iHub, Nairobi, Kenya',
      maxAttendees: 80,
      tags: ['networking', 'nairobi', 'east africa'],
    },
    {
      organizerId: amakaUser.id,
      title: 'Content Marketing for African Audiences Workshop',
      description: 'Hands-on workshop on creating content that resonates with African consumers. Covers local languages, cultural context, platform preferences, and storytelling.',
      type: EventType.WORKSHOP,
      startDate: new Date('2026-06-05T09:00:00Z'),
      endDate: new Date('2026-06-05T17:00:00Z'),
      isOnline: true,
      meetingLink: 'https://zoom.us/j/example2',
      maxAttendees: 50,
      tags: ['content marketing', 'africa', 'workshop'],
    },
    {
      organizerId: createdUsers[3].id,
      title: 'ScaleAfrique Demo Day — Southern Africa',
      description: 'Quarterly demo day for Southern African startups. 10 startups pitch to investors, corporates, and partners. Apply to pitch or register to attend.',
      type: EventType.NETWORKING,
      startDate: new Date('2026-06-15T09:00:00Z'),
      endDate: new Date('2026-06-15T18:00:00Z'),
      isOnline: false,
      location: 'The Workshop, Cape Town, South Africa',
      maxAttendees: 150,
      tags: ['demo day', 'southern africa', 'pitch'],
    },
    {
      organizerId: createdUsers[4].id,
      title: 'Arabic Digital Marketing for MENA & North Africa',
      description: 'Webinar covering SEO, social media, and paid advertising in Arabic. Includes case studies from Egypt, Morocco, and Tunisia.',
      type: EventType.WEBINAR,
      startDate: new Date('2026-06-22T14:00:00Z'),
      endDate: new Date('2026-06-22T16:00:00Z'),
      isOnline: true,
      meetingLink: 'https://zoom.us/j/example3',
      maxAttendees: 300,
      tags: ['arabic', 'north africa', 'digital marketing', 'mena'],
    },
  ];

  for (const event of events) {
    await prisma.event.create({ data: event });
  }
  console.log('Created 5 events');

  // Resources
  const resources = [
    {
      userId: kofiUser.id,
      title: 'African Startup Marketing Playbook 2026',
      description: 'Comprehensive guide covering marketing channels, budgets, and strategies for startups across 10 African markets. Includes data on mobile penetration, social media usage, and consumer behaviour.',
      type: ResourceType.GUIDE,
      fileUrl: 'https://assets.scaleafrique.com/resources/african-startup-marketing-playbook-2026.pdf',
      tags: ['marketing', 'guide', 'africa', 'startups'],
      isPublic: true,
    },
    {
      userId: amakaUser.id,
      title: 'Social Media Content Calendar Template (Africa Edition)',
      description: 'Ready-to-use content calendar template adapted for African platforms and audiences. Includes prompts for Facebook, Instagram, Twitter, LinkedIn, and WhatsApp.',
      type: ResourceType.TEMPLATE,
      fileUrl: 'https://assets.scaleafrique.com/resources/social-media-calendar-africa.xlsx',
      tags: ['template', 'content calendar', 'social media'],
      isPublic: true,
    },
    {
      userId: wanjikuUser.id,
      title: 'M-Pesa & Mobile Money Integration Guide for Startups',
      description: 'Technical and marketing guide for integrating mobile money payments (M-Pesa, MTN MoMo, Orange Money) and leveraging them in your marketing.',
      type: ResourceType.GUIDE,
      fileUrl: 'https://assets.scaleafrique.com/resources/mobile-money-integration-guide.pdf',
      tags: ['mobile money', 'mpesa', 'mtn momo', 'payments', 'guide'],
      isPublic: true,
    },
    {
      userId: createdUsers[3].id,
      title: 'E-commerce Campaign ROI Calculator',
      description: 'Excel-based ROI calculator for e-commerce marketing campaigns. Pre-configured for South African, Kenyan, and Nigerian market benchmarks.',
      type: ResourceType.TOOL,
      fileUrl: 'https://assets.scaleafrique.com/resources/ecommerce-roi-calculator.xlsx',
      tags: ['roi', 'calculator', 'e-commerce', 'tool'],
      isPublic: true,
    },
    {
      userId: createdUsers[4].id,
      title: 'Case Study: How EduNile Acquired 50,000 Students in 12 Months',
      description: 'Detailed case study covering EduNile\'s growth strategy: channel mix, CAC, LTV, content localisation, and partnership marketing in Egypt and North Africa.',
      type: ResourceType.CASE_STUDY,
      fileUrl: 'https://assets.scaleafrique.com/resources/edunile-growth-case-study.pdf',
      tags: ['case study', 'edtech', 'egypt', 'growth', 'north africa'],
      isPublic: true,
    },
  ];

  for (const resource of resources) {
    await prisma.resource.create({ data: resource });
  }
  console.log('Created 5 resources');

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
