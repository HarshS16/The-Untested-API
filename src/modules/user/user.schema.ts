import { z } from 'zod';
import { Role, Status } from '@prisma/client';

export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must not exceed 100 characters'),
  role: z
    .nativeEnum(Role, { message: 'Invalid role. Must be one of: VIEWER, ANALYST, ADMIN' }),
  status: z
    .nativeEnum(Status, { message: 'Invalid status. Must be one of: ACTIVE, INACTIVE' })
    .optional()
    .default(Status.ACTIVE),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim()
    .optional(),
  role: z
    .nativeEnum(Role, { message: 'Invalid role. Must be one of: VIEWER, ANALYST, ADMIN' })
    .optional(),
  status: z
    .nativeEnum(Status, { message: 'Invalid status. Must be one of: ACTIVE, INACTIVE' })
    .optional(),
});

export const userQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(Status).optional(),
  search: z.string().optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
