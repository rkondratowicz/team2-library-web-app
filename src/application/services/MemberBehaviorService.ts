import { databaseConnection } from '../../data-access/DatabaseConnection.js';

/**
 * Member Behavior Service
 *
 * Analyzes member borrowing behavior and provides insights into:
 * - Member borrowing patterns and reading habits
 * - Reading preferences by genre, author, publication year
 * - Member engagement levels and activity patterns
 * - Borrowing frequency analysis and loyalty metrics
 * - Risk assessment for overdue patterns
 * - Member segmentation based on behavior
 */

// Interfaces for member behavior analytics
export interface MemberBehaviorProfile {
  member_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  status: string;
  registration_date: string;

  // Borrowing statistics
  total_books_borrowed: number;
  unique_books_borrowed: number;
  current_active_borrows: number;
  average_books_per_month: number;

  // Reading patterns
  average_reading_duration: number; // Days per book
  fastest_read: number | null; // Shortest borrow duration
  longest_read: number | null; // Longest borrow duration

  // Preferences
  favorite_genre: string | null;
  favorite_genre_percentage: number;
  favorite_author: string | null;
  favorite_author_count: number;
  preferred_publication_era: string; // e.g., "2010s", "2000s"

  // Behavior metrics
  reliability_score: number; // 0-100 based on return patterns
  engagement_level: 'Low' | 'Medium' | 'High' | 'Very High';
  overdue_rate: number; // Percentage of overdue borrows
  return_punctuality: number; // Average days early/late (negative = early)

  // Activity patterns
  most_active_day: string | null;
  most_active_month: string | null;
  last_borrow_date: string | null;
  days_since_last_borrow: number | null;

  // Risk indicators
  risk_level: 'Low' | 'Medium' | 'High';
  consecutive_overdue: number;
}

export interface MemberSegment {
  segment_name: string;
  description: string;
  member_count: number;
  criteria: string;
  average_books_per_member: number;
  average_engagement_score: number;
}

export interface ReadingPattern {
  member_id: string;
  member_name: string;
  pattern_type:
    | 'genre_preference'
    | 'author_loyalty'
    | 'publication_preference'
    | 'seasonal_pattern';
  pattern_description: string;
  strength_score: number; // 0-100 how strong the pattern is
  supporting_data: string; // JSON string with supporting metrics
}

export interface BorrowingFrequencyAnalysis {
  member_id: string;
  member_name: string;
  total_periods: number; // Number of months/weeks analyzed
  active_periods: number; // Periods with at least one borrow
  consistency_score: number; // 0-100 how consistent borrowing is
  trend: 'Increasing' | 'Decreasing' | 'Stable' | 'Irregular';
  peak_period: string; // When most active
  dormant_periods: number; // Periods with no activity
}

export interface MemberBehaviorFilters {
  status?: string;
  engagementLevel?: 'Low' | 'Medium' | 'High' | 'Very High';
  riskLevel?: 'Low' | 'Medium' | 'High';
  favoriteGenre?: string;
  minTotalBorrows?: number;
  maxTotalBorrows?: number;
  registrationDateFrom?: string;
  registrationDateTo?: string;
  lastBorrowWithinDays?: number;

  // Pagination and sorting
  limit?: number;
  offset?: number;
  sortBy?:
    | 'total_books_borrowed'
    | 'reliability_score'
    | 'engagement_level'
    | 'last_borrow_date'
    | 'member_name';
  sortOrder?: 'ASC' | 'DESC';
}

