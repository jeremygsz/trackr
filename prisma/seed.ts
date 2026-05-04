import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Début du seeding...');

  try {
    // 1. ADMIN USER
    const adminPassword = await bcrypt.hash('JeremY@2021', 12);
    const admin = await prisma.user.upsert({
      where: { email: 'jerem.grosz@gmail.com' },
      update: {
        password: adminPassword,
      },
      create: {
        email: 'jerem.grosz@gmail.com',
        firstname: 'Jérémy',
        lastname: 'Gsz',
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
      // Supermarchés
      { label: 'Monoprix', logo: 'https://www.monoprix.fr/favicon.ico', website: 'https://www.monoprix.fr' },
      { label: "Monop'", logo: 'https://www.monoprix.fr/favicon.ico', website: 'https://www.monoprix.fr' },
      { label: 'Franprix', logo: 'https://www.franprix.fr/favicon.ico', website: 'https://www.franprix.fr' },
      { label: 'Carrefour', logo: 'https://www.carrefour.fr/favicon.ico', website: 'https://www.carrefour.fr' },
      { label: 'Lidl', logo: 'https://www.lidl.fr/favicon.ico', website: 'https://www.lidl.fr' },
      { label: 'E.Leclerc', logo: 'https://www.e.leclerc/favicon.ico', website: 'https://www.e.leclerc' },
      { label: 'Auchan', logo: 'https://www.auchan.fr/favicon.ico', website: 'https://www.auchan.fr' },
      { label: 'Aldi', logo: 'https://www.aldi.fr/favicon.ico', website: 'https://www.aldi.fr' },
      { label: 'Picard', logo: 'https://www.picard.fr/favicon.ico', website: 'https://www.picard.fr' },
      { label: 'Leader Price', logo: 'https://www.leaderprice.fr/favicon.ico', website: 'https://www.leaderprice.fr' },
      
      // Shopping & Divers
      { label: 'Normal', logo: 'https://www.normal.fr/favicon.ico', website: 'https://www.normal.fr' },
      { label: 'Action', logo: 'https://www.action.com/favicon.ico', website: 'https://www.action.com' },
      { label: 'Amazon', logo: 'https://www.amazon.fr/favicon.ico', website: 'https://www.amazon.fr' },
      { label: 'Apple', logo: 'https://www.apple.com/favicon.ico', website: 'https://www.apple.com' },
      { label: 'Sephora', logo: 'https://www.sephora.fr/favicon.ico', website: 'https://www.sephora.fr' },
      { label: 'IKEA', logo: 'https://www.ikea.com/favicon.ico', website: 'https://www.ikea.com' },
      { label: 'Leroy Merlin', logo: 'https://www.leroymerlin.fr/favicon.ico', website: 'https://www.leroymerlin.fr' },
      { label: 'Decathlon', logo: 'https://www.decathlon.fr/favicon.ico', website: 'https://www.decathlon.fr' },
      { label: 'Zara', logo: 'https://www.zara.com/favicon.ico', website: 'https://www.zara.com' },
      { label: 'H&M', logo: 'https://www2.hm.com/favicon.ico', website: 'https://www.hm.com' },
      { label: 'Vinted', logo: 'https://www.vinted.fr/favicon.ico', website: 'https://www.vinted.fr' },

      // Services & Food
      { label: 'Netflix', logo: 'https://www.netflix.com/favicon.ico', website: 'https://www.netflix.com' },
      { label: 'Spotify', logo: 'https://www.spotify.com/favicon.ico', website: 'https://www.spotify.com' },
      { label: 'Disney+', logo: 'https://www.disneyplus.com/favicon.ico', website: 'https://www.disneyplus.com' },
      { label: 'Uber', logo: 'https://www.uber.com/favicon.ico', website: 'https://www.uber.com' },
      { label: 'Uber Eats', logo: 'https://www.ubereats.com/favicon.ico', website: 'https://www.ubereats.com' },
      { label: 'Deliveroo', logo: 'https://deliveroo.fr/favicon.ico', website: 'https://www.deliveroo.fr' },
      { label: 'SNCF', logo: 'https://www.sncf-connect.com/favicon.ico', website: 'https://www.sncf-connect.com' },
      { label: "McDonald's", logo: 'https://www.mcdonalds.fr/favicon.ico', website: 'https://www.mcdonalds.fr' },
      { label: 'Burger King', logo: 'https://www.burgerking.fr/favicon.ico', website: 'https://www.burgerking.fr' },
      { label: 'Starbucks', logo: 'https://www.starbucks.fr/favicon.ico', website: 'https://www.starbucks.fr' },
      { label: 'TotalEnergies', logo: 'https://totalenergies.fr/favicon.ico', website: 'https://totalenergies.fr' },
      { label: 'Boulangerie', logo: null, website: null },
      { label: 'Tabac / Presse', logo: null, website: null },
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
        label: 'Alimentaire & Quotidien',
        icon: 'utensils',
        color: '#f59e0b',
        subs: ['Supermarché', 'Restaurant', 'Boulangerie', 'Tabac', 'Presse', 'Marché', 'Picard', 'Livraison repas', 'Café & Bars']
      },
      {
        label: 'Logement & Charges',
        icon: 'home',
        color: '#3b82f6',
        subs: ['Loyer', 'Prêt', 'Électricité', 'Eau', 'Gaz', 'Internet / TV', 'Assurance Habitation', 'Travaux / Déco']
      },
      {
        label: 'Transport',
        icon: 'car',
        color: '#ef4444',
        subs: ['Carburant', 'Transports en commun', 'Parking', 'Entretien véhicule', 'Péage', 'Train', 'Avion', 'Uber / Taxi', 'Assurance']
      },
      {
        label: 'Loisirs & Culture',
        icon: 'clapperboard',
        color: '#a855f7',
        subs: ['Abonnement VOD', 'Cinéma', 'Sport / Salle de sport', 'Jeux Vidéo', 'Sorties & Concerts', 'Voyages', 'Livres']
      },
      {
        label: 'Shopping & Mode',
        icon: 'shopping-bag',
        color: '#ec4899',
        subs: ['Vêtements', 'Chaussures', 'Accessoires', 'Cosmétiques / Beauté', 'Électronique', 'Cadeaux', 'Téléphone']
      },
      {
        label: 'Santé & Bien-être',
        icon: 'heart-pulse',
        color: '#10b981',
        subs: ['Pharmacie', 'Médecin', 'Optique', 'Dentaire', 'Mutuelle', 'Psychologue']
      },
      {
        label: 'Services & Finance',
        icon: 'landmark',
        color: '#64748b',
        subs: ['Frais bancaires', 'Assurances', 'Impôts / Taxes', 'Abonnement Téléphonie', 'Juridique']
      },
      {
        label: 'Revenus',
        icon: 'trending-up',
        color: '#10b981',
        subs: ['Salaire', 'Bonus / Prime', 'Vinted', 'Remboursements', 'Dividendes', 'Openclassroom']
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

    console.log('✅ Banques, Commerces, Catégories et Sous-catégories créées');
    console.log('🌱 Seeding terminé !');
  } catch (error) {
    console.error('❌ Erreur :', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
