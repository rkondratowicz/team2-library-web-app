import { databaseConnection } from '../../data-access/DatabaseConnection.js';

/**
 * Overdue Analytics Service
 *
 * Provides comprehensive tracking and analytics for overdue books, including:
 * - Current overdue book tracking and member identification
 * - Late return patterns and member behavior analysis
 * - Overdue fee calculation and fine management
 * - Grace period management and notification scheduling
 * - Repeat offender identification and risk assessment
 * - Historical overdue trends and library performance metrics
 */

// Interfaces for overdue analytics
export interface OverdueTransaction {
  transaction_id: number;
  member_id: string;
  member_name: string;
  member_email: string | null;
  member_status: string;
  book_id: string;
  book_title: string;
  book_author: string;
  book_isbn: string | null;
  copy_id: number;
  borrow_date: string;
  due_date: string;
  days_overdue: number;
  late_fee_amount: number;
  grace_period_remaining: number; // Days remaining in grace period (0 if exceeded)
  notification_count: number; // How many overdue notifications sent
  last_notification_date: string | null;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  member_overdue_history_count: number;
}

export interface LateFee {
  transaction_id: number;
  member_id: string;
  member_name: string;
  book_title: string;
  days_overdue: number;
  base_fee: number;
  daily_fee: number;
  total_fee: number;
  grace_days: number;
  fee_waived: boolean;
  waiver_reason: string | null;
  payment_status: 'Unpaid' | 'Partial' | 'Paid';
  payment_date: string | null;
}

export interface OverduePattern {
  member_id: string;
  member_name: string;
  total_transactions: number;
  overdue_transactions: number;
  overdue_rate: number; // Percentage
  average_days_overdue: number;
  longest_overdue_period: number;
  total_fees_accrued: number;
  total_fees_paid: number;
  repeat_offender_score: number; // 0-100, higher = more problematic
  last_overdue_date: string | null;
  current_overdue_count: number;
  grace_period_violations: number;
}

export interface OverdueTrend {
  period: string; // e.g., "2024-01", "2024-W01", "2024-01-15"
  period_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  total_due_books: number;
  overdue_books: number;
  overdue_rate: number; // Percentage
  average_days_overdue: number;
  unique_overdue_members: number;
  total_late_fees: number;
  books_returned_late: number;
  grace_period_returns: number; // Books returned within grace period
}

export interface GracePeriodConfig {
  grace_period_days: number;
  base_late_fee: number;
  daily_late_fee: number;
  max_late_fee: number;
  notification_intervals: number[]; // Days after due date to send notifications
  auto_suspend_days: number; // Days after which member is auto-suspended
}

export interface OverdueFilters {
  memberId?: string;
  bookId?: string;
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  minDaysOverdue?: number;
  maxDaysOverdue?: number;
  minLateFee?: number;
  maxLateFee?: number;
  graceStatus?: 'within_grace' | 'exceeded_grace';
  memberStatus?: string;
  bookGenre?: string;
  dueDateFrom?: string;
  dueDateTo?: string;

  // Pagination and sorting
  limit?: number;
  offset?: number;
  sortBy?:
    | 'days_overdue'
    | 'late_fee_amount'
    | 'due_date'
    | 'member_name'
    | 'book_title';
  sortOrder?: 'ASC' | 'DESC';
}

export class OverdueAnalyticsService {
  // Default configuration - could be stored in database or config file
  private defaultGraceConfig: GracePeriodConfig = {
    grace_period_days: 3,
    base_late_fee: 1.0,
    daily_late_fee: 0.5,
    max_late_fee: 25.0,
    notification_intervals: [1, 7, 14, 30],
    auto_suspend_days: 60,
  };

