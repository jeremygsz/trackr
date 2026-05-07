import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const categoryId = searchParams.get('categoryId');
  const userId = session.user.id;

  try {
    const [spendings, installments] = await Promise.all([
      prisma.spending.findMany({
        where: {
          userId,
          ...(categoryId ? { subcategory: { categoryId } } : {})
        },
        orderBy: { spendingDate: 'desc' },
        include: {
          subcategory: { include: { category: true } },
          lines: true,
          store: true
        }
      }),
      prisma.installment.findMany({
        where: {
          userId,
          ...(categoryId ? { subcategory: { categoryId } } : {})
        },
        orderBy: { startAt: 'desc' },
        include: {
          subcategory: { include: { category: true } },
          lines: true,
          store: true
        }
      })
    ]);

    const spendingTransactions = spendings.map(s => ({
      id: s.id,
      label: s.label,
      amount: s.lines.reduce((acc, curr) => acc + Number(curr.amountNet), 0),
      date: s.spendingDate,
      category: s.subcategory.label,
      mainCategory: s.subcategory.category.label,
      subcategoryId: s.subcategoryId,
      storeId: s.storeId,
      storeName: s.store?.label,
      notes: s.notes,
      lines: s.lines,
      type: 'spending'
    }));

    const installmentTransactions = installments.map(i => ({
      id: i.id,
      label: i.label,
      amount: Number(i.totalAmount),
      date: i.startAt,
      category: i.subcategory.label,
      mainCategory: i.subcategory.category.label,
      subcategoryId: i.subcategoryId,
      storeId: i.storeId,
      storeName: i.store?.label,
      notes: i.notes,
      occurrences: i.occurrences,
      bankId: i.bankId,
      lines: i.lines,
      type: 'installment'
    }));

    const transactions = [...spendingTransactions, ...installmentTransactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return NextResponse.json(transactions);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur lors du chargement' }, { status: 500 });
  }
}
