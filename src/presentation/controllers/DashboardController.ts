import { Request, Response } from 'express';
import { rentalAnalyticsService } from '../../application/services/RentalAnalyticsService.js';
import { bookPopularityService } from '../../application/services/BookPopularityService.js';
import { memberBehaviorService } from '../../application/services/MemberBehaviorService.js';
import { overdueAnalyticsService } from '../../application/services/OverdueAnalyticsService.js';
import { rentalReportsService } from '../../application/services/RentalReportsService.js';
import { rentalHistoryRepository } from '../../data-access/repositories/RentalHistoryRepository.js';

/**
 * Dashboard Controller
 *
 * Provides real-time dashboard endpoints that aggregate data from all analytics services.
 * Designed to support library management dashboards with:
 * 
 * - Real-time overview metrics and key performance indicators
 * - Interactive widgets for different aspects of library operations
 * - Alert and notification systems for immediate attention items
 * - Customizable dashboard layouts and data refresh capabilities
 * - Quick action items and management shortcuts
 */

// Dashboard interfaces and types
export interface DashboardMetrics {
  timestamp: string;
  library_overview: {
    total_active_books: number;
    total_active_members: number;
    total_active_loans: number;
    books_available: number;
    overdue_books: number;
    daily_circulation: number;
  };
  performance_indicators: {
    circulation_rate: number;
    member_engagement_rate: number;
    collection_utilization_rate: number;
    on_time_return_rate: number;
    system_health_score: number;
  };
  recent_activity: {
    books_borrowed_today: number;
    books_returned_today: number;
    new_members_today: number;
    overdue_notifications_sent: number;
  };
}

export interface DashboardWidget {
  widget_id: string;
  widget_type: WidgetType;
  title: string;
  data: any;
  last_updated: string;
  refresh_interval_seconds: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export type WidgetType = 
  | 'summary_stats'
  | 'popular_books'
  | 'member_activity'
  | 'overdue_alerts' 
  | 'trending_genres'
  | 'system_alerts'
  | 'recent_transactions'
  | 'performance_chart'
  | 'member_segments'
  | 'financial_summary';

export interface SystemAlert {
  alert_id: string;
  alert_type: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  created_at: string;
  action_required: boolean;
  action_url?: string;
  action_label?: string;
  dismissible: boolean;
  auto_dismiss_hours?: number;
}

export interface QuickAction {
  action_id: string;
  label: string;
  description: string;
  icon: string;
  action_type: 'navigation' | 'modal' | 'api_call' | 'external';
  target: string;
  badge_count?: number;
  enabled: boolean;
}

export interface DashboardConfig {
  layout: 'grid' | 'list' | 'custom';
  widgets: Array<{
    widget_id: string;
    position: { row: number; col: number; width: number; height: number };
    enabled: boolean;
  }>;
  refresh_interval_seconds: number;
  theme: 'light' | 'dark' | 'auto';
  timezone: string;
}

export class DashboardController {
  /**
   * Get comprehensive dashboard overview with all key metrics
   */
  async getDashboardOverview(req: Request, res: Response): Promise<void> {
    try {
      const [
        rentalStats,
        overdueStats,
        memberSegments,
        popularBooks,
        recentTrends
      ] = await Promise.all([
        rentalAnalyticsService.getRentalStatistics(),
        overdueAnalyticsService.getOverdueSummary(),
        memberBehaviorService.getMemberSegments(),
        bookPopularityService.getMostPopularBooks({ limit: 5 }),
        overdueAnalyticsService.getOverdueTrends('daily', undefined, undefined, 7)
      ]);

      // Calculate additional metrics
      const totalBooks = await this.getTotalBooksCount();
      const totalMembers = await this.getTotalMembersCount();
      const booksAvailable = totalBooks - rentalStats.active_rentals;
      
      // Calculate performance indicators
      const circulationRate = rentalStats.total_transactions / 30; // Daily average
      const memberEngagementRate = (rentalStats.unique_borrowers / totalMembers) * 100;
      const collectionUtilizationRate = (rentalStats.unique_books_borrowed / totalBooks) * 100;
      const onTimeReturnRate = Math.max(0, 100 - (overdueStats as any).overdue_rate);
      const systemHealthScore = this.calculateSystemHealth(rentalStats, overdueStats);

      const dashboardMetrics: DashboardMetrics = {
        timestamp: new Date().toISOString(),
        library_overview: {
          total_active_books: totalBooks,
          total_active_members: totalMembers,
          total_active_loans: rentalStats.active_rentals,
          books_available: booksAvailable,
          overdue_books: (overdueStats as any).current_overdue_count || 0,
          daily_circulation: Math.round(circulationRate * 10) / 10
        },
        performance_indicators: {
          circulation_rate: Math.round(circulationRate * 100) / 100,
          member_engagement_rate: Math.round(memberEngagementRate * 100) / 100,
          collection_utilization_rate: Math.round(collectionUtilizationRate * 100) / 100,
          on_time_return_rate: Math.round(onTimeReturnRate * 100) / 100,
          system_health_score: systemHealthScore
        },
        recent_activity: {
          books_borrowed_today: await this.getBooksActivityToday('borrowed'),
          books_returned_today: await this.getBooksActivityToday('returned'),
          new_members_today: await this.getNewMembersToday(),
          overdue_notifications_sent: await this.getOverdueNotificationsToday()
        }
      };

      res.json(dashboardMetrics);
    } catch (error) {
      console.error('Error generating dashboard overview:', error);
      res.status(500).json({ error: 'Failed to generate dashboard overview' });
    }
  }

