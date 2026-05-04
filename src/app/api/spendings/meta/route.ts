import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: true,
      },
    });

    const userBanks = await prisma.userBank.findMany({
      where: { userId: session.user.id },
      include: {
        bank: true,
      },
      orderBy: { listOrder: 'asc' },
    });

    const banks = userBanks.map(ub => ({
      ...ub.bank,
      selected: ub.selected,
    }));

    const defaultBankId = userBanks.find(ub => ub.selected)?.bankId || (banks.length > 0 ? banks[0].id : '');

    const stores = await prisma.store.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { userId: null },
        ],
      },
      orderBy: { label: 'asc' },
    });

    return NextResponse.json({ categories, banks, stores, defaultBankId });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors du chargement' }, { status: 500 });
  }
}