  /**
   * Get all currently overdue transactions with comprehensive details
   */
  async getCurrentOverdueTransactions(
    filters?: OverdueFilters
  ): Promise<OverdueTransaction[]> {
    const query = `
      WITH overdue_base AS (
        SELECT 
          bt.id as transaction_id,
          bt.member_id,
          m.first_name || ' ' || m.last_name as member_name,
          m.email as member_email,
          m.status as member_status,
          b.id as book_id,
          b.title as book_title,
          b.author as book_author,
          b.isbn,
          bc.id as copy_id,
          bt.borrow_date,
          bt.due_date,
          
          -- Calculate days overdue (negative means not overdue yet)
          CAST(julianday('now') - julianday(bt.due_date) AS INTEGER) as days_overdue,
          
          -- Grace period calculation
          CASE 
            WHEN julianday('now') - julianday(bt.due_date) <= ? THEN 
              CAST(? - (julianday('now') - julianday(bt.due_date)) AS INTEGER)
            ELSE 0
          END as grace_period_remaining,
          
          -- Count previous overdue transactions for this member
          (SELECT COUNT(*) 
           FROM borrowing_transactions bt2 
           WHERE bt2.member_id = bt.member_id 
             AND bt2.return_date IS NOT NULL
             AND bt2.return_date > bt2.due_date
          ) as member_overdue_history_count
          
        FROM borrowing_transactions bt
        JOIN members m ON bt.member_id = m.member_id
        JOIN book_copies bc ON bt.book_copy_id = bc.id
        JOIN books b ON bc.book_id = b.id
        WHERE bt.status = 'Active'
          AND bt.due_date < datetime('now')
      ),
      overdue_with_fees AS (
        SELECT 
          *,
          -- Late fee calculation
          CASE 
            WHEN days_overdue <= ? THEN 0  -- Within grace period
            WHEN days_overdue <= ? + 1 THEN ?  -- Base fee only
            ELSE ? + ((days_overdue - ? - 1) * ?)  -- Base + daily fees
          END as calculated_fee,
          
          -- Risk level assessment
          CASE 
            WHEN member_overdue_history_count >= 5 AND days_overdue > 30 THEN 'Critical'
            WHEN member_overdue_history_count >= 3 AND days_overdue > 14 THEN 'High'
            WHEN member_overdue_history_count >= 1 AND days_overdue > 7 THEN 'Medium'
            ELSE 'Low'
          END as risk_level,
          
          -- Mock notification data (in real app, would come from notifications table)
          CASE 
            WHEN days_overdue > 30 THEN 4
            WHEN days_overdue > 14 THEN 3
            WHEN days_overdue > 7 THEN 2
            WHEN days_overdue > 1 THEN 1
            ELSE 0
          END as notification_count,
          
          CASE 
            WHEN days_overdue > 1 THEN datetime(due_date, '+' || days_overdue || ' days')
            ELSE NULL
          END as last_notification_date
          
        FROM overdue_base
      )
      SELECT 
        transaction_id,
        member_id,
        member_name,
        member_email,
        member_status,
        book_id,
        book_title,
        book_author,
        isbn,
        copy_id,
        borrow_date,
        due_date,
        days_overdue,
        ROUND(CASE 
          WHEN calculated_fee > ? THEN ?  -- Apply maximum fee cap
          ELSE calculated_fee 
        END, 2) as late_fee_amount,
        grace_period_remaining,
        notification_count,
        last_notification_date,
        risk_level,
        member_overdue_history_count
      FROM overdue_with_fees
      WHERE days_overdue > 0
    `;

    const whereConditions: string[] = [];
    const params: any[] = [
      this.defaultGraceConfig.grace_period_days,
      this.defaultGraceConfig.grace_period_days,
      this.defaultGraceConfig.grace_period_days,
      this.defaultGraceConfig.grace_period_days,
      this.defaultGraceConfig.base_late_fee,
      this.defaultGraceConfig.base_late_fee,
      this.defaultGraceConfig.grace_period_days,
      this.defaultGraceConfig.daily_late_fee,
      this.defaultGraceConfig.max_late_fee,
      this.defaultGraceConfig.max_late_fee,
    ];

    let finalQuery = query;

    if (filters) {
      if (filters.memberId) {
        whereConditions.push('member_id = ?');
        params.push(filters.memberId);
      }

      if (filters.bookId) {
        whereConditions.push('book_id = ?');
        params.push(filters.bookId);
      }

      if (filters.riskLevel) {
        whereConditions.push('risk_level = ?');
        params.push(filters.riskLevel);
      }

      if (filters.minDaysOverdue) {
        whereConditions.push('days_overdue >= ?');
        params.push(filters.minDaysOverdue);
      }

      if (filters.maxDaysOverdue) {
        whereConditions.push('days_overdue <= ?');
        params.push(filters.maxDaysOverdue);
      }

      if (filters.graceStatus) {
        if (filters.graceStatus === 'within_grace') {
          whereConditions.push('grace_period_remaining > 0');
        } else {
          whereConditions.push('grace_period_remaining = 0');
        }
      }

      if (filters.memberStatus) {
        whereConditions.push('member_status = ?');
        params.push(filters.memberStatus);
      }

      if (whereConditions.length > 0) {
        finalQuery += ' AND ' + whereConditions.join(' AND ');
      }
    }

    // Sorting
    const sortBy = filters?.sortBy || 'days_overdue';
    const sortOrder = filters?.sortOrder || 'DESC';

    const sortColumn =
      {
        days_overdue: 'days_overdue',
        late_fee_amount: 'late_fee_amount',
        due_date: 'due_date',
        member_name: 'member_name',
        book_title: 'book_title',
      }[sortBy] || 'days_overdue';

    finalQuery += ` ORDER BY ${sortColumn} ${sortOrder}`;

    // Pagination
    if (filters?.limit) {
      finalQuery += ` LIMIT ${filters.limit}`;
      if (filters.offset) {
        finalQuery += ` OFFSET ${filters.offset}`;
      }
    }

    return (await databaseConnection.all(
      finalQuery,
      params
    )) as OverdueTransaction[];
  }

