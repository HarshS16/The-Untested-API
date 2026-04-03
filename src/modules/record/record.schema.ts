import { z } from 'zod';
import { RecordType } from '@prisma/client';

export const createRecordSchema = z.object({
  amount: z
    .number({ required_error: 'Amount is required', invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be a positive number')
    .max(999999999999, 'Amount exceeds maximum allowed value'),
  type: z.nativeEnum(RecordType, {
    required_error: 'Type is required',
    message: 'Type must be either INCOME or EXPENSE',
  }),
  category: z
    .string({ required_error: 'Category is required' })
    .min(1, 'Category is required')
    .max(100, 'Category must not exceed 100 characters')
    .trim(),
  date: z
    .string({ required_error: 'Date is required' })
    .datetime({ message: 'Date must be a valid ISO 8601 datetime string' })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'))
    .transform((val) => new Date(val)),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .trim()
    .optional()
    .nullable(),
});

export const updateRecordSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be a positive number')
    .max(999999999999, 'Amount exceeds maximum allowed value')
    .optional(),
  type: z
    .nativeEnum(RecordType, { message: 'Type must be either INCOME or EXPENSE' })
    .optional(),
  category: z
    .string()
    .min(1, 'Category cannot be empty')
    .max(100, 'Category must not exceed 100 characters')
    .trim()
    .optional(),
  date: z
    .string()
    .datetime({ message: 'Date must be a valid ISO 8601 datetime string' })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'))
    .transform((val) => new Date(val))
    .optional(),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .trim()
    .optional()
    .nullable(),
});

export const recordQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  type: z.nativeEnum(RecordType).optional(),
  category: z.string().optional(),
  startDate: z
    .string()
    .datetime()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .optional(),
  endDate: z
    .string()
    .datetime()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .optional(),
  minAmount: z.coerce.number().positive().optional(),
  maxAmount: z.coerce.number().positive().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['date', 'amount', 'category', 'createdAt']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const recordIdParamSchema = z.object({
  id: z.string().uuid('Invalid record ID format'),
});

export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
export type RecordQueryInput = z.infer<typeof recordQuerySchema>;
