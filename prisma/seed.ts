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
      { label: 'BoursoBank', color: '#004289', logo: '/banks/bourso.svg' },
      { label: 'Revolut', color: '#000000', logo: '/banks/revolut.svg' },
      { label: 'N26', color: '#36A1AD', logo: '/banks/n26.svg' },
      { label: 'Hello bank!', color: '#A4E200', logo: '/banks/hellobank.svg' },
      { label: 'Fortuneo', color: '#132A3E', logo: '/banks/fortuneo.svg' },
      { label: 'Société Générale', color: '#E4002B', logo: '/banks/soge.svg' },
      { label: 'BNP Paribas', color: '#00965E', logo: '/banks/bnp.svg' },
      { label: 'Crédit Agricole', color: '#007A5E', logo: '/banks/creditagricole.svg' },
      { label: 'LCL', color: '#003087', logo: '/banks/lcl.svg' },
      { label: 'Banque Populaire', color: '#004B9B', logo: '/banks/populaire.svg' },
      { label: 'Caisse d\'Épargne', color: '#E30613', logo: '/banks/caisseepargne.svg' },
      { label: 'CIC', color: '#003366', logo: '/banks/cic.svg' },
      { label: 'American Express', color: '#006FCF', logo: '/banks/amex.svg' },
      { label: 'Espèces', color: '#10b981', logo: '/banks/cash.svg' },
    ];

    for (const bank of banks) {
      await prisma.bank.upsert({
        where: { label: bank.label },
        update: { color: bank.color, logo: bank.logo },
        create: {
          label: bank.label,
          color: bank.color,
          logo: bank.logo,
        },
      });
    }

    // 4. STORES (Global)
    const stores = [
      { label: 'Monoprix', logo: 'https://www.monoprix.fr/favicon.ico', website: 'https://www.monoprix.fr' },
      { label: "Monop'", logo: 'https://www.monoprix.fr/favicon.ico', website: 'https://www.monoprix.fr' },
      { label: 'Franprix', logo: 'https://www.franprix.fr/favicon.ico', website: 'https://www.franprix.fr' },
      { label: 'Carrefour', logo: 'https://www.carrefour.fr/favicon.ico', website: 'https://www.carrefour.fr' },
      { label: 'Lidl', logo: 'https://www.lidl.fr/favicon.ico', website: 'https://www.lidl.fr' },
      { label: 'E.Leclerc', logo: 'https://www.e.leclerc/favicon.ico', website: 'https://www.e.leclerc' },
      { label: 'Auchan', logo: 'https://www.auchan.fr/favicon.ico', website: 'https://www.auchan.fr' },
      { label: 'Amazon', logo: 'https://www.amazon.fr/favicon.ico', website: 'https://www.amazon.fr' },
      { label: 'Apple', logo: 'https://www.apple.com/favicon.ico', website: 'https://www.apple.com' },
      { label: 'Netflix', logo: 'https://www.netflix.com/favicon.ico', website: 'https://www.netflix.com' },
    ];

    for (const store of stores) {
      await prisma.store.upsert({
        where: { label: store.label },
        update: { logo: store.logo, website: store.website },
        create: {
          label: store.label,
          logo: store.logo,
          website: store.website,
        },
      });
    }

    // 5. CATEGORIES & SUBCATEGORIES
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
      {
        label: 'Revenus',
        icon: 'trending-up',
        color: '#10b981',
        subs: ['Salaire', 'Freelance', 'Ventes (Vinted...)', 'Cadeaux', 'Dividendes']
      },
    ];

    for (const cat of categories) {
      const dbCat = await prisma.category.upsert({
        where: { label: cat.label },
        update: { icon: cat.icon, color: cat.color },
        create: {
          label: cat.label,
          icon: cat.icon,
          color: cat.color,
        },
      });

      for (const sub of cat.subs) {
        await prisma.subcategory.upsert({
          where: { 
            label_categoryId: {
              label: sub,
              categoryId: dbCat.id
            }
          },
          update: {},
          create: {
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
