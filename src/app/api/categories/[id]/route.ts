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
    const { label, color, icon } = await req.json();
    const { id } = await params;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });

    // Restriction logic: 
    // - If system category (createdBy is null): only admin can modify
    // - If user category: only the creator can modify
    const isOwner = existing.createdBy === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if ((existing.createdBy === null && !isAdmin) || (existing.createdBy !== null && !isOwner)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
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
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const { id } = await params;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });

    // Restriction logic
    const isOwner = existing.createdBy === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if ((existing.createdBy === null && !isAdmin) || (existing.createdBy !== null && !isOwner)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
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
