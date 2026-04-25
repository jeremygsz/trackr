import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { createdBy: session.user.id },
          { createdBy: null }
        ]
      },
      include: {
        subcategories: {
          where: {
            OR: [
              { createdBy: session.user.id },
              { createdBy: null }
            ]
          },
          orderBy: { label: 'asc' }
        }
      },
      orderBy: { label: 'asc' }
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const { label, color, icon, type, categoryId } = await req.json();

    if (!label) {
      return NextResponse.json({ error: 'Le libellé est requis' }, { status: 400 });
    }

    if (type === 'subcategory') {
      if (!categoryId) return NextResponse.json({ error: 'ID de catégorie parente requis' }, { status: 400 });
      
      const subcategory = await prisma.subcategory.create({
        data: {
          label,
          color,
          icon,
          categoryId,
          createdBy: session.user.id,
        },
      });
      return NextResponse.json(subcategory);
    } else {
      const category = await prisma.category.create({
        data: {
          label,
          color,
          icon,
          createdBy: session.user.id,
        },
      });
      return NextResponse.json(category);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}
