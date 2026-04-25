import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ status: 401 });

  try {
    const { label, parentId } = await req.json();

    if (parentId) {
      // Create Subcategory
      const subcategory = await prisma.subcategory.create({
        data: {
          label,
          categoryId: parentId,
          createdBy: session.user.id,
        },
      });
      return NextResponse.json({ ...subcategory, type: 'subcategory' });
    } else {
      // Create Main Category
      const category = await prisma.category.create({
        data: {
          label,
          createdBy: session.user.id,
        },
      });
      return NextResponse.json({ ...category, type: 'category' });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}
