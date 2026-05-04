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
    const { label, website, logo } = await req.json();
    const { id } = await params;

    const existing = await prisma.store.findUnique({ where: { id } });
    if (!existing || (existing.userId && existing.userId !== session.user.id)) {
      return NextResponse.json({ error: 'Non trouvé ou non autorisé' }, { status: 404 });
    }

    const updated = await prisma.store.update({
      where: { id },
      data: { label, website, logo },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
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

    const existing = await prisma.store.findUnique({ where: { id } });
    if (!existing || (existing.userId && existing.userId !== session.user.id)) {
      return NextResponse.json({ error: 'Non trouvé ou non autorisé' }, { status: 404 });
    }

    // Check usage
    const c1 = await prisma.spending.count({ where: { storeId: id } });
    const c2 = await prisma.subscription.count({ where: { storeId: id } });
    const c3 = await prisma.installment.count({ where: { storeId: id } });

    if (c1 + c2 + c3 > 0) {
      return NextResponse.json({ error: 'Ce magasin est utilisé et ne peut pas être supprimé.' }, { status: 400 });
    }

    await prisma.store.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
