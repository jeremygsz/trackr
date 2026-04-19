import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { addMonths } from 'date-fns';

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const body = await req.json();
    const { label, amount, subcategoryId, bankId, occurrences, startAt, notes } = body;
    
    const numOccurrences = parseInt(occurrences);
    const totalAmount = parseFloat(amount);
    const amountPerOccurrence = totalAmount / numOccurrences;
    const startDate = new Date(startAt);

    // Create installment header
    const installment = await prisma.installment.create({
      data: {
        userId: session.user.id,
        label,
        totalAmount,
        amountPerOccurrence,
        occurrences: numOccurrences,
        subcategoryId,
        bankId,
        startAt: startDate,
        endAt: addMonths(startDate, numOccurrences - 1),
        notes,
        lines: {
          create: Array.from({ length: numOccurrences }).map((_, i) => ({
            dueDate: addMonths(startDate, i),
            amount: amountPerOccurrence,
          }))
        }
      },
    });

    return NextResponse.json(installment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}
