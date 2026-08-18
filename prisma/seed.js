const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial system configuration (Zero fake data policy)...');

  // Set default official system settings
  await prisma.systemSetting.upsert({
    where: { key: 'eyantra_portal_url' },
    update: {},
    create: {
      key: 'eyantra_portal_url',
      value: 'https://portal.e-yantra.org',
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: 'competition_stage' },
    update: {},
    create: {
      key: 'competition_stage',
      value: 'Registration / Theme Selection',
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: 'team_name' },
    update: {},
    create: {
      key: 'team_name',
      value: 'e-Yantra Robotics Team',
    },
  });

  console.log('System configuration initialized successfully. No fake competition data seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
