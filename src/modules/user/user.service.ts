import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ApiError } from '../../utils/apiError';
import { CreateUserInput, UpdateUserInput, UserQueryInput } from './user.schema';

const prisma = new PrismaClient();

// Fields to return (never expose password)
const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: { records: true },
  },
} satisfies Prisma.UserSelect;

export class UserService {
  /**
   * Create a new user (Admin only).
   */
  async create(data: CreateUserInput) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw ApiError.conflict('A user with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: data.role,
        status: data.status,
      },
      select: userSelect,
    });

    return user;
  }

  /**
   * Get all users with optional filtering, search, and pagination.
   */
  async getAll(query: UserQueryInput) {
    const { page, limit, role, status, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(role && { role }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: userSelect,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  }

  /**
   * Get a single user by ID.
   */
  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  /**
   * Update a user's profile, role, or status.
   */
  async update(id: string, data: UpdateUserInput) {
    // Check user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw ApiError.notFound('User not found');
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });

    return user;
  }

  /**
   * Deactivate a user (soft delete via status change).
   */
  async deactivate(id: string) {
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw ApiError.notFound('User not found');
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' },
      select: userSelect,
    });

    return user;
  }

  /**
   * Get the currently authenticated user's profile.
   */
  async getProfile(userId: string) {
    return this.getById(userId);
  }
}
