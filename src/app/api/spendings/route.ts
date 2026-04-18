import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const body = await req.json();
    // Validation Zod simplifiée pour l'exemple
    const { label, amount, subcategoryId, bankId } = body;

    const spending = await prisma.spending.create({
      data: {
        userId: session.user.id,
        label,
        subcategoryId,
        spendingDate: new Date(),
        lines: {
          create: {
            amountNet: amount,
            amountGross: amount,
            bankId: bankId,
            label: label,
          },
        },
      },
    });

    return NextResponse.json(spending, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}
