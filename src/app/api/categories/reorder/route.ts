import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { categoryIds } = await req.json();

    if (!Array.isArray(categoryIds)) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    await prisma.$transaction(
      categoryIds.map((categoryId, index) =>
        prisma.userCategory.updateMany({
          where: {
            userId: session.user.id,
            categoryId: categoryId,
          },
          data: {
            listOrder: index,
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[REORDER_CATEGORIES_ERROR]', error);
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
  }
}
