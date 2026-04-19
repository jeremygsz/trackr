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

    const banks = await prisma.bank.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { userId: null },
        ],
      },
    });

    return NextResponse.json({ categories, banks });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors du chargement' }, { status: 500 });
  }
}
