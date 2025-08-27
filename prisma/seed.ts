import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding GlassWallet database...');

  // Create test users
  const testUser = await prisma.user.upsert({
    where: { email: 'demo@glasswallet.com' },
    update: {},
    create: {
      clerkUserId: 'demo_user_123',
      email: 'demo@glasswallet.com',
      firstName: 'Demo',
      lastName: 'User',
      subscriptionPlan: 'pro',
      creditBalance: 1000, // 1000 credits for demo
    },
  });

  console.log('✅ Created demo user:', testUser.email);

  // Create sample leads
  const sampleLeads = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '(555) 123-4567',
      creditScore: 750,
      incomeEstimate: 7500000, // $75,000 in cents
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '90210',
      consentGiven: true,
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '(555) 987-6543',
      creditScore: 680,
      incomeEstimate: 5000000, // $50,000 in cents
      address: '456 Oak Ave',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      consentGiven: true,
    },
    {
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@example.com',
      phone: '(555) 456-7890',
      creditScore: 620,
      incomeEstimate: 4200000, // $42,000 in cents
      address: '789 Pine St',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      consentGiven: true,
    },
  ];

  const createdLeads = [];
  for (const leadData of sampleLeads) {
    const lead = await prisma.lead.create({
      data: {
        ...leadData,
        userId: testUser.id,
        processedAt: new Date(),
        dataRetentionDate: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000), // 7 years
      },
    });
    createdLeads.push(lead);
    console.log(`✅ Created lead: ${lead.firstName} ${lead.lastName}`);
  }

  // Create credit transactions
  const transactions = [
    {
      leadId: createdLeads[0]?.id || null,
      transactionType: 'pull' as const,
      costInCents: 500, // $5.00
      creditBalanceBefore: 1000,
      creditBalanceAfter: 995,
      crsTransactionId: 'crs_tx_123456',
    },
    {
      leadId: createdLeads[1]?.id || null,
      transactionType: 'pull' as const,
      costInCents: 500,
      creditBalanceBefore: 995,
      creditBalanceAfter: 990,
      crsTransactionId: 'crs_tx_123457',
    },
    {
      leadId: null,
      transactionType: 'purchase' as const,
      costInCents: -5000, // Added $50.00 worth of credits
      creditBalanceBefore: 990,
      creditBalanceAfter: 1040,
      crsTransactionId: null,
    },
  ];

  for (const txData of transactions) {
    const transaction = await prisma.creditTransaction.create({
      data: {
        ...txData,
        userId: testUser.id,
      },
    });
    console.log(`✅ Created transaction: ${transaction.transactionType}`);
  }

  // Create sample pixel connections
  const pixelConnection = await prisma.pixelConnection.create({
    data: {
      userId: testUser.id,
      platformType: 'META',
      connectionName: 'Main Facebook Ads Account',
      connectionStatus: 'active',
      oauthTokens: {
        accessToken: 'demo_access_token',
        refreshToken: 'demo_refresh_token',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      pixelId: 'fb_pixel_123456789',
      syncSettings: {
        syncQualified: true,
        syncWhitelist: true,
        audienceName: 'GlassWallet Qualified Leads',
      },
    },
  });

  console.log('✅ Created pixel connection:', pixelConnection.connectionName);

  // Create lead tags
  const leadTags = [
    {
      leadId: createdLeads[0]?.id || '',
      tagType: 'qualified' as const,
      tagReason: 'High credit score (750+) and income above $60k',
    },
    {
      leadId: createdLeads[1]?.id || '',
      tagType: 'qualified' as const,
      tagReason: 'Good credit score and stable income',
    },
    {
      leadId: createdLeads[2]?.id || '',
      tagType: 'unqualified' as const,
      tagReason: 'Credit score below threshold (620)',
    },
  ];

  for (const tagData of leadTags) {
    if (tagData.leadId) {
      const tag = await prisma.leadTag.create({
        data: {
          ...tagData,
          taggedBy: testUser.id,
        },
      });
      console.log(`✅ Created tag: ${tag.tagType} for lead`);
    }
  }

  // Create auto-tagging rule
  const autoTagRule = await prisma.autoTaggingRule.create({
    data: {
      userId: testUser.id,
      ruleName: 'High Credit Score Auto-Qualification',
      isActive: true,
      conditions: {
        creditScore: { gte: 700 },
        incomeEstimate: { gte: 6000000 }, // $60k+ in cents
      },
      actions: {
        addTag: 'qualified',
        syncToPixels: true,
        webhookEvents: ['lead.qualified'],
      },
      priority: 1,
    },
  });

  console.log('✅ Created auto-tagging rule:', autoTagRule.ruleName);

  // Update user credit balance to match transactions
  await prisma.user.update({
    where: { id: testUser.id },
    data: { creditBalance: 1040 },
  });

  console.log('🎉 Database seeding completed successfully!');
  console.log(`   - Created 1 demo user with ${testUser.creditBalance} credits`);
  console.log(`   - Created ${createdLeads.length} sample leads`);
  console.log(`   - Created ${transactions.length} credit transactions`);
  console.log(`   - Created 1 pixel connection`);
  console.log(`   - Created ${leadTags.length} lead tags`);
  console.log(`   - Created 1 auto-tagging rule`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });