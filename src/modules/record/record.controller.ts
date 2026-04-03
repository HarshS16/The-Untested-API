import { Request, Response, NextFunction } from 'express';
import { RecordService } from './record.service';
import { ApiResponse } from '../../utils/apiResponse';

const recordService = new RecordService();

export class RecordController {
  /**
   * POST /api/records
   * Create a new financial record (Admin only).
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await recordService.create(req.body, req.user!.id);
      ApiResponse.created(res, record, 'Financial record created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/records
   * List financial records with filters and pagination.
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { records, total, page, limit } = await recordService.getAll(req.query as any);
      ApiResponse.paginated(res, records, total, page, limit, 'Records retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/records/:id
   * Get a single financial record.
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await recordService.getById(req.params.id);
      ApiResponse.success(res, record, 'Record retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/records/:id
   * Update a financial record (Admin only).
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await recordService.update(req.params.id, req.body);
      ApiResponse.success(res, record, 'Record updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/records/:id
   * Soft delete a financial record (Admin only).
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await recordService.softDelete(req.params.id);
      ApiResponse.success(res, result, 'Record deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
