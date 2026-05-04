import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const { bankId } = await req.json();

    if (!bankId) return NextResponse.json({ error: 'ID de banque requis' }, { status: 400 });

    await prisma.$transaction([
      // 1. Unselect all for this user
      prisma.userBank.updateMany({
        where: { userId: session.user.id },
        data: { selected: false }
      }),
      // 2. Select the chosen one
      prisma.userBank.update({
        where: { userId_bankId: { userId: session.user.id, bankId } },
        data: { selected: true }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
