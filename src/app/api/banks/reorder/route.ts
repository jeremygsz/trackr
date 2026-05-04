import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { bankIds } = await req.json();

    if (!Array.isArray(bankIds)) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    // Utilisation d'une transaction pour mettre à jour l'ordre de toutes les banques de l'utilisateur
    await prisma.$transaction(
      bankIds.map((bankId, index) =>
        prisma.userBank.updateMany({
          where: {
            userId: session.user.id,
            bankId: bankId,
          },
          data: {
            listOrder: index,
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[REORDER_BANKS_ERROR]', error);
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
  }
}
