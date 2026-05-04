import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    let userCategories = await prisma.userCategory.findMany({
      where: { userId: session.user.id },
      include: {
        category: {
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
          }
        }
      },
      orderBy: { listOrder: 'asc' }
    });

    // Auto-population if no user categories exist
    if (userCategories.length === 0) {
      const systemCategories = await prisma.category.findMany({
        where: { createdBy: null },
        orderBy: { label: 'asc' }
      });

      const userPersonalCategories = await prisma.category.findMany({
        where: { createdBy: session.user.id }
      });

      const allCategories = [...systemCategories, ...userPersonalCategories];

      if (allCategories.length > 0) {
        await prisma.$transaction(
          allCategories.map((category, index) =>
            prisma.userCategory.create({
              data: {
                userId: session.user.id,
                categoryId: category.id,
                listOrder: index,
                selected: false
              }
            })
          )
        );

        // Fetch again after creation
        userCategories = await prisma.userCategory.findMany({
          where: { userId: session.user.id },
          include: {
            category: {
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
              }
            }
          },
          orderBy: { listOrder: 'asc' }
        });
      }
    }

    return NextResponse.json(userCategories.map(uc => ({
      ...uc.category,
      selected: uc.selected,
      listOrder: uc.listOrder
    })));
  } catch (error) {
    console.error('Error fetching categories:', error);
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
      const category = await prisma.$transaction(async (tx) => {
        // 1. Create the category
        const newCategory = await tx.category.create({
          data: {
            label,
            color,
            icon,
            createdBy: session.user.id,
          },
        });

        // 2. Get max listOrder
        const lastCategory = await tx.userCategory.findFirst({
          where: { userId: session.user.id },
          orderBy: { listOrder: 'desc' }
        });

        const nextOrder = lastCategory ? lastCategory.listOrder + 1 : 0;

        // 3. Create UserCategory entry
        await tx.userCategory.create({
          data: {
            userId: session.user.id,
            categoryId: newCategory.id,
            listOrder: nextOrder,
            selected: false
          }
        });

        return newCategory;
      });

      return NextResponse.json(category);
    }
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}