export class MemberBehaviorService {
  /**
   * Get comprehensive behavior profile for a specific member
   */
  async getMemberBehaviorProfile(
    memberId: string
  ): Promise<MemberBehaviorProfile | null> {
    const query = `
      WITH member_stats AS (
        SELECT 
          m.member_id,
          m.first_name,
          m.last_name,
          m.email,
          m.status,
          m.registration_date,
          
          COUNT(bt.id) as total_books_borrowed,
          COUNT(DISTINCT bc.book_id) as unique_books_borrowed,
          COUNT(CASE WHEN bt.status = 'Active' THEN 1 END) as current_active_borrows,
          
          -- Average books per month since registration
          CASE 
            WHEN julianday('now') - julianday(m.registration_date) > 30 THEN
              COUNT(bt.id) * 30.0 / (julianday('now') - julianday(m.registration_date))
            ELSE COUNT(bt.id)
          END as average_books_per_month,
          
          -- Reading duration statistics
          AVG(
            CASE 
              WHEN bt.return_date IS NOT NULL 
              THEN julianday(bt.return_date) - julianday(bt.borrow_date)
              ELSE julianday('now') - julianday(bt.borrow_date)
            END
          ) as average_reading_duration,
          
          MIN(
            CASE 
              WHEN bt.return_date IS NOT NULL 
              THEN julianday(bt.return_date) - julianday(bt.borrow_date)
              ELSE NULL
            END
          ) as fastest_read,
          
          MAX(
            CASE 
              WHEN bt.return_date IS NOT NULL 
              THEN julianday(bt.return_date) - julianday(bt.borrow_date)
              ELSE julianday('now') - julianday(bt.borrow_date)
            END
          ) as longest_read,
          
          -- Overdue statistics
          COUNT(CASE 
            WHEN bt.return_date IS NULL AND bt.due_date < datetime('now') THEN 1
            WHEN bt.return_date IS NOT NULL AND bt.return_date > bt.due_date THEN 1
          END) as total_overdue,
          
          -- Return punctuality (average days early/late)
          AVG(
            CASE 
              WHEN bt.return_date IS NOT NULL 
              THEN julianday(bt.return_date) - julianday(bt.due_date)
              ELSE NULL
            END
          ) as return_punctuality,
          
          -- Activity timestamps
          MAX(bt.borrow_date) as last_borrow_date,
          julianday('now') - julianday(MAX(bt.borrow_date)) as days_since_last_borrow
          
        FROM members m
        LEFT JOIN borrowing_transactions bt ON m.member_id = bt.member_id
        LEFT JOIN book_copies bc ON bt.book_copy_id = bc.id
        WHERE m.member_id = ?
        GROUP BY m.member_id, m.first_name, m.last_name, m.email, m.status, m.registration_date
      ),
      genre_preferences AS (
        SELECT 
          bt.member_id,
          b.genre as favorite_genre,
          COUNT(*) as genre_count,
          (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM borrowing_transactions bt2 WHERE bt2.member_id = bt.member_id)) as genre_percentage,
          ROW_NUMBER() OVER (PARTITION BY bt.member_id ORDER BY COUNT(*) DESC) as genre_rank
        FROM borrowing_transactions bt
        JOIN book_copies bc ON bt.book_copy_id = bc.id
        JOIN books b ON bc.book_id = b.id
        WHERE bt.member_id = ?
        GROUP BY bt.member_id, b.genre
      ),
      author_preferences AS (
        SELECT 
          bt.member_id,
          b.author as favorite_author,
          COUNT(*) as author_count,
          ROW_NUMBER() OVER (PARTITION BY bt.member_id ORDER BY COUNT(*) DESC) as author_rank
        FROM borrowing_transactions bt
        JOIN book_copies bc ON bt.book_copy_id = bc.id
        JOIN books b ON bc.book_id = b.id
        WHERE bt.member_id = ?
        GROUP BY bt.member_id, b.author
      ),
      activity_patterns AS (
        SELECT 
          bt.member_id,
          -- Most active day of week
          (SELECT strftime('%w', bt2.borrow_date) as day_of_week
           FROM borrowing_transactions bt2 
           WHERE bt2.member_id = bt.member_id
           GROUP BY strftime('%w', bt2.borrow_date)
           ORDER BY COUNT(*) DESC LIMIT 1) as most_active_day_num,
          
          -- Most active month  
          (SELECT strftime('%m', bt2.borrow_date) as month
           FROM borrowing_transactions bt2 
           WHERE bt2.member_id = bt.member_id
           GROUP BY strftime('%m', bt2.borrow_date)
           ORDER BY COUNT(*) DESC LIMIT 1) as most_active_month_num
           
        FROM borrowing_transactions bt
        WHERE bt.member_id = ?
        GROUP BY bt.member_id
      )
      SELECT 
        ms.*,
        COALESCE(gp.favorite_genre, 'None') as favorite_genre,
        COALESCE(gp.genre_percentage, 0) as favorite_genre_percentage,
        COALESCE(ap_auth.favorite_author, 'None') as favorite_author,
        COALESCE(ap_auth.author_count, 0) as favorite_author_count,
        
        -- Publication era preference
        CASE 
          WHEN ms.total_books_borrowed = 0 THEN 'None'
          ELSE (
            SELECT CASE 
              WHEN AVG(b.publication_year) >= 2020 THEN '2020s'
              WHEN AVG(b.publication_year) >= 2010 THEN '2010s'  
              WHEN AVG(b.publication_year) >= 2000 THEN '2000s'
              WHEN AVG(b.publication_year) >= 1990 THEN '1990s'
              ELSE 'Classic'
            END
            FROM borrowing_transactions bt
            JOIN book_copies bc ON bt.book_copy_id = bc.id
            JOIN books b ON bc.book_id = b.id
            WHERE bt.member_id = ms.member_id
          )
        END as preferred_publication_era,
        
        -- Reliability score (0-100)
        CASE 
          WHEN ms.total_books_borrowed = 0 THEN 100
          ELSE ROUND(100 - (ms.total_overdue * 100.0 / ms.total_books_borrowed))
        END as reliability_score,
        
        -- Engagement level
        CASE 
          WHEN ms.average_books_per_month >= 4 THEN 'Very High'
          WHEN ms.average_books_per_month >= 2 THEN 'High'
          WHEN ms.average_books_per_month >= 0.5 THEN 'Medium'
          ELSE 'Low'
        END as engagement_level,
        
        -- Overdue rate
        CASE 
          WHEN ms.total_books_borrowed = 0 THEN 0
          ELSE ROUND(ms.total_overdue * 100.0 / ms.total_books_borrowed, 2)
        END as overdue_rate,
        
        -- Risk level assessment
        CASE 
          WHEN ms.total_books_borrowed = 0 THEN 'Low'
          WHEN (ms.total_overdue * 100.0 / ms.total_books_borrowed) > 50 THEN 'High'
          WHEN (ms.total_overdue * 100.0 / ms.total_books_borrowed) > 20 THEN 'Medium'
          ELSE 'Low'
        END as risk_level,
        
        -- Consecutive overdue count (simplified)
        COALESCE(ms.total_overdue, 0) as consecutive_overdue,
        
        -- Activity pattern labels
        CASE ms_ap.most_active_day_num
          WHEN '0' THEN 'Sunday'
          WHEN '1' THEN 'Monday' 
          WHEN '2' THEN 'Tuesday'
          WHEN '3' THEN 'Wednesday'
          WHEN '4' THEN 'Thursday'
          WHEN '5' THEN 'Friday'
          WHEN '6' THEN 'Saturday'
          ELSE NULL
        END as most_active_day,
        
        CASE ms_ap.most_active_month_num
          WHEN '01' THEN 'January'
          WHEN '02' THEN 'February'
          WHEN '03' THEN 'March'
          WHEN '04' THEN 'April'
          WHEN '05' THEN 'May'
          WHEN '06' THEN 'June'
          WHEN '07' THEN 'July'
          WHEN '08' THEN 'August'
          WHEN '09' THEN 'September'
          WHEN '10' THEN 'October'
          WHEN '11' THEN 'November'
          WHEN '12' THEN 'December'
          ELSE NULL
        END as most_active_month
        
      FROM member_stats ms
      LEFT JOIN genre_preferences gp ON ms.member_id = gp.member_id AND gp.genre_rank = 1
      LEFT JOIN author_preferences ap_auth ON ms.member_id = ap_auth.member_id AND ap_auth.author_rank = 1
      LEFT JOIN activity_patterns ms_ap ON ms.member_id = ms_ap.member_id
    `;

    const result = await databaseConnection.getOne(query, [
      memberId,
      memberId,
      memberId,
      memberId,
    ]);
    return result as MemberBehaviorProfile | null;
  }

