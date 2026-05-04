import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    let userStores = await prisma.userStore.findMany({
      where: { userId: session.user.id },
      include: {
        store: true
      },
      orderBy: { listOrder: 'asc' }
    });

    // Auto-population if no user stores exist
    if (userStores.length === 0) {
      const systemStores = await prisma.store.findMany({
        where: { userId: null },
        orderBy: { label: 'asc' }
      });

      const userPersonalStores = await prisma.store.findMany({
        where: { userId: session.user.id }
      });

      const allStores = [...systemStores, ...userPersonalStores];

      if (allStores.length > 0) {
        await prisma.$transaction(
          allStores.map((store, index) =>
            prisma.userStore.create({
              data: {
                userId: session.user.id,
                storeId: store.id,
                listOrder: index,
                selected: false
              }
            })
          )
        );

        // Fetch again after creation
        userStores = await prisma.userStore.findMany({
          where: { userId: session.user.id },
          include: {
            store: true
          },
          orderBy: { listOrder: 'asc' }
        });
      }
    }

    return NextResponse.json(userStores.map(us => ({
      ...us.store,
      selected: us.selected,
      listOrder: us.listOrder
    })));
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const { label, website, logo } = await req.json();

    if (!label) return NextResponse.json({ error: 'Libellé requis' }, { status: 400 });

    const store = await prisma.$transaction(async (tx) => {
      // 1. Create the store
      const newStore = await tx.store.create({
        data: {
          label,
          website,
          logo,
          userId: session.user.id,
        },
      });

      // 2. Get max listOrder
      const lastStore = await tx.userStore.findFirst({
        where: { userId: session.user.id },
        orderBy: { listOrder: 'desc' }
      });

      const nextOrder = lastStore ? lastStore.listOrder + 1 : 0;

      // 3. Create UserStore entry
      await tx.userStore.create({
        data: {
          userId: session.user.id,
          storeId: newStore.id,
          listOrder: nextOrder,
          selected: false
        }
      });

      return newStore;
    });

    return NextResponse.json(store);
  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
