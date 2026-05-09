import { prisma } from '../src/config/database';

async function seedPlans() {
  const plans = [
    {
      name: 'FREE',
      displayName: 'Free',
      price: 0,
      features: JSON.stringify(['5_campaigns', '500_contacts', 'ai_advisor', 'basic_analytics']),
      limits: JSON.stringify({ campaigns: 5, contacts: 500, automations: 2, teamMembers: 1 }),
    },
    {
      name: 'PRO',
      displayName: 'Pro',
      price: 29,
      features: JSON.stringify(['unlimited_campaigns', '5000_contacts', 'ai_advisor', 'advanced_analytics', 'automations', 'crm']),
      limits: JSON.stringify({ campaigns: -1, contacts: 5000, automations: 20, teamMembers: 3 }),
    },
    {
      name: 'AGENCY',
      displayName: 'Agency',
      price: 99,
      features: JSON.stringify(['unlimited_campaigns', 'unlimited_contacts', 'ai_advisor', 'advanced_analytics', 'automations', 'crm', 'team_collaboration', 'white_label']),
      limits: JSON.stringify({ campaigns: -1, contacts: -1, automations: -1, teamMembers: 10 }),
    },
    {
      name: 'ENTERPRISE',
      displayName: 'Enterprise',
      price: 299,
      features: JSON.stringify(['everything']),
      limits: JSON.stringify({ campaigns: -1, contacts: -1, automations: -1, teamMembers: -1 }),
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }
  console.log('Plans seeded successfully');
}

seedPlans().catch(console.error).finally(() => prisma.$disconnect());
