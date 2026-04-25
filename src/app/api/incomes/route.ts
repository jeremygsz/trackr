import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const body = await req.json();
    const { label, amount, subcategoryId, bankId, date, recurrency, notes } = body;

    const income = await prisma.income.create({
      data: {
        userId: session.user.id,
        label,
        amount: parseFloat(amount),
        subcategoryId,
        bankId,
        date: new Date(date || new Date()),
        recurrency: recurrency || null,
        notes,
      },
    });

    return NextResponse.json(income, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}
