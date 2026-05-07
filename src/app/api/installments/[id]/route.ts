import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { addMonths } from 'date-fns';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const body = await req.json();
    const { label, amount, subcategoryId, bankId, occurrences, startAt, notes } = body;
    const { id } = await params;
    
    const numOccurrences = parseInt(occurrences);
    const totalAmount = parseFloat(amount);
    const amountPerOccurrence = totalAmount / numOccurrences;
    const startDate = new Date(startAt);

    // Update installment
    const installment = await prisma.installment.update({
      where: { id, userId: session.user.id },
      data: {
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
          deleteMany: {},
          create: Array.from({ length: numOccurrences }).map((_, i) => ({
            dueDate: addMonths(startDate, i),
            amount: amountPerOccurrence,
          }))
        }
      },
    });

    return NextResponse.json(installment);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.installment.delete({
      where: { id, userId: session.user.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
