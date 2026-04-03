import { PrismaClient, Prisma, RecordType } from '@prisma/client';

const prisma = new PrismaClient();

interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
  net: number;
}

interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export class DashboardService {
  /**
   * Get overall financial summary:
   * - Total income
   * - Total expenses
   * - Net balance (income - expenses)
   * - Total number of records
   * - Number of income vs expense records
   */
  async getSummary() {
    const [incomeResult, expenseResult, totalRecords, incomeCount, expenseCount] =
      await Promise.all([
        prisma.financialRecord.aggregate({
          where: { type: RecordType.INCOME, isDeleted: false },
          _sum: { amount: true },
        }),
        prisma.financialRecord.aggregate({
          where: { type: RecordType.EXPENSE, isDeleted: false },
          _sum: { amount: true },
        }),
        prisma.financialRecord.count({ where: { isDeleted: false } }),
        prisma.financialRecord.count({
          where: { type: RecordType.INCOME, isDeleted: false },
        }),
        prisma.financialRecord.count({
          where: { type: RecordType.EXPENSE, isDeleted: false },
        }),
      ]);

    const totalIncome = Number(incomeResult._sum.amount || 0);
    const totalExpenses = Number(expenseResult._sum.amount || 0);
    const netBalance = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      netBalance,
      totalRecords,
      incomeCount,
      expenseCount,
    };
  }

  /**
   * Get category-wise breakdown of financial records.
   * Optionally filter by record type (INCOME or EXPENSE).
   * Returns each category's total, count, and percentage of the overall.
   */
  async getCategoryBreakdown(type?: RecordType) {
    const where: Prisma.FinancialRecordWhereInput = {
      isDeleted: false,
      ...(type && { type }),
    };

    const groups = await prisma.financialRecord.groupBy({
      by: ['category'],
      where,
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: 'desc' } },
    });

    // Calculate total for percentage computation
    const grandTotal = groups.reduce(
      (sum, g) => sum + Number(g._sum.amount || 0),
      0
    );

    const breakdown: CategoryBreakdown[] = groups.map((g) => {
      const total = Number(g._sum.amount || 0);
      return {
        category: g.category,
        total,
        count: g._count.id,
        percentage: grandTotal > 0 ? Math.round((total / grandTotal) * 10000) / 100 : 0,
      };
    });

    return { breakdown, grandTotal };
  }

  /**
   * Get the most recent financial records.
   */
  async getRecentActivity(limit = 10) {
    const records = await prisma.financialRecord.findMany({
      where: { isDeleted: false },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return records;
  }

  /**
   * Get monthly income, expense, and net trends.
   * Returns data for the last N months (default: 12).
   */
  async getMonthlyTrends(months = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const records = await prisma.financialRecord.findMany({
      where: {
        isDeleted: false,
        date: { gte: startDate },
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
      orderBy: { date: 'asc' },
    });

    // Group by year-month
    const monthlyMap = new Map<string, { income: number; expense: number }>();

    // Pre-fill all months
    for (let i = 0; i < months; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { income: 0, expense: 0 });
      }
    }

    // Aggregate amounts
    records.forEach((record) => {
      const date = new Date(record.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthlyMap.get(key) || { income: 0, expense: 0 };

      if (record.type === RecordType.INCOME) {
        existing.income += Number(record.amount);
      } else {
        existing.expense += Number(record.amount);
      }

      monthlyMap.set(key, existing);
    });

    // Convert to sorted array
    const trends: MonthlySummary[] = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        income: Math.round(data.income * 100) / 100,
        expense: Math.round(data.expense * 100) / 100,
        net: Math.round((data.income - data.expense) * 100) / 100,
      }));

    return trends;
  }

  /**
   * Get weekly trends for the last N weeks (default: 8).
   */
  async getWeeklyTrends(weeks = 8) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);
    startDate.setHours(0, 0, 0, 0);

    const records = await prisma.financialRecord.findMany({
      where: {
        isDeleted: false,
        date: { gte: startDate },
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
      orderBy: { date: 'asc' },
    });

    // Group by week (ISO week number)
    const weeklyMap = new Map<string, { income: number; expense: number }>();

    records.forEach((record) => {
      const date = new Date(record.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const key = weekStart.toISOString().split('T')[0];
      const existing = weeklyMap.get(key) || { income: 0, expense: 0 };

      if (record.type === RecordType.INCOME) {
        existing.income += Number(record.amount);
      } else {
        existing.expense += Number(record.amount);
      }

      weeklyMap.set(key, existing);
    });

    const trends = Array.from(weeklyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([weekStart, data]) => ({
        weekStart,
        income: Math.round(data.income * 100) / 100,
        expense: Math.round(data.expense * 100) / 100,
        net: Math.round((data.income - data.expense) * 100) / 100,
      }));

    return trends;
  }
}
