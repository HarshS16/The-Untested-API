import { Request, Response, NextFunction } from 'express';
import { RecordType } from '@prisma/client';
import { DashboardService } from './dashboard.service';
import { ApiResponse } from '../../utils/apiResponse';

const dashboardService = new DashboardService();

export class DashboardController {
  /**
   * GET /api/dashboard/summary
   * Get overall financial summary (Analyst, Admin).
   */
  async getSummary(_req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await dashboardService.getSummary();
      ApiResponse.success(res, summary, 'Dashboard summary retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/category-breakdown
   * Get category-wise financial breakdown (Analyst, Admin).
   */
  async getCategoryBreakdown(req: Request, res: Response, next: NextFunction) {
    try {
      const type = req.query.type as RecordType | undefined;
      const result = await dashboardService.getCategoryBreakdown(type);
      ApiResponse.success(res, result, 'Category breakdown retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/recent-activity
   * Get recent financial activity (Analyst, Admin).
   */
  async getRecentActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const records = await dashboardService.getRecentActivity(Math.min(limit, 50));
      ApiResponse.success(res, records, 'Recent activity retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/trends
   * Get monthly or weekly financial trends (Analyst, Admin).
   */
  async getTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const period = (req.query.period as string) || 'monthly';
      const count = parseInt(req.query.count as string) || (period === 'weekly' ? 8 : 12);

      let trends;
      if (period === 'weekly') {
        trends = await dashboardService.getWeeklyTrends(Math.min(count, 52));
      } else {
        trends = await dashboardService.getMonthlyTrends(Math.min(count, 24));
      }

      ApiResponse.success(res, { period, trends }, 'Trends retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