  /**
   * Calculate late fees for overdue transactions
   */
  async calculateLateFees(
    transactionIds?: number[],
    config?: Partial<GracePeriodConfig>
  ): Promise<LateFee[]> {
    const graceConfig = { ...this.defaultGraceConfig, ...config };

    let query = `
      SELECT 
        bt.id as transaction_id,
        bt.member_id,
        m.first_name || ' ' || m.last_name as member_name,
        b.title as book_title,
        CAST(julianday('now') - julianday(bt.due_date) AS INTEGER) as days_overdue,
        ? as base_fee,
        ? as daily_fee,
        ? as grace_days,
        
        -- Calculate total fee
        CASE 
          WHEN julianday('now') - julianday(bt.due_date) <= ? THEN 0  -- Within grace period
          WHEN julianday('now') - julianday(bt.due_date) <= ? + 1 THEN ?  -- Base fee only  
          ELSE ? + ((julianday('now') - julianday(bt.due_date) - ? - 1) * ?)  -- Base + daily
        END as calculated_total,
        
        -- Mock payment status (would come from payments table in real app)
        'Unpaid' as payment_status,
        NULL as payment_date,
        0 as fee_waived,
        NULL as waiver_reason
        
      FROM borrowing_transactions bt
      JOIN members m ON bt.member_id = m.member_id
      JOIN book_copies bc ON bt.book_copy_id = bc.id
      JOIN books b ON bc.book_id = b.id
      WHERE bt.status = 'Active'
        AND bt.due_date < datetime('now')
        AND julianday('now') - julianday(bt.due_date) > 0
    `;

    const params: any[] = [
      graceConfig.base_late_fee,
      graceConfig.daily_late_fee,
      graceConfig.grace_period_days,
      graceConfig.grace_period_days,
      graceConfig.grace_period_days,
      graceConfig.base_late_fee,
      graceConfig.base_late_fee,
      graceConfig.grace_period_days,
      graceConfig.daily_late_fee,
    ];

    if (transactionIds && transactionIds.length > 0) {
      const placeholders = transactionIds.map(() => '?').join(',');
      query += ` AND bt.id IN (${placeholders})`;
      params.push(...transactionIds);
    }

    const results = await databaseConnection.all(query, params);

    return results.map((row: any) => ({
      transaction_id: row.transaction_id,
      member_id: row.member_id,
      member_name: row.member_name,
      book_title: row.book_title,
      days_overdue: row.days_overdue,
      base_fee: row.base_fee,
      daily_fee: row.daily_fee,
      total_fee: Math.min(row.calculated_total, graceConfig.max_late_fee),
      grace_days: row.grace_days,
      fee_waived: Boolean(row.fee_waived),
      waiver_reason: row.waiver_reason,
      payment_status: row.payment_status,
      payment_date: row.payment_date,
    })) as LateFee[];
  }