  /**
   * Get behavior profiles for all members with filtering
   */
  async getAllMemberBehaviorProfiles(
    filters?: MemberBehaviorFilters
  ): Promise<MemberBehaviorProfile[]> {
    // This is a simplified version that gets basic profiles for all members
    const query = `
      SELECT 
        m.member_id,
        m.first_name,
        m.last_name,
        m.email,
        m.status,
        m.registration_date,
        
        COUNT(bt.id) as total_books_borrowed,
        COUNT(DISTINCT bc.book_id) as unique_books_borrowed,
        COUNT(CASE WHEN bt.status = 'Active' THEN 1 END) as current_active_borrows,
        
        -- Simplified metrics
        CASE 
          WHEN julianday('now') - julianday(m.registration_date) > 30 THEN
            COUNT(bt.id) * 30.0 / (julianday('now') - julianday(m.registration_date))
          ELSE COUNT(bt.id)
        END as average_books_per_month,
        
        COALESCE(AVG(
          CASE 
            WHEN bt.return_date IS NOT NULL 
            THEN julianday(bt.return_date) - julianday(bt.borrow_date)
            ELSE julianday('now') - julianday(bt.borrow_date)
          END
        ), 0) as average_reading_duration,
        
        NULL as fastest_read,
        NULL as longest_read,
        'General' as favorite_genre,
        0 as favorite_genre_percentage,
        'Various' as favorite_author,
        0 as favorite_author_count,
        'Mixed' as preferred_publication_era,
        
        -- Reliability score
        CASE 
          WHEN COUNT(bt.id) = 0 THEN 100
          ELSE ROUND(100 - (COUNT(CASE 
            WHEN bt.return_date IS NULL AND bt.due_date < datetime('now') THEN 1
            WHEN bt.return_date IS NOT NULL AND bt.return_date > bt.due_date THEN 1
          END) * 100.0 / COUNT(bt.id)))
        END as reliability_score,
        
        -- Engagement level
        CASE 
          WHEN COUNT(bt.id) * 30.0 / NULLIF(julianday('now') - julianday(m.registration_date), 0) >= 4 THEN 'Very High'
          WHEN COUNT(bt.id) * 30.0 / NULLIF(julianday('now') - julianday(m.registration_date), 0) >= 2 THEN 'High'
          WHEN COUNT(bt.id) * 30.0 / NULLIF(julianday('now') - julianday(m.registration_date), 0) >= 0.5 THEN 'Medium'
          ELSE 'Low'
        END as engagement_level,
        
        -- Overdue rate
        CASE 
          WHEN COUNT(bt.id) = 0 THEN 0
          ELSE ROUND(COUNT(CASE 
            WHEN bt.return_date IS NULL AND bt.due_date < datetime('now') THEN 1
            WHEN bt.return_date IS NOT NULL AND bt.return_date > bt.due_date THEN 1
          END) * 100.0 / COUNT(bt.id), 2)
        END as overdue_rate,
        
        COALESCE(AVG(
          CASE 
            WHEN bt.return_date IS NOT NULL 
            THEN julianday(bt.return_date) - julianday(bt.due_date)
            ELSE NULL
          END
        ), 0) as return_punctuality,
        
        NULL as most_active_day,
        NULL as most_active_month,
        MAX(bt.borrow_date) as last_borrow_date,
        julianday('now') - julianday(MAX(bt.borrow_date)) as days_since_last_borrow,
        
        -- Risk level
        CASE 
          WHEN COUNT(bt.id) = 0 THEN 'Low'
          WHEN (COUNT(CASE 
            WHEN bt.return_date IS NULL AND bt.due_date < datetime('now') THEN 1
            WHEN bt.return_date IS NOT NULL AND bt.return_date > bt.due_date THEN 1
          END) * 100.0 / COUNT(bt.id)) > 50 THEN 'High'
          WHEN (COUNT(CASE 
            WHEN bt.return_date IS NULL AND bt.due_date < datetime('now') THEN 1
            WHEN bt.return_date IS NOT NULL AND bt.return_date > bt.due_date THEN 1
          END) * 100.0 / COUNT(bt.id)) > 20 THEN 'Medium'
          ELSE 'Low'
        END as risk_level,
        
        COUNT(CASE 
          WHEN bt.return_date IS NULL AND bt.due_date < datetime('now') THEN 1
          WHEN bt.return_date IS NOT NULL AND bt.return_date > bt.due_date THEN 1
        END) as consecutive_overdue
        
      FROM members m
      LEFT JOIN borrowing_transactions bt ON m.member_id = bt.member_id
      LEFT JOIN book_copies bc ON bt.book_copy_id = bc.id
      WHERE 1=1
    `;

    const whereConditions: string[] = [];
    const params: any[] = [];

    if (filters) {
      if (filters.status) {
        whereConditions.push('m.status = ?');
        params.push(filters.status);
      }

      if (filters.registrationDateFrom && filters.registrationDateTo) {
        whereConditions.push('m.registration_date BETWEEN ? AND ?');
        params.push(filters.registrationDateFrom, filters.registrationDateTo);
      }
    }

    let finalQuery = query;
    if (whereConditions.length > 0) {
      finalQuery += ' AND ' + whereConditions.join(' AND ');
    }

    finalQuery +=
      ' GROUP BY m.member_id, m.first_name, m.last_name, m.email, m.status, m.registration_date';

    // Apply post-aggregation filters
    const havingConditions: string[] = [];
    if (filters?.minTotalBorrows) {
      havingConditions.push('COUNT(bt.id) >= ?');
      params.push(filters.minTotalBorrows);
    }

    if (filters?.maxTotalBorrows) {
      havingConditions.push('COUNT(bt.id) <= ?');
      params.push(filters.maxTotalBorrows);
    }

    if (havingConditions.length > 0) {
      finalQuery += ' HAVING ' + havingConditions.join(' AND ');
    }

    // Sorting
    const sortBy = filters?.sortBy || 'total_books_borrowed';
    const sortOrder = filters?.sortOrder || 'DESC';

    const sortColumn =
      {
        total_books_borrowed: 'total_books_borrowed',
        reliability_score: 'reliability_score',
        engagement_level: 'engagement_level',
        last_borrow_date: 'last_borrow_date',
        member_name: 'm.last_name, m.first_name',
      }[sortBy] || 'total_books_borrowed';

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
    )) as MemberBehaviorProfile[];
  }

  /**
   * Segment members based on their behavior patterns
   */
  async getMemberSegments(): Promise<MemberSegment[]> {
    const query = `
      WITH member_metrics AS (
        SELECT 
          m.member_id,
          COUNT(bt.id) as total_borrows,
          CASE 
            WHEN julianday('now') - julianday(m.registration_date) > 30 THEN
              COUNT(bt.id) * 30.0 / (julianday('now') - julianday(m.registration_date))
            ELSE COUNT(bt.id)
          END as books_per_month,
          CASE 
            WHEN COUNT(bt.id) = 0 THEN 100
            ELSE 100 - (COUNT(CASE 
              WHEN bt.return_date IS NULL AND bt.due_date < datetime('now') THEN 1
              WHEN bt.return_date IS NOT NULL AND bt.return_date > bt.due_date THEN 1
            END) * 100.0 / COUNT(bt.id))
          END as reliability_score
        FROM members m
        LEFT JOIN borrowing_transactions bt ON m.member_id = bt.member_id
        GROUP BY m.member_id, m.registration_date
      ),
      segments AS (
        SELECT 
          CASE 
            WHEN total_borrows = 0 THEN 'Inactive Members'
            WHEN books_per_month >= 4 AND reliability_score >= 90 THEN 'Premium Readers'
            WHEN books_per_month >= 2 AND reliability_score >= 80 THEN 'Regular Readers'
            WHEN books_per_month >= 0.5 AND reliability_score >= 70 THEN 'Casual Readers'
            WHEN reliability_score < 70 THEN 'At-Risk Members'
            ELSE 'New Members'
          END as segment_name,
          
          COUNT(*) as member_count,
          AVG(total_borrows) as avg_books,
          AVG(books_per_month * 10 + reliability_score * 0.1) as avg_engagement
          
        FROM member_metrics
        GROUP BY segment_name
      )
      SELECT 
        segment_name,
        CASE segment_name
          WHEN 'Premium Readers' THEN 'Highly engaged, frequent borrowers with excellent return records'
          WHEN 'Regular Readers' THEN 'Consistent borrowers with good reliability'
          WHEN 'Casual Readers' THEN 'Occasional borrowers with acceptable return behavior'
          WHEN 'At-Risk Members' THEN 'Members with poor return patterns requiring attention'
          WHEN 'Inactive Members' THEN 'Registered members who have never borrowed'
          ELSE 'Recently registered members still establishing patterns'
        END as description,
        
        member_count,
        
        CASE segment_name
          WHEN 'Premium Readers' THEN 'Books per month >= 4 AND reliability >= 90%'
          WHEN 'Regular Readers' THEN 'Books per month >= 2 AND reliability >= 80%'
          WHEN 'Casual Readers' THEN 'Books per month >= 0.5 AND reliability >= 70%'
          WHEN 'At-Risk Members' THEN 'Reliability < 70%'
          WHEN 'Inactive Members' THEN 'Zero borrows'
          ELSE 'New or unclassified members'
        END as criteria,
        
        ROUND(avg_books, 2) as average_books_per_member,
        ROUND(avg_engagement, 2) as average_engagement_score
        
      FROM segments
      ORDER BY avg_engagement DESC
    `;

    return (await databaseConnection.all(query, [])) as MemberSegment[];
  }

  /**
   * Analyze borrowing frequency patterns for members
   */
  async analyzeBorrowingFrequency(
    memberId?: string
  ): Promise<BorrowingFrequencyAnalysis[]> {
    const query = `
      WITH monthly_activity AS (
        SELECT 
          m.member_id,
          m.first_name || ' ' || m.last_name as member_name,
          strftime('%Y-%m', bt.borrow_date) as month_year,
          COUNT(bt.id) as borrows_in_month
        FROM members m
        LEFT JOIN borrowing_transactions bt ON m.member_id = bt.member_id
        ${memberId ? 'WHERE m.member_id = ?' : ''}
        GROUP BY m.member_id, m.first_name, m.last_name, strftime('%Y-%m', bt.borrow_date)
      ),
      member_frequency_stats AS (
        SELECT 
          member_id,
          member_name,
          COUNT(DISTINCT month_year) as total_periods,
          COUNT(CASE WHEN borrows_in_month > 0 THEN 1 END) as active_periods,
          COUNT(CASE WHEN borrows_in_month = 0 OR borrows_in_month IS NULL THEN 1 END) as dormant_periods,
          AVG(CASE WHEN borrows_in_month > 0 THEN borrows_in_month END) as avg_borrows_when_active,
          
          -- Consistency score: how consistently they borrow
          CASE 
            WHEN COUNT(DISTINCT month_year) = 0 THEN 0
            ELSE (COUNT(CASE WHEN borrows_in_month > 0 THEN 1 END) * 100.0 / COUNT(DISTINCT month_year))
          END as consistency_score,
          
          -- Peak activity period
          (SELECT month_year FROM monthly_activity ma2 
           WHERE ma2.member_id = monthly_activity.member_id 
           ORDER BY ma2.borrows_in_month DESC LIMIT 1) as peak_period
           
        FROM monthly_activity
        GROUP BY member_id, member_name
      )
      SELECT 
        member_id,
        member_name,
        total_periods,
        active_periods,
        ROUND(consistency_score, 1) as consistency_score,
        
        -- Trend analysis (simplified)
        CASE 
          WHEN consistency_score > 80 THEN 'Stable'
          WHEN consistency_score > 50 THEN 'Irregular'
          WHEN active_periods > dormant_periods THEN 'Increasing'
          ELSE 'Decreasing'
        END as trend,
        
        peak_period,
        dormant_periods
        
      FROM member_frequency_stats
      WHERE total_periods > 0
      ORDER BY consistency_score DESC, active_periods DESC
    `;

    const params = memberId ? [memberId] : [];
    return (await databaseConnection.all(
      query,
      params
    )) as BorrowingFrequencyAnalysis[];
  }

  /**
   * Get members at risk of becoming inactive
   */
  async getAtRiskMembers(): Promise<MemberBehaviorProfile[]> {
    const filters: MemberBehaviorFilters = {
      riskLevel: 'High',
      lastBorrowWithinDays: 90, // Haven't borrowed in 90 days
      limit: 50,
      sortBy: 'last_borrow_date',
      sortOrder: 'ASC',
    };

    return this.getAllMemberBehaviorProfiles(filters);
  }

  /**
   * Get most engaged members (high activity, good reliability)
   */
  async getMostEngagedMembers(
    limit: number = 20
  ): Promise<MemberBehaviorProfile[]> {
    const filters: MemberBehaviorFilters = {
      engagementLevel: 'Very High',
      riskLevel: 'Low',
      limit,
      sortBy: 'total_books_borrowed',
      sortOrder: 'DESC',
    };

    return this.getAllMemberBehaviorProfiles(filters);
  }
}

// Export singleton instance
export const memberBehaviorService = new MemberBehaviorService();
