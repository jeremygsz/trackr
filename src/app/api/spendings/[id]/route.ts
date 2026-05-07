import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const body = await req.json();
    const { label, subcategoryId, date, notes, lines } = body;
    const { id } = await params;

    // Verify ownership
    const existing = await prisma.spending.findUnique({
      where: { id, userId: session.user.id }
    });
    if (!existing) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });

    const updateData: any = {
      label,
      subcategoryId,
      spendingDate: new Date(date),
      notes,
    };

    if (lines && lines.length > 0) {
      // We delete old lines and create new ones for simplicity
      updateData.lines = {
        deleteMany: {},
        create: lines.map((l: any) => ({
          amountGross: l.amountGross,
          discount: l.discount || 0,
          amountNet: l.amountNet,
          bankId: l.bankId,
          label: l.label || label,
        })),
      };
    }

    const spending = await prisma.spending.update({
      where: { id },
      data: updateData,
      include: { lines: true }
    });

    return NextResponse.json(spending);
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
    await prisma.spending.delete({
      where: { id, userId: session.user.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
