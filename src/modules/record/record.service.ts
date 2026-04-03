import { PrismaClient, Prisma } from '@prisma/client';
import { ApiError } from '../../utils/apiError';
import { CreateRecordInput, UpdateRecordInput, RecordQueryInput } from './record.schema';

const prisma = new PrismaClient();

export class RecordService {
  /**
   * Create a new financial record.
   */
  async create(data: CreateRecordInput, userId: string) {
    const record = await prisma.financialRecord.create({
      data: {
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: data.date,
        description: data.description,
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return record;
  }

  /**
   * Get all financial records with filtering, search, pagination, and sorting.
   * Excludes soft-deleted records.
   */
  async getAll(query: RecordQueryInput) {
    const {
      page,
      limit,
      type,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      sortBy,
      sortOrder,
    } = query;

    const skip = (page - 1) * limit;

    // Build dynamic where clause
    const where: Prisma.FinancialRecordWhereInput = {
      isDeleted: false,
      ...(type && { type }),
      ...(category && { category: { contains: category, mode: 'insensitive' as const } }),
      ...(search && {
        OR: [
          { description: { contains: search, mode: 'insensitive' as const } },
          { category: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    // Date range filter
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    // Amount range filter
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) where.amount.gte = new Prisma.Decimal(minAmount);
      if (maxAmount !== undefined) where.amount.lte = new Prisma.Decimal(maxAmount);
    }

    // Build sort
    const orderBy: Prisma.FinancialRecordOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [records, total] = await Promise.all([
      prisma.financialRecord.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.financialRecord.count({ where }),
    ]);

    return { records, total, page, limit };
  }

  /**
   * Get a single financial record by ID.
   */
  async getById(id: string) {
    const record = await prisma.financialRecord.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!record || record.isDeleted) {
      throw ApiError.notFound('Financial record not found');
    }

    return record;
  }

  /**
   * Update a financial record.
   */
  async update(id: string, data: UpdateRecordInput) {
    // Check existence
    const existing = await prisma.financialRecord.findUnique({ where: { id } });
    if (!existing || existing.isDeleted) {
      throw ApiError.notFound('Financial record not found');
    }

    const record = await prisma.financialRecord.update({
      where: { id },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.type && { type: data.type }),
        ...(data.category && { category: data.category }),
        ...(data.date && { date: data.date }),
        ...(data.description !== undefined && { description: data.description }),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return record;
  }

  /**
   * Soft delete a financial record.
   * Sets isDeleted=true instead of removing from the database.
   */
  async softDelete(id: string) {
    const existing = await prisma.financialRecord.findUnique({ where: { id } });
    if (!existing || existing.isDeleted) {
      throw ApiError.notFound('Financial record not found');
    }

    await prisma.financialRecord.update({
      where: { id },
      data: { isDeleted: true },
    });

    return { id, deleted: true };
  }
}
