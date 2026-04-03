import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { ApiResponse } from '../../utils/apiResponse';

const userService = new UserService();

export class UserController {
  /**
   * POST /api/users
   * Create a new user (Admin only).
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.create(req.body);
      ApiResponse.created(res, user, 'User created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users
   * List all users (Admin only).
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { users, total, page, limit } = await userService.getAll(req.query as any);
      ApiResponse.paginated(res, users, total, page, limit, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/me
   * Get the current authenticated user's profile.
   */
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getProfile(req.user!.id);
      ApiResponse.success(res, user, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/:id
   * Get a user by ID (Admin only).
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getById(req.params.id);
      ApiResponse.success(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/users/:id
   * Update a user's profile, role, or status (Admin only).
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.update(req.params.id, req.body);
      ApiResponse.success(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/users/:id
   * Deactivate a user (Admin only). Sets status to INACTIVE.
   */
  async deactivate(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.deactivate(req.params.id);
      ApiResponse.success(res, user, 'User deactivated successfully');
    } catch (error) {
      next(error);
    }
  }
}
