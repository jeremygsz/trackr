import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Début du seeding...');

  try {
    // 1. ADMIN USER
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@trackr.fr' },
      update: {
        password: adminPassword,
      },
      create: {
        email: 'admin@trackr.fr',
        firstname: 'Admin',
        lastname: 'Trackr',
        password: adminPassword,
        role: 'admin',
      },
    });

    console.log(`✅ Admin créé : ${admin.email}`);

    // 2. INVITE CODES
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

    // 3. BANKS (Global)
    const banks = [
      { label: 'Boursorama', color: '#004289', logo: 'https://www.boursorama.com/favicon.ico' },
      { label: 'Société Générale', color: '#E4002B', logo: 'https://www.societegenerale.com/favicon.ico' },
      { label: 'BNP Paribas', color: '#00965E', logo: 'https://group.bnpparibas/favicon.ico' },
      { label: 'Revolut', color: '#000000', logo: 'https://www.revolut.com/favicon.ico' },
      { label: 'Espèces (Cash)', color: '#10b981', logo: 'banknote' }, // Lucide icon name fallback
    ];

    for (const bank of banks) {
      await prisma.bank.upsert({
        where: { id: `bank-${bank.label.toLowerCase().replace(/\s/g, '-')}` },
        update: { label: bank.label, color: bank.color, logo: bank.logo },
        create: {
          id: `bank-${bank.label.toLowerCase().replace(/\s/g, '-')}`,
          label: bank.label,
          color: bank.color,
          logo: bank.logo,
        },
      });
    }

    // 4. CATEGORIES & SUBCATEGORIES
    const categories = [
      {
        label: 'Alimentaire',
        icon: 'utensils',
        color: '#f59e0b',
        subs: ['Supermarché', 'Restaurant', 'Café', 'Boulangerie']
      },
      {
        label: 'Logement',
        icon: 'home',
        color: '#3b82f6',
        subs: ['Loyer', 'Électricité', 'Eau', 'Internet', 'Assurance Habitation']
      },
      {
        label: 'Transport',
        icon: 'car',
        color: '#ef4444',
        subs: ['Carburant', 'Transports en commun', 'Parking', 'Entretien véhicule']
      },
      {
        label: 'Loisirs',
        icon: 'clapperboard',
        color: '#a855f7',
        subs: ['Cinéma', 'Sport', 'Jeux Vidéo', 'Voyages']
      },
      {
        label: 'Shopping',
        icon: 'shopping-bag',
        color: '#ec4899',
        subs: ['Vêtements', 'Cadeaux', 'Électronique']
      },
      {
        label: 'Santé',
        icon: 'heart-pulse',
        color: '#10b981',
        subs: ['Pharmacie', 'Médecin', 'Mutuelle']
      },
    ];

    for (const cat of categories) {
      const dbCat = await prisma.category.upsert({
        where: { id: `cat-${cat.label.toLowerCase()}` },
        update: { icon: cat.icon, color: cat.color },
        create: {
          id: `cat-${cat.label.toLowerCase()}`,
          label: cat.label,
          icon: cat.icon,
          color: cat.color,
        },
      });

      for (const sub of cat.subs) {
        await prisma.subcategory.upsert({
          where: { id: `sub-${sub.toLowerCase().replace(/\s/g, '-')}` },
          update: { categoryId: dbCat.id },
          create: {
            id: `sub-${sub.toLowerCase().replace(/\s/g, '-')}`,
            label: sub,
            categoryId: dbCat.id,
          },
        });
      }
    }

    console.log('✅ Banques, Catégories et Sous-catégories créées');
    console.log('🌱 Seeding terminé !');
  } catch (error) {
    console.error('❌ Erreur :', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
