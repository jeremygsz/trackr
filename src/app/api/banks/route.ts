import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ status: 401 });

  try {
    const { label } = await req.json();
    const bank = await prisma.bank.create({
      data: {
        label,
        userId: session.user.id,
      },
    });
    return NextResponse.json(bank);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}