  /**
   * Get all dashboard widgets with their current data
   */
  async getDashboardWidgets(req: Request, res: Response): Promise<void> {
    try {
      const widgets: DashboardWidget[] = [
        await this.getSummaryStatsWidget(),
        await this.getPopularBooksWidget(),
        await this.getMemberActivityWidget(),
        await this.getOverdueAlertsWidget(),
        await this.getTrendingGenresWidget(),
        await this.getSystemAlertsWidget(),
        await this.getRecentTransactionsWidget(),
        await this.getMemberSegmentsWidget(),
        await this.getFinancialSummaryWidget()
      ];

      res.json({ widgets, last_updated: new Date().toISOString() });
    } catch (error) {
      console.error('Error fetching dashboard widgets:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard widgets' });
    }
  }

  /**
   * Get specific widget data by widget ID
   */
  async getDashboardWidget(req: Request, res: Response): Promise<void> {
    try {
      const { widgetId } = req.params;
      
      let widget: DashboardWidget;
      
      switch (widgetId) {
        case 'summary_stats':
          widget = await this.getSummaryStatsWidget();
          break;
        case 'popular_books':
          widget = await this.getPopularBooksWidget();
          break;
        case 'member_activity':
          widget = await this.getMemberActivityWidget();
          break;
        case 'overdue_alerts':
          widget = await this.getOverdueAlertsWidget();
          break;
        case 'trending_genres':
          widget = await this.getTrendingGenresWidget();
          break;
        case 'system_alerts':
          widget = await this.getSystemAlertsWidget();
          break;
        case 'recent_transactions':
          widget = await this.getRecentTransactionsWidget();
          break;
        case 'member_segments':
          widget = await this.getMemberSegmentsWidget();
          break;
        case 'financial_summary':
          widget = await this.getFinancialSummaryWidget();
          break;
        default:
          res.status(404).json({ error: 'Widget not found' });
          return;
      }
      
      res.json(widget);
    } catch (error) {
      console.error('Error fetching dashboard widget:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard widget' });
    }
  }

  /**
   * Get system alerts and notifications
   */
  async getSystemAlerts(req: Request, res: Response): Promise<void> {
    try {
      const alerts: SystemAlert[] = await this.generateSystemAlerts();
      res.json({ alerts, count: alerts.length });
    } catch (error) {
      console.error('Error fetching system alerts:', error);
      res.status(500).json({ error: 'Failed to fetch system alerts' });
    }
  }

  /**
   * Get quick actions available to the user
   */
  async getQuickActions(req: Request, res: Response): Promise<void> {
    try {
      const [overdueCount, atRiskMembers, reportsAvailable] = await Promise.all([
        this.getOverdueCount(),
        this.getAtRiskMembersCount(),
        this.getAvailableReportsCount()
      ]);

      const quickActions: QuickAction[] = [
        {
          action_id: 'view_overdue',
          label: 'Overdue Books',
          description: 'View and manage overdue book returns',
          icon: 'clock',
          action_type: 'navigation',
          target: '/dashboard/overdue',
          badge_count: overdueCount,
          enabled: true
        },
        {
          action_id: 'member_alerts',
          label: 'Member Alerts',
          description: 'Review members requiring attention',
          icon: 'user-alert',
          action_type: 'navigation', 
          target: '/dashboard/members/alerts',
          badge_count: atRiskMembers,
          enabled: true
        },
        {
          action_id: 'generate_report',
          label: 'Generate Reports',
          description: 'Create library performance reports',
          icon: 'file-text',
          action_type: 'modal',
          target: 'report-generator',
          enabled: true
        },
        {
          action_id: 'add_book',
          label: 'Add New Book',
          description: 'Add a new book to the collection',
          icon: 'plus',
          action_type: 'navigation',
          target: '/books/add',
          enabled: true
        },
        {
          action_id: 'member_management',
          label: 'Member Management',
          description: 'Manage library members',
          icon: 'users',
          action_type: 'navigation',
          target: '/members',
          enabled: true
        },
        {
          action_id: 'circulation_stats',
          label: 'Circulation Analytics',
          description: 'View detailed circulation statistics',
          icon: 'bar-chart',
          action_type: 'navigation',
          target: '/analytics/circulation',
          enabled: true
        }
      ];

      res.json({ actions: quickActions });
    } catch (error) {
      console.error('Error fetching quick actions:', error);
      res.status(500).json({ error: 'Failed to fetch quick actions' });
    }
  }

  /**
   * Get performance metrics over time
   */
  async getPerformanceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { period = 'monthly', limit = 12 } = req.query;
      const periodType = (period as string) === 'weekly' ? 'weekly' : 
                        (period as string) === 'daily' ? 'daily' : 'monthly';
      
      const trends = await overdueAnalyticsService.getOverdueTrends(
        periodType, 
        undefined, 
        undefined, 
        Number(limit)
      );

      const performanceMetrics = trends.map(trend => ({
        period: trend.period,
        circulation_count: trend.total_due_books,
        overdue_rate: trend.overdue_rate,
        member_count: trend.unique_overdue_members,
        performance_score: Math.max(0, 100 - trend.overdue_rate * 2)
      }));

      res.json({ 
        metrics: performanceMetrics.reverse(), // Show chronological order
        period_type: periodType,
        total_periods: performanceMetrics.length 
      });
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      res.status(500).json({ error: 'Failed to fetch performance metrics' });
    }
  }

  /**
   * Generate a specific report type
   */
  async generateDashboardReport(req: Request, res: Response): Promise<void> {
    try {
      const { reportType } = req.params;
      const { format = 'json', ...filters } = req.query;

      let report;
      
      switch (reportType) {
        case 'library_summary':
          report = await rentalReportsService.generateLibrarySummaryReport({
            reportFormat: format as any,
            ...filters
          });
          break;
        case 'book_popularity':
          report = await rentalReportsService.generateBookPopularityReport({
            reportFormat: format as any,
            ...filters
          });
          break;
        case 'member_behavior':
          report = await rentalReportsService.generateMemberBehaviorReport({
            reportFormat: format as any,
            ...filters
          });
          break;
        case 'overdue_management':
          report = await rentalReportsService.generateOverdueManagementReport({
            reportFormat: format as any,
            ...filters
          });
          break;
        default:
          res.status(400).json({ error: 'Invalid report type' });
          return;
      }

      // Export in requested format
      const exportResult = await rentalReportsService.exportReport(report, format as any);
      
      if (format === 'json') {
        res.json(report);
      } else {
        res.set({
          'Content-Type': this.getContentType(format as string),
          'Content-Disposition': `attachment; filename="library_report_${reportType}.${format}"`
        });
        res.send(exportResult.data);
      }
    } catch (error) {
      console.error('Error generating dashboard report:', error);
      res.status(500).json({ error: 'Failed to generate report' });
    }
  }

  // Widget implementations
  private async getSummaryStatsWidget(): Promise<DashboardWidget> {
    const rentalStats = await rentalAnalyticsService.getRentalStatistics();
    const overdueStats = await overdueAnalyticsService.getOverdueSummary();
    
    return {
      widget_id: 'summary_stats',
      widget_type: 'summary_stats',
      title: 'Library Overview',
      data: {
        active_loans: rentalStats.active_rentals,
        completed_loans: rentalStats.completed_rentals,
        overdue_books: (overdueStats as any).current_overdue_count || 0,
        total_transactions: rentalStats.total_transactions
      },
      last_updated: new Date().toISOString(),
      refresh_interval_seconds: 300, // 5 minutes
      priority: 'high'
    };
  }

  private async getPopularBooksWidget(): Promise<DashboardWidget> {
    const popularBooks = await bookPopularityService.getMostPopularBooks({ limit: 5 });
    
    return {
      widget_id: 'popular_books',
      widget_type: 'popular_books',
      title: 'Most Popular Books',
      data: {
        books: popularBooks.map(book => ({
          title: book.title,
          author: book.author,
          borrow_count: book.total_borrows,
          popularity_score: book.popularity_score
        }))
      },
      last_updated: new Date().toISOString(),
      refresh_interval_seconds: 3600, // 1 hour
      priority: 'medium'
    };
  }

  private async getMemberActivityWidget(): Promise<DashboardWidget> {
    const segments = await memberBehaviorService.getMemberSegments();
    
    return {
      widget_id: 'member_activity',
      widget_type: 'member_activity',
      title: 'Member Activity',
      data: {
        segments: segments.map(segment => ({
          name: segment.segment_name,
          count: segment.member_count,
          avg_books: segment.average_books_per_member
        }))
      },
      last_updated: new Date().toISOString(),
      refresh_interval_seconds: 1800, // 30 minutes
      priority: 'medium'
    };
  }

  private async getOverdueAlertsWidget(): Promise<DashboardWidget> {
    const overdueTransactions = await overdueAnalyticsService.getCurrentOverdueTransactions({ limit: 10 });
    const criticalCount = overdueTransactions.filter(t => t.risk_level === 'Critical').length;
    
    return {
      widget_id: 'overdue_alerts',
      widget_type: 'overdue_alerts',
      title: 'Overdue Alerts',
      data: {
        total_overdue: overdueTransactions.length,
        critical_count: criticalCount,
        high_risk_count: overdueTransactions.filter(t => t.risk_level === 'High').length,
        recent_overdue: overdueTransactions.slice(0, 5).map(t => ({
          member_name: t.member_name,
          book_title: t.book_title,
          days_overdue: t.days_overdue,
          risk_level: t.risk_level
        }))
      },
      last_updated: new Date().toISOString(),
      refresh_interval_seconds: 600, // 10 minutes
      priority: criticalCount > 0 ? 'critical' : 'high'
    };
  }

  private async getTrendingGenresWidget(): Promise<DashboardWidget> {
    const genrePopularity = await bookPopularityService.getGenrePopularity();
    
    return {
      widget_id: 'trending_genres',
      widget_type: 'trending_genres',
      title: 'Trending Genres',
      data: {
        genres: genrePopularity.slice(0, 8).map(genre => ({
          genre: genre.genre,
          total_borrows: genre.total_borrows,
          books_count: genre.total_books
        }))
      },
      last_updated: new Date().toISOString(),
      refresh_interval_seconds: 7200, // 2 hours
      priority: 'low'
    };
  }

  private async getSystemAlertsWidget(): Promise<DashboardWidget> {
    const alerts = await this.generateSystemAlerts();
    
    return {
      widget_id: 'system_alerts',
      widget_type: 'system_alerts',
      title: 'System Alerts',
      data: {
        alert_count: alerts.length,
        critical_count: alerts.filter(a => a.alert_type === 'critical').length,
        alerts: alerts.slice(0, 5)
      },
      last_updated: new Date().toISOString(),
      refresh_interval_seconds: 300, // 5 minutes
      priority: alerts.some(a => a.alert_type === 'critical') ? 'critical' : 'medium'
    };
  }

  private async getRecentTransactionsWidget(): Promise<DashboardWidget> {
    // Simplified - would need actual recent transaction queries
    return {
      widget_id: 'recent_transactions',
      widget_type: 'recent_transactions',
      title: 'Recent Activity',
      data: {
        recent_borrows: [],
        recent_returns: [],
        activity_count_today: await this.getBooksActivityToday('borrowed')
      },
      last_updated: new Date().toISOString(),
      refresh_interval_seconds: 300, // 5 minutes
      priority: 'low'
    };
  }

  private async getMemberSegmentsWidget(): Promise<DashboardWidget> {
    const segments = await memberBehaviorService.getMemberSegments();
    
    return {
      widget_id: 'member_segments',
      widget_type: 'member_segments',
      title: 'Member Segments',
      data: {
        segments: segments.map(segment => ({
          name: segment.segment_name,
          count: segment.member_count,
          description: segment.description,
          engagement_score: segment.average_engagement_score
        }))
      },
      last_updated: new Date().toISOString(),
      refresh_interval_seconds: 3600, // 1 hour
      priority: 'medium'
    };
  }

  private async getFinancialSummaryWidget(): Promise<DashboardWidget> {
    const overdueTransactions = await overdueAnalyticsService.getCurrentOverdueTransactions();
    const totalFees = overdueTransactions.reduce((sum, t) => sum + t.late_fee_amount, 0);
    
    return {
      widget_id: 'financial_summary',
      widget_type: 'financial_summary',
      title: 'Financial Summary',
      data: {
        total_outstanding_fees: Math.round(totalFees * 100) / 100,
        fee_count: overdueTransactions.length,
        estimated_collection: Math.round(totalFees * 0.75 * 100) / 100, // 75% collection rate
        monthly_revenue_impact: Math.round(totalFees * 0.75 * 100) / 100
      },
      last_updated: new Date().toISOString(),
      refresh_interval_seconds: 3600, // 1 hour
      priority: 'medium'
    };
  }

  // Helper methods
  private async generateSystemAlerts(): Promise<SystemAlert[]> {
    const alerts: SystemAlert[] = [];
    const overdueStats = await overdueAnalyticsService.getOverdueSummary();
    const overdueCount = (overdueStats as any).current_overdue_count || 0;
    
    if (overdueCount > 50) {
      alerts.push({
        alert_id: 'high_overdue_count',
        alert_type: 'critical',
        title: 'High Overdue Book Count',
        message: `${overdueCount} books are currently overdue. Immediate attention required.`,
        created_at: new Date().toISOString(),
        action_required: true,
        action_url: '/dashboard/overdue',
        action_label: 'Review Overdue Books',
        dismissible: false
      });
    } else if (overdueCount > 20) {
      alerts.push({
        alert_id: 'moderate_overdue_count',
        alert_type: 'warning',
        title: 'Moderate Overdue Book Count',
        message: `${overdueCount} books are currently overdue. Please review.`,
        created_at: new Date().toISOString(),
        action_required: true,
        action_url: '/dashboard/overdue',
        action_label: 'Review Overdue Books',
        dismissible: true,
        auto_dismiss_hours: 24
      });
    }

    // Add more system alerts based on various conditions
    const memberSegments = await memberBehaviorService.getMemberSegments();
    const atRiskSegment = memberSegments.find(s => s.segment_name === 'At-Risk Members');
    
    if (atRiskSegment && atRiskSegment.member_count > 10) {
      alerts.push({
        alert_id: 'at_risk_members',
        alert_type: 'warning',
        title: 'Members Need Attention',
        message: `${atRiskSegment.member_count} members are identified as at-risk. Consider engagement programs.`,
        created_at: new Date().toISOString(),
        action_required: false,
        action_url: '/dashboard/members/segments',
        action_label: 'View Member Segments',
        dismissible: true,
        auto_dismiss_hours: 48
      });
    }

    return alerts;
  }

  private calculateSystemHealth(rentalStats: any, overdueStats: any): number {
    const overdueRate = (overdueStats as any).overdue_rate || 0;
    const activityScore = Math.min(100, rentalStats.total_transactions / 10);
    const overdueScore = Math.max(0, 100 - overdueRate * 2);
    const memberScore = Math.min(100, rentalStats.unique_borrowers * 2);
    
    return Math.round((overdueScore + activityScore + memberScore) / 3);
  }

  private async getTotalBooksCount(): Promise<number> {
    // Would implement actual database query
    return 1000; // Mock data
  }

  private async getTotalMembersCount(): Promise<number> {
    // Would implement actual database query
    return 500; // Mock data
  }

  private async getBooksActivityToday(type: 'borrowed' | 'returned'): Promise<number> {
    // Would implement actual database query for today's activity
    return type === 'borrowed' ? 15 : 12; // Mock data
  }

  private async getNewMembersToday(): Promise<number> {
    // Would implement actual database query
    return 2; // Mock data
  }

  private async getOverdueNotificationsToday(): Promise<number> {
    // Would implement actual notification tracking
    return 8; // Mock data
  }

  private async getOverdueCount(): Promise<number> {
    const stats = await overdueAnalyticsService.getOverdueSummary();
    return (stats as any).current_overdue_count || 0;
  }

  private async getAtRiskMembersCount(): Promise<number> {
    const atRiskMembers = await memberBehaviorService.getAtRiskMembers();
    return atRiskMembers.length;
  }

  private async getAvailableReportsCount(): Promise<number> {
    return 5; // Number of different report types available
  }

  private getContentType(format: string): string {
    switch (format) {
      case 'csv': return 'text/csv';
      case 'pdf': return 'application/pdf';
      case 'excel': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default: return 'application/json';
    }
  }
}

// Export singleton instance
export const dashboardController = new DashboardController();