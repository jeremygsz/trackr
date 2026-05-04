import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const userBanks = await prisma.userBank.findMany({
      where: { userId: session.user.id },
      include: {
        bank: true
      },
      orderBy: { listOrder: 'asc' }
    });

    // Auto-migration for existing users who haven't completed onboarding
    if (userBanks.length === 0) {
      const systemBanks = await prisma.bank.findMany({
        where: { userId: null },
        orderBy: { label: 'asc' }
      });

      const userPersonalBanks = await prisma.bank.findMany({
        where: { userId: session.user.id }
      });

      const allBanks = [...systemBanks, ...userPersonalBanks];
      
      if (allBanks.length > 0) {
        const created = await prisma.$transaction(
          allBanks.map((bank, index) => 
            prisma.userBank.create({
              data: {
                userId: session.user.id,
                bankId: bank.id,
                listOrder: index,
                selected: index === 0
              },
              include: { bank: true }
            })
          )
        );
        return NextResponse.json(created.map(ub => ({ ...ub.bank, selected: ub.selected, listOrder: ub.listOrder })));
      }
    }

    return NextResponse.json(userBanks.map(ub => ({ ...ub.bank, selected: ub.selected, listOrder: ub.listOrder })));
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const { label, color, logo } = await req.json();
    
    if (!label) {
      return NextResponse.json({ error: 'Le libellé est requis' }, { status: 400 });
    }

    const bank = await prisma.$transaction(async (tx) => {
      // 1. Create the bank
      const newBank = await tx.bank.create({
        data: {
          label,
          color,
          logo,
          userId: session.user.id,
        },
      });

      // 2. Get max listOrder
      const lastBank = await tx.userBank.findFirst({
        where: { userId: session.user.id },
        orderBy: { listOrder: 'desc' }
      });

      const nextOrder = lastBank ? lastBank.listOrder + 1 : 0;

      // 3. Create UserBank entry
      await tx.userBank.create({
        data: {
          userId: session.user.id,
          bankId: newBank.id,
          listOrder: nextOrder,
          selected: nextOrder === 0 // If it's the first bank, make it default
        }
      });

      return newBank;
    });

    return NextResponse.json(bank);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}
