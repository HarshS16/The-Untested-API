import { Router } from 'express';
import { Role } from '@prisma/client';
import { DashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';

const router = Router();
const dashboardController = new DashboardController();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Financial dashboard and analytics
 */

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get financial summary (Analyst, Admin)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary with total income, expenses, net balance, and counts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalIncome:
 *                   type: number
 *                 totalExpenses:
 *                   type: number
 *                 netBalance:
 *                   type: number
 *                 totalRecords:
 *                   type: integer
 *                 incomeCount:
 *                   type: integer
 *                 expenseCount:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Analyst or Admin required
 */
router.get(
  '/summary',
  authenticate,
  authorize(Role.VIEWER, Role.ANALYST, Role.ADMIN),
  dashboardController.getSummary.bind(dashboardController)
);

/**
 * @swagger
 * /api/dashboard/category-breakdown:
 *   get:
 *     summary: Get category-wise financial breakdown (Analyst, Admin)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *         description: Filter by record type
 *     responses:
 *       200:
 *         description: Category breakdown with totals and percentages
 */
router.get(
  '/category-breakdown',
  authenticate,
  authorize(Role.VIEWER, Role.ANALYST, Role.ADMIN),
  dashboardController.getCategoryBreakdown.bind(dashboardController)
);

/**
 * @swagger
 * /api/dashboard/recent-activity:
 *   get:
 *     summary: Get recent financial activity (Analyst, Admin)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *     responses:
 *       200:
 *         description: List of recent financial records
 */
router.get(
  '/recent-activity',
  authenticate,
  authorize(Role.VIEWER, Role.ANALYST, Role.ADMIN),
  dashboardController.getRecentActivity.bind(dashboardController)
);

/**
 * @swagger
 * /api/dashboard/trends:
 *   get:
 *     summary: Get financial trends (Analyst, Admin)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [monthly, weekly]
 *           default: monthly
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           description: Number of periods (max 24 for monthly, 52 for weekly)
 *     responses:
 *       200:
 *         description: Trends with income, expense, and net per period
 */
router.get(
  '/trends',
  authenticate,
  authorize(Role.VIEWER, Role.ANALYST, Role.ADMIN),
  dashboardController.getTrends.bind(dashboardController)
);

export default router;