  /**
   * Analyze overdue patterns for members to identify repeat offenders
   */
  async analyzeOverduePatterns(
    memberId?: string,
    includeHistory: boolean = true
  ): Promise<OverduePattern[]> {
    const query = `
      WITH member_transactions AS (
        SELECT 
          bt.member_id,
          m.first_name || ' ' || m.last_name as member_name,
          bt.id as transaction_id,
          bt.due_date,
          bt.return_date,
          bt.status,
          
          -- Check if overdue
          CASE 
            WHEN bt.status = 'Active' AND bt.due_date < datetime('now') THEN 1
            WHEN bt.return_date IS NOT NULL AND bt.return_date > bt.due_date THEN 1
            ELSE 0
          END as is_overdue,
          
          -- Calculate days overdue
          CASE 
            WHEN bt.status = 'Active' AND bt.due_date < datetime('now') THEN
              julianday('now') - julianday(bt.due_date)
            WHEN bt.return_date IS NOT NULL AND bt.return_date > bt.due_date THEN
              julianday(bt.return_date) - julianday(bt.due_date)
            ELSE 0
          END as days_overdue,
          
          -- Grace period violations (overdue beyond grace period)
          CASE 
            WHEN bt.status = 'Active' AND julianday('now') - julianday(bt.due_date) > ? THEN 1
            WHEN bt.return_date IS NOT NULL AND julianday(bt.return_date) - julianday(bt.due_date) > ? THEN 1
            ELSE 0
          END as grace_violation
          
        FROM borrowing_transactions bt
        JOIN members m ON bt.member_id = m.member_id
        ${memberId ? 'WHERE bt.member_id = ?' : ''}
      ),
      member_overdue_stats AS (
        SELECT 
          member_id,
          member_name,
          COUNT(*) as total_transactions,
          SUM(is_overdue) as overdue_transactions,
          
          -- Overdue rate
          CASE 
            WHEN COUNT(*) > 0 THEN (SUM(is_overdue) * 100.0 / COUNT(*))
            ELSE 0
          END as overdue_rate,
          
          -- Average days overdue (only for overdue transactions)
          CASE 
            WHEN SUM(is_overdue) > 0 THEN AVG(CASE WHEN is_overdue = 1 THEN days_overdue END)
            ELSE 0
          END as average_days_overdue,
          
          -- Longest overdue period
          MAX(days_overdue) as longest_overdue_period,
          
          -- Grace period violations
          SUM(grace_violation) as grace_period_violations,
          
          -- Current overdue count
          SUM(CASE WHEN status = 'Active' AND is_overdue = 1 THEN 1 ELSE 0 END) as current_overdue_count,
          
          -- Last overdue date
          MAX(CASE WHEN is_overdue = 1 THEN due_date END) as last_overdue_date,
          
          -- Mock fee calculations (would integrate with real fee system)
          SUM(CASE 
            WHEN days_overdue > ? THEN 
              ? + ((days_overdue - ? - 1) * ?)
            WHEN days_overdue > ? AND days_overdue <= ? THEN ?
            ELSE 0
          END) as total_fees_accrued
          
        FROM member_transactions
        GROUP BY member_id, member_name
      )
      SELECT 
        member_id,
        member_name,
        total_transactions,
        overdue_transactions,
        ROUND(overdue_rate, 2) as overdue_rate,
        ROUND(average_days_overdue, 2) as average_days_overdue,
        longest_overdue_period,
        ROUND(total_fees_accrued, 2) as total_fees_accrued,
        ROUND(total_fees_accrued * 0.7, 2) as total_fees_paid, -- Mock 70% payment rate
        grace_period_violations,
        current_overdue_count,
        last_overdue_date,
        
        -- Repeat offender score (0-100, higher = more problematic)
        ROUND(
          LEAST(100, 
            (overdue_rate * 0.4) +  -- 40% weight on overdue rate
            (LEAST(average_days_overdue / 30.0, 1.0) * 30) +  -- 30% weight on avg days (capped at 30 days)
            (LEAST(grace_period_violations / 5.0, 1.0) * 20) + -- 20% weight on grace violations 
            (LEAST(current_overdue_count / 3.0, 1.0) * 10)     -- 10% weight on current overdue
          ), 2
        ) as repeat_offender_score
        
      FROM member_overdue_stats
      WHERE total_transactions > 0
      ORDER BY repeat_offender_score DESC, overdue_rate DESC
    `;

    const params: any[] = [
      this.defaultGraceConfig.grace_period_days,
      this.defaultGraceConfig.grace_period_days,
      this.defaultGraceConfig.grace_period_days,
      this.defaultGraceConfig.base_late_fee,
      this.defaultGraceConfig.grace_period_days,
      this.defaultGraceConfig.daily_late_fee,
      this.defaultGraceConfig.grace_period_days,
      this.defaultGraceConfig.grace_period_days,
      this.defaultGraceConfig.base_late_fee,
    ];

    if (memberId) {
      params.push(memberId);
    }

    return (await databaseConnection.all(query, params)) as OverduePattern[];
  }

