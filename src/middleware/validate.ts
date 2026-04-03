import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Request validation middleware factory.
 * Validates request body, query parameters, and route parameters against Zod schemas.
 *
 * @example
 * router.post('/records', validate({ body: createRecordSchema }), controller);
 * router.get('/records', validate({ query: filterSchema }), controller);
 */
export function validate(schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as any;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      next();
    } catch (error) {
      next(error); // ZodError will be caught by errorHandler
    }
  };
}
