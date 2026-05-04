import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { storeIds } = await req.json();

    if (!Array.isArray(storeIds)) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    await prisma.$transaction(
      storeIds.map((storeId, index) =>
        prisma.userStore.updateMany({
          where: {
            userId: session.user.id,
            storeId: storeId,
          },
          data: {
            listOrder: index,
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[REORDER_STORES_ERROR]', error);
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
  }
}
