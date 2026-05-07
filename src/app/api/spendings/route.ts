import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const body = await req.json();
    const { label, amount, subcategoryId, bankId, date, notes, lines } = body;

    const spendingData: any = {
      userId: session.user.id,
      label,
      subcategoryId,
      spendingDate: new Date(date || new Date()),
      notes,
    };

    if (lines && lines.length > 0) {
      spendingData.lines = {
        create: lines.map((l: any) => ({
          amountGross: l.amountGross,
          discount: l.discount || 0,
          amountNet: l.amountNet,
          bankId: l.bankId,
          label: l.label || label,
        })),
      };
    } else {
      const gross = parseFloat(amount);
      spendingData.lines = {
        create: {
          amountGross: gross,
          discount: 0,
          amountNet: gross,
          bankId: bankId,
          label: label,
        },
      };
    }

    const spending = await prisma.spending.create({
      data: spendingData,
      include: { lines: true }
    });

    return NextResponse.json(spending, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}
