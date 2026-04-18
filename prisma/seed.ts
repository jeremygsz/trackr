import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Début du seeding...');

  try {
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@trackr.fr' },
      update: {},
      create: {
        email: 'admin@trackr.fr',
        firstname: 'Admin',
        lastname: 'Trackr',
        password: adminPassword,
        role: 'admin',
      },
    });

    console.log(`✅ Admin créé : ${admin.email}`);

    const codes = [
      { code: 'TRACKR-2026', expiresAt: null },
      { code: 'VIP-ACCESS', expiresAt: null },
      { code: 'BETA-TEST', expiresAt: new Date('2026-12-31') },
    ];

    for (const item of codes) {
      await prisma.inviteCode.upsert({
        where: { code: item.code },
        update: {},
        create: {
          code: item.code,
          createdBy: admin.id,
          expiresAt: item.expiresAt,
        },
      });
    }

    console.log('✅ Codes d\'invitation créés');
    console.log('🌱 Seeding terminé !');
  } catch (error) {
    console.error('❌ Erreur :', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
