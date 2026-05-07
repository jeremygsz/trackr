import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  format, 
  startOfDay, 
  endOfDay, 
  subDays, 
  startOfWeek 
} from 'date-fns';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const userId = session.user.id;
  const now = new Date();
  
  // Date ranges
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 }); // Starts on Monday
  
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  try {
    // 1. Daily Spending
    const dailySpending = await prisma.spendingLine.aggregate({
      where: {
        spending: { userId, spendingDate: { gte: todayStart, lte: todayEnd } }
      },
      _sum: { amountNet: true }
    });

    // 2. Weekly Spending
    const weeklySpending = await prisma.spendingLine.aggregate({
      where: {
        spending: { userId, spendingDate: { gte: thisWeekStart, lte: todayEnd } }
      },
      _sum: { amountNet: true }
    });

    // 3. Monthly Spendings (Current vs Last Month)
    const currentSpendings = await prisma.spendingLine.aggregate({
      where: {
        spending: { userId, spendingDate: { gte: currentMonthStart, lte: currentMonthEnd } }
      },
      _sum: { amountNet: true }
    });

    const lastSpendings = await prisma.spendingLine.aggregate({
      where: {
        spending: { userId, spendingDate: { gte: lastMonthStart, lte: lastMonthEnd } }
      },
      _sum: { amountNet: true }
    });

    // 4. Subscriptions
    const activeSubscriptions = await prisma.subscription.aggregate({
      where: { userId, isActive: true },
      _sum: { amount: true }
    });

    // 5. Recent Transactions
    const [recentSpendings, recentInstallments] = await Promise.all([
      prisma.spending.findMany({
        where: { userId },
        take: 10,
        orderBy: { spendingDate: 'desc' },
        include: { subcategory: true, lines: true }
      }),
      prisma.installment.findMany({
        where: { userId },
        take: 5,
        orderBy: { startAt: 'desc' },
        include: { subcategory: true, lines: true }
      })
    ]);

    const spendingTransactions = recentSpendings.map(s => ({
      id: s.id,
      label: s.label,
      amount: s.lines.reduce((acc, curr) => acc + Number(curr.amountNet), 0),
      date: s.spendingDate,
      category: s.subcategory.label,
      subcategoryId: s.subcategoryId,
      storeId: s.storeId,
      notes: s.notes,
      lines: s.lines,
      type: 'spending'
    }));

    const installmentTransactions = recentInstallments.map(i => ({
      id: i.id,
      label: i.label,
      amount: Number(i.totalAmount),
      date: i.startAt,
      category: i.subcategory.label,
      subcategoryId: i.subcategoryId,
      storeId: i.storeId,
      notes: i.notes,
      occurrences: i.occurrences,
      bankId: i.bankId,
      lines: i.lines,
      type: 'installment'
    }));

    const transactions = [...spendingTransactions, ...installmentTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 15);

    // 6. Chart Data (Last 7 days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(now, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const dayTotal = await prisma.spendingLine.aggregate({
        where: {
          spending: { userId, spendingDate: { gte: dayStart, lte: dayEnd } }
        },
        _sum: { amountNet: true }
      });

      chartData.push({
        name: format(date, 'dd/MM'),
        total: Number(dayTotal._sum.amountNet || 0)
      });
    }

    // 7. Budget Calculation
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { monthlyBudget: true }
    });

    const currentIncomes = await prisma.income.aggregate({
      where: {
        userId,
        date: { gte: currentMonthStart, lte: currentMonthEnd }
      },
      _sum: { amount: true }
    });

    const incomeTotal = Number(currentIncomes._sum.amount || 0);
    const baseBudget = user?.monthlyBudget ? Number(user.monthlyBudget) : incomeTotal;

    const currentTotal = Number(currentSpendings._sum.amountNet || 0);
    const lastTotal = Number(lastSpendings._sum.amountNet || 0);
    const spendingTrend = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0;

    return NextResponse.json({
      stats: {
        dailySpending: Number(dailySpending._sum.amountNet || 0),
        weeklySpending: Number(weeklySpending._sum.amountNet || 0),
        totalSpending: currentTotal,
        spendingTrend: Math.round(spendingTrend),
        activeSubscriptions: Number(activeSubscriptions._sum.amount || 0),
        budgetRemaining: baseBudget - currentTotal,
        baseBudget
      },
      chartData,
      transactions
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur lors du chargement des données' }, { status: 500 });
  }
}