  /**
   * Get overdue trends over time periods
   */
  async getOverdueTrends(
    periodType: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly',
    startDate?: string,
    endDate?: string,
    limit?: number
  ): Promise<OverdueTrend[]> {
    const periodFormat = {
      daily: '%Y-%m-%d',
      weekly: '%Y-W%W',
      monthly: '%Y-%m',
      yearly: '%Y',
    }[periodType];

    const query = `
      WITH date_periods AS (
        SELECT DISTINCT
          strftime('${periodFormat}', bt.due_date) as period,
          '${periodType}' as period_type
        FROM borrowing_transactions bt
        WHERE 1=1
        ${startDate ? 'AND bt.due_date >= ?' : ''}
        ${endDate ? 'AND bt.due_date <= ?' : ''}
      ),
      period_stats AS (
        SELECT 
          strftime('${periodFormat}', bt.due_date) as period,
          '${periodType}' as period_type,
          
          -- Total books due in this period
          COUNT(*) as total_due_books,
          
          -- Books that became overdue
          COUNT(CASE 
            WHEN bt.status = 'Active' AND bt.due_date < datetime('now') THEN 1
            WHEN bt.return_date IS NOT NULL AND bt.return_date > bt.due_date THEN 1
          END) as overdue_books,
          
          -- Average days overdue for those that were overdue
          AVG(CASE 
            WHEN bt.status = 'Active' AND bt.due_date < datetime('now') THEN
              julianday('now') - julianday(bt.due_date)
            WHEN bt.return_date IS NOT NULL AND bt.return_date > bt.due_date THEN
              julianday(bt.return_date) - julianday(bt.due_date)
          END) as average_days_overdue,
          
          -- Unique members with overdue books
          COUNT(DISTINCT CASE 
            WHEN bt.status = 'Active' AND bt.due_date < datetime('now') THEN bt.member_id
            WHEN bt.return_date IS NOT NULL AND bt.return_date > bt.due_date THEN bt.member_id
          END) as unique_overdue_members,
          
          -- Books returned late (but returned)
          COUNT(CASE 
            WHEN bt.return_date IS NOT NULL AND bt.return_date > bt.due_date THEN 1
          END) as books_returned_late,
          
          -- Books returned within grace period
          COUNT(CASE 
            WHEN bt.return_date IS NOT NULL 
             AND bt.return_date > bt.due_date 
             AND julianday(bt.return_date) - julianday(bt.due_date) <= ? THEN 1
          END) as grace_period_returns,
          
          -- Mock late fee calculation
          SUM(CASE 
            WHEN bt.status = 'Active' AND julianday('now') - julianday(bt.due_date) > ? THEN
              ? + ((julianday('now') - julianday(bt.due_date) - ? - 1) * ?)
            WHEN bt.return_date IS NOT NULL AND julianday(bt.return_date) - julianday(bt.due_date) > ? THEN
              ? + ((julianday(bt.return_date) - julianday(bt.due_date) - ? - 1) * ?)
            WHEN bt.status = 'Active' AND julianday('now') - julianday(bt.due_date) > 0 
             AND julianday('now') - julianday(bt.due_date) <= ? THEN ?
            WHEN bt.return_date IS NOT NULL AND julianday(bt.return_date) - julianday(bt.due_date) > 0
             AND julianday(bt.return_date) - julianday(bt.due_date) <= ? THEN ?
            ELSE 0
          END) as total_late_fees
          
        FROM borrowing_transactions bt
        WHERE 1=1
        ${startDate ? 'AND bt.due_date >= ?' : ''}
        ${endDate ? 'AND bt.due_date <= ?' : ''}
        GROUP BY strftime('${periodFormat}', bt.due_date)
      )
      SELECT 
        ps.period,
        ps.period_type,
        ps.total_due_books,
        ps.overdue_books,
        ROUND((ps.overdue_books * 100.0 / NULLIF(ps.total_due_books, 0)), 2) as overdue_rate,
        ROUND(COALESCE(ps.average_days_overdue, 0), 2) as average_days_overdue,
        ps.unique_overdue_members,
        ROUND(COALESCE(ps.total_late_fees, 0), 2) as total_late_fees,
        ps.books_returned_late,
        ps.grace_period_returns
      FROM period_stats ps
      ORDER BY ps.period DESC
      ${limit ? `LIMIT ${limit}` : ''}
    `;

    const params: any[] = [
      this.defaultGraceConfig.grace_period_days,
      this.defaultGraceConfig.grace_period_days,
      this.defaultGraceConfig.base_late_fee,
      this.defaultGraceConfig.grace_period_days,
      this.defaultGraceConfig.daily_late_fee,
      this.defaultGraceConfig.grace_period_days,
      this.defaultGraceConfig.base_late_fee,
      this.defaultGraceConfig.grace_period_days,
      this.defaultGraceConfig.daily_late_fee,
      this.defaultGraceConfig.grace_period_days,
      this.defaultGraceConfig.base_late_fee,
      this.defaultGraceConfig.grace_period_days,
      this.defaultGraceConfig.base_late_fee,
    ];

    if (startDate) {
      params.push(startDate);
      if (endDate) {
        params.push(endDate);
      }
    }

    return (await databaseConnection.all(query, params)) as OverdueTrend[];
  }

