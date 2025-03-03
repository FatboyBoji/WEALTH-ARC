import { Request, Response } from 'express';
import { StatisticsService } from '../services/StatisticsService';


export class StatisticsController {
  private statisticsService: StatisticsService;

  constructor() {
    this.statisticsService = new StatisticsService();
  }

  // Get income and expenses chart data
  async getIncomeExpensesChart(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const period = req.params.period || 'month';
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      
      const chartData = await this.statisticsService.getIncomeExpensesChart(
        req.user.userId, 
        period,
        year
      );
      
      res.status(200).json(chartData);
    } catch (error) {
      console.error('Error getting income/expenses chart data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get income/expenses chart data'
      });
    }
  }

  // Get expense categories breakdown
  async getCategoryBreakdown(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const period = req.params.period || 'month';
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      
      const categoryData = await this.statisticsService.getCategoryBreakdown(
        req.user.userId, 
        period,
        year
      );
      
      res.status(200).json(categoryData);
    } catch (error) {
      console.error('Error getting category breakdown:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get category breakdown'
      });
    }
  }

  // Get recurring expenses analysis
  async getRecurringExpenses(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const period = req.params.period || 'month';
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      
      const recurringData = await this.statisticsService.getRecurringExpenses(
        req.user.userId, 
        period,
        year
      );
      
      res.status(200).json(recurringData);
    } catch (error) {
      console.error('Error getting recurring expenses:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recurring expenses'
      });
    }
  }

  // Get monthly summaries
  async getMonthlySummaries(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      
      const summaries = await this.statisticsService.getMonthlySummaries(
        req.user.userId, 
        year
      );
      
      res.status(200).json(summaries);
    } catch (error) {
      console.error('Error getting monthly summaries:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get monthly summaries'
      });
    }
  }

  // Get monthly overview
  async getMonthlyOverview(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      
      const overview = await this.statisticsService.getMonthlyOverview(
        req.user.userId,
        month,
        year
      );
      
      res.status(200).json(overview);
    } catch (error) {
      console.error('Error getting monthly overview:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get monthly overview'
      });
    }
  }
} 