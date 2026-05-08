import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const body = await req.json();
    const { label, amount, subcategoryId, storeId, bankId, startAt, recurrency, notes } = body;
    const { id } = await params;

    const subscription = await prisma.subscription.update({
      where: { id, userId: session.user.id },
      data: {
        label,
        amount: parseFloat(amount),
        subcategoryId,
        storeId: storeId || null,
        bankId,
        startAt: new Date(startAt),
        recurrency,
        notes,
      },
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.subscription.delete({
      where: { id, userId: session.user.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
