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
    const { label, color, icon } = await req.json();
    const { id } = await params;

    const existing = await prisma.subcategory.findUnique({ where: { id } });
    if (!existing || (existing.createdBy && existing.createdBy !== session.user.id)) {
      return NextResponse.json({ error: 'Non trouvé ou non autorisé' }, { status: 404 });
    }

    const updated = await prisma.subcategory.update({
      where: { id },
      data: { label, color, icon },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
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

    const existing = await prisma.subcategory.findUnique({ where: { id } });
    if (!existing || (existing.createdBy && existing.createdBy !== session.user.id)) {
      return NextResponse.json({ error: 'Non trouvé ou non autorisé' }, { status: 404 });
    }

    // Check usage
    const c1 = await prisma.spending.count({ where: { subcategoryId: id } });
    const c2 = await prisma.subscription.count({ where: { subcategoryId: id } });
    const c3 = await prisma.installment.count({ where: { subcategoryId: id } });
    const c4 = await prisma.income.count({ where: { subcategoryId: id } });

    if (c1 + c2 + c3 + c4 > 0) {
      return NextResponse.json({ error: 'Cette sous-catégorie est utilisée et ne peut pas être supprimée.' }, { status: 400 });
    }

    await prisma.subcategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