  /**
   * Get members who should be notified about overdue books
   */
  async getMembersForNotification(): Promise<OverdueTransaction[]> {
    const currentOverdue = await this.getCurrentOverdueTransactions();

    return currentOverdue.filter((transaction) => {
      // Check if member should receive notification based on intervals
      const intervals = this.defaultGraceConfig.notification_intervals;
      return intervals.some(
        (interval) =>
          transaction.days_overdue >= interval &&
          transaction.days_overdue < interval + 1
      );
    });
  }

  /**
   * Get repeat offenders (members with high overdue rates)
   */
  async getRepeatOffenders(
    minScore: number = 50,
    limit: number = 20
  ): Promise<OverduePattern[]> {
    const patterns = await this.analyzeOverduePatterns();

    return patterns
      .filter((pattern) => pattern.repeat_offender_score >= minScore)
      .slice(0, limit);
  }

  /**
   * Get members who should be suspended due to extended overdue periods
   */
  async getMembersForSuspension(): Promise<OverdueTransaction[]> {
    const filters: OverdueFilters = {
      minDaysOverdue: this.defaultGraceConfig.auto_suspend_days,
      memberStatus: 'Active',
    };

    return this.getCurrentOverdueTransactions(filters);
  }

  /**
   * Get overdue summary statistics
   */
  async getOverdueSummary() {
    const query = `
      WITH overdue_stats AS (
        SELECT 
          COUNT(CASE WHEN bt.status = 'Active' AND bt.due_date < datetime('now') THEN 1 END) as current_overdue_count,
          COUNT(CASE WHEN bt.status = 'Active' AND julianday('now') - julianday(bt.due_date) > ? THEN 1 END) as beyond_grace_count,
          COUNT(DISTINCT CASE WHEN bt.status = 'Active' AND bt.due_date < datetime('now') THEN bt.member_id END) as overdue_members,
          AVG(CASE 
            WHEN bt.status = 'Active' AND bt.due_date < datetime('now') THEN
              julianday('now') - julianday(bt.due_date)
          END) as avg_days_overdue,
          MAX(CASE 
            WHEN bt.status = 'Active' AND bt.due_date < datetime('now') THEN
              julianday('now') - julianday(bt.due_date)
          END) as max_days_overdue,
          COUNT(bt.id) as total_active_loans
        FROM borrowing_transactions bt
        WHERE bt.status = 'Active'
      )
      SELECT 
        current_overdue_count,
        beyond_grace_count,
        overdue_members,
        total_active_loans,
        ROUND((current_overdue_count * 100.0 / NULLIF(total_active_loans, 0)), 2) as overdue_rate,
        ROUND(COALESCE(avg_days_overdue, 0), 2) as avg_days_overdue,
        ROUND(COALESCE(max_days_overdue, 0), 2) as max_days_overdue,
        ? as grace_period_days
      FROM overdue_stats
    `;

    const params: any[] = [
      this.defaultGraceConfig.grace_period_days,
      this.defaultGraceConfig.grace_period_days,
    ];

    const result = await databaseConnection.getOne(query, params);
    return (
      result || {
        current_overdue_count: 0,
        beyond_grace_count: 0,
        overdue_members: 0,
        total_active_loans: 0,
        overdue_rate: 0,
        avg_days_overdue: 0,
        max_days_overdue: 0,
        grace_period_days: this.defaultGraceConfig.grace_period_days,
      }
    );
  }
}

// Export singleton instance
export const overdueAnalyticsService = new OverdueAnalyticsService();
