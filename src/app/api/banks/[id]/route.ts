import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const { label, color, logo } = await req.json();
    const { id } = await params;

    // Verify ownership - only personal banks can be edited
    const existingBank = await prisma.bank.findUnique({
      where: { id }
    });

    if (!existingBank || existingBank.userId !== session.user.id) {
      return NextResponse.json({ error: 'Modification non autorisée pour cette banque' }, { status: 403 });
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
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const { id } = await params;

    // 1. Get the bank to check if it's personal or system
    const bank = await prisma.bank.findUnique({
      where: { id }
    });

    if (!bank) {
      return NextResponse.json({ error: 'Banque non trouvée' }, { status: 404 });
    }

    // 2. Check if bank is used in any transactions for THIS user
    const count = await prisma.spendingLine.count({ 
      where: { 
        bankId: id,
        spending: { userId: session.user.id }
      } 
    });
    const countSub = await prisma.subscription.count({ where: { bankId: id, userId: session.user.id } });
    const countInst = await prisma.installment.count({ where: { bankId: id, userId: session.user.id } });
    const countInc = await prisma.income.count({ where: { bankId: id, userId: session.user.id } });

    if (count + countSub + countInst + countInc > 0) {
      return NextResponse.json({ 
        error: 'Cette banque est utilisée dans vos transactions et ne peut pas être retirée.' 
      }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 3. Remove from UserBank
      await tx.userBank.delete({
        where: { userId_bankId: { userId: session.user.id, bankId: id } }
      });

      // 4. If it's a personal bank, delete the bank itself if not used by others (though userId filter usually means 1 user)
      if (bank.userId === session.user.id) {
        await tx.bank.delete({ where: { id } });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
