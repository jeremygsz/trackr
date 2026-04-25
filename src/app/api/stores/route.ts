import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const stores = await prisma.store.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { userId: null }
        ]
      },
      orderBy: { label: 'asc' }
    });
    return NextResponse.json(stores);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const { label, website, logo } = await req.json();

    if (!label) return NextResponse.json({ error: 'Libellé requis' }, { status: 400 });

    const store = await prisma.store.create({
      data: {
        label,
        website,
        logo,
        userId: session.user.id,
      },
    });
    return NextResponse.json(store);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
