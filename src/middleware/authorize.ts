import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ApiError } from '../utils/apiError';

/**
 * Role-based authorization middleware factory.
 * Returns middleware that checks if the authenticated user has one of the allowed roles.
 *
 * @param allowedRoles - Roles that are permitted to access the route
 *
 * @example
 * router.get('/admin-only', authenticate, authorize(Role.ADMIN), controller);
 * router.get('/analysts-and-admins', authenticate, authorize(Role.ANALYST, Role.ADMIN), controller);
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `This action requires one of the following roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`
        )
      );
    }

    next();
  };
}
