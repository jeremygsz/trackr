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

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing || (existing.createdBy && existing.createdBy !== session.user.id)) {
      return NextResponse.json({ error: 'Non trouvé ou non autorisé' }, { status: 404 });
    }

    const updated = await prisma.category.update({
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

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing || (existing.createdBy && existing.createdBy !== session.user.id)) {
      return NextResponse.json({ error: 'Non trouvé ou non autorisé' }, { status: 404 });
    }

    // Check if subcategories are used
    const subCount = await prisma.subcategory.count({ where: { categoryId: id } });
    if (subCount > 0) {
      return NextResponse.json({ error: 'Cette catégorie contient des sous-catégories et ne peut pas être supprimée.' }, { status: 400 });
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
