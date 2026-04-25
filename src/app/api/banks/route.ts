import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const banks = await prisma.bank.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { userId: null } // System banks if any
        ]
      },
      orderBy: { label: 'asc' }
    });
    return NextResponse.json(banks);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const { label, color, logo } = await req.json();
    
    if (!label) {
      return NextResponse.json({ error: 'Le libellé est requis' }, { status: 400 });
    }

    const bank = await prisma.bank.create({
      data: {
        label,
        color,
        logo,
        userId: session.user.id,
      },
    });
    return NextResponse.json(bank);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}
