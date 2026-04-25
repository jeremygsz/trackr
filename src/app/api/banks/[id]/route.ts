import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const { label, color, logo } = await req.json();
    const { id } = await params;

    // Verify ownership
    const existingBank = await prisma.bank.findUnique({
      where: { id }
    });

    if (!existingBank || (existingBank.userId && existingBank.userId !== session.user.id)) {
      return NextResponse.json({ error: 'Banque non trouvée ou non autorisée' }, { status: 404 });
    }

    const bank = await prisma.bank.update({
      where: { id },
      data: { label, color, logo },
    });

    return NextResponse.json(bank);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const { id } = await params;

    // Verify ownership
    const existingBank = await prisma.bank.findUnique({
      where: { id }
    });

    if (!existingBank || (existingBank.userId && existingBank.userId !== session.user.id)) {
      return NextResponse.json({ error: 'Banque non trouvée ou non autorisée' }, { status: 404 });
    }

    // Check if bank is used in any transactions
    const count = await prisma.spendingLine.count({ where: { bankId: id } });
    const countSub = await prisma.subscription.count({ where: { bankId: id } });
    const countInst = await prisma.installment.count({ where: { bankId: id } });
    const countInc = await prisma.income.count({ where: { bankId: id } });

    if (count + countSub + countInst + countInc > 0) {
      return NextResponse.json({ 
        error: 'Cette banque est utilisée dans des transactions et ne peut pas être supprimée.' 
      }, { status: 400 });
    }

    await prisma.bank.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
