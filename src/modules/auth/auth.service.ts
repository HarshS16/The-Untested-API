import { PrismaClient, Status, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { ApiError } from '../../utils/apiError';
import { RegisterInput, LoginInput } from './auth.schema';

const prisma = new PrismaClient();

export class AuthService {
  /**
   * Register a new user.
   * Hashes the password, creates the user, and returns a JWT token.
   */
  async register(data: RegisterInput) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw ApiError.conflict('A user with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: Role.VIEWER,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = this.generateToken(user.id, user.email, user.role);

    return { user, token };
  }

  /**
   * Login with email and password.
   * Validates credentials, checks account status, and returns a JWT token.
   */
  async login(data: LoginInput) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check account status
    if (user.status === Status.INACTIVE) {
      throw ApiError.unauthorized('Your account has been deactivated. Contact an administrator.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
      token,
    };
  }

  /**
   * Generate a JWT token for the given user.
   */
  private generateToken(id: string, email: string, role: string): string {
    return jwt.sign({ id, email, role }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as any,
    });
  }
}
