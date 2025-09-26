import { databaseConnection } from '../DatabaseConnection.js';

/**
 * Rental History Repository
 *
 * Specialized repository for comprehensive rental history queries with advanced filtering:
 * - Complete borrowing history for any book or member
 * - Date range queries and temporal analysis
 * - Advanced filtering by genre, member status, transaction status
 * - Historical trends and patterns
 */

// Enhanced interfaces for historical rental data
export interface HistoricalRentalRecord {
  // Transaction details
  transaction_id: string;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  status: string;
  notes: string | null;
  days_borrowed: number | null; // Calculated field
  is_overdue: boolean;
  days_overdue: number | null;

  // Book details
  book_id: number;
  book_title: string;
  book_author: string;
  book_isbn: string;
  book_genre: string;
  book_publication_year: number;
  copy_id: string;
  copy_condition: string;

  // Member details
  member_id: string;
  member_first_name: string;
  member_last_name: string;
  member_email: string | null;
  member_status: string;
  member_registration_date: string;
}

export interface RentalHistoryFilters {
  // Date filters
  startDate?: string;
  endDate?: string;
  borrowStartDate?: string;
  borrowEndDate?: string;
  returnStartDate?: string;
  returnEndDate?: string;

  // Entity filters
  bookId?: number;
  memberId?: string;
  bookGenre?: string;
  memberStatus?: string;
  transactionStatus?: string;

  // Condition filters
  isOverdue?: boolean;
  isReturned?: boolean;
  minBorrowDays?: number;
  maxBorrowDays?: number;

  // Pagination and sorting
  limit?: number;
  offset?: number;
  sortBy?:
    | 'borrow_date'
    | 'return_date'
    | 'book_title'
    | 'member_name'
    | 'days_borrowed';
  sortOrder?: 'ASC' | 'DESC';
}

export interface BookHistorySummary {
  book_id: number;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  total_borrows: number;
  total_unique_borrowers: number;
  total_days_borrowed: number;
  average_borrow_duration: number;
  current_active_borrows: number;
  times_overdue: number;
  first_borrow_date: string | null;
  last_borrow_date: string | null;
  most_frequent_borrower: string | null;
  most_frequent_borrower_count: number;
}

export interface MemberHistorySummary {
  member_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  status: string;
  total_books_borrowed: number;
  total_unique_books: number;
  total_days_borrowed: number;
  average_borrow_duration: number;
  current_active_borrows: number;
  times_overdue: number;
  overdue_rate: number; // Percentage
  first_borrow_date: string | null;
  last_borrow_date: string | null;
  favorite_genre: string | null;
  favorite_genre_count: number;
}

export interface TemporalRentalTrend {
  period: string; // Date period (e.g., '2024-01', '2024-01-15')
  period_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  total_borrows: number;
  total_returns: number;
  active_borrows: number;
  unique_borrowers: number;
  unique_books_borrowed: number;
  overdue_count: number;
  average_borrow_duration: number;
}

export class RentalHistoryRepository {
  /**
   * Get complete borrowing history for a specific book
   */
  async getBookHistory(
    bookId: number,
    filters?: RentalHistoryFilters
  ): Promise<HistoricalRentalRecord[]> {
    const baseQuery = `
      SELECT 
        bt.id as transaction_id,
        bt.borrow_date,
        bt.due_date,
        bt.return_date,
        bt.status,
        bt.notes,
        CASE 
          WHEN bt.return_date IS NOT NULL 
          THEN julianday(bt.return_date) - julianday(bt.borrow_date)
          ELSE julianday('now') - julianday(bt.borrow_date)
        END as days_borrowed,
        CASE 
          WHEN bt.return_date IS NULL AND bt.due_date < datetime('now') THEN 1
          WHEN bt.return_date IS NOT NULL AND bt.return_date > bt.due_date THEN 1
          ELSE 0
        END as is_overdue,
        CASE 
          WHEN bt.return_date IS NULL AND bt.due_date < datetime('now') 
          THEN julianday('now') - julianday(bt.due_date)
          WHEN bt.return_date IS NOT NULL AND bt.return_date > bt.due_date 
          THEN julianday(bt.return_date) - julianday(bt.due_date)
          ELSE NULL
        END as days_overdue,
        
        -- Book details
        b.id as book_id,
        b.title as book_title,
        b.author as book_author,
        b.isbn as book_isbn,
        b.genre as book_genre,
        b.publication_year as book_publication_year,
        bc.id as copy_id,
        COALESCE(bc.condition_notes, 'Good') as copy_condition,
        
        -- Member details
        m.member_id,
        m.first_name as member_first_name,
        m.last_name as member_last_name,
        m.email as member_email,
        m.status as member_status,
        m.registration_date as member_registration_date
        
      FROM borrowing_transactions bt
      JOIN book_copies bc ON bt.book_copy_id = bc.id
      JOIN books b ON bc.book_id = b.id
      JOIN members m ON bt.member_id = m.member_id
      WHERE b.id = ?
    `;

    const whereConditions: string[] = [];
    const params: any[] = [bookId];

    if (filters) {
      if (filters.startDate && filters.endDate) {
        whereConditions.push('bt.borrow_date BETWEEN ? AND ?');
        params.push(filters.startDate, filters.endDate);
      }

      if (filters.memberStatus) {
        whereConditions.push('m.status = ?');
        params.push(filters.memberStatus);
      }

      if (filters.transactionStatus) {
        whereConditions.push('bt.status = ?');
        params.push(filters.transactionStatus);
      }

      if (filters.isOverdue !== undefined) {
        if (filters.isOverdue) {
          whereConditions.push(
            "(bt.return_date IS NULL AND bt.due_date < datetime('now')) OR (bt.return_date IS NOT NULL AND bt.return_date > bt.due_date)"
          );
        } else {
          whereConditions.push(
            "NOT ((bt.return_date IS NULL AND bt.due_date < datetime('now')) OR (bt.return_date IS NOT NULL AND bt.return_date > bt.due_date))"
          );
        }
      }

      if (filters.isReturned !== undefined) {
        if (filters.isReturned) {
          whereConditions.push('bt.return_date IS NOT NULL');
        } else {
          whereConditions.push('bt.return_date IS NULL');
        }
      }
    }

    let finalQuery = baseQuery;
    if (whereConditions.length > 0) {
      finalQuery += ` AND ${whereConditions.join(' AND ')}`;
    }

    // Add sorting
    const sortBy = filters?.sortBy || 'borrow_date';
    const sortOrder = filters?.sortOrder || 'DESC';

    const sortColumn =
      {
        borrow_date: 'bt.borrow_date',
        return_date: 'bt.return_date',
        book_title: 'b.title',
        member_name: 'm.last_name, m.first_name',
        days_borrowed: 'days_borrowed',
      }[sortBy] || 'bt.borrow_date';

    finalQuery += ` ORDER BY ${sortColumn} ${sortOrder}`;

    // Add pagination
    if (filters?.limit) {
      finalQuery += ` LIMIT ${filters.limit}`;
      if (filters.offset) {
        finalQuery += ` OFFSET ${filters.offset}`;
      }
    }

    return (await databaseConnection.all(
      finalQuery,
      params
    )) as HistoricalRentalRecord[];
  }

  /**
   * Get complete borrowing history for a specific member
   */
  async getMemberHistory(
    memberId: string,
    filters?: RentalHistoryFilters
  ): Promise<HistoricalRentalRecord[]> {
    const baseQuery = `
      SELECT 
        bt.id as transaction_id,
        bt.borrow_date,
        bt.due_date,
        bt.return_date,
        bt.status,
        bt.notes,
        CASE 
          WHEN bt.return_date IS NOT NULL 
          THEN julianday(bt.return_date) - julianday(bt.borrow_date)
          ELSE julianday('now') - julianday(bt.borrow_date)
        END as days_borrowed,
        CASE 
          WHEN bt.return_date IS NULL AND bt.due_date < datetime('now') THEN 1
          WHEN bt.return_date IS NOT NULL AND bt.return_date > bt.due_date THEN 1
          ELSE 0
        END as is_overdue,
        CASE 
          WHEN bt.return_date IS NULL AND bt.due_date < datetime('now') 
          THEN julianday('now') - julianday(bt.due_date)
          WHEN bt.return_date IS NOT NULL AND bt.return_date > bt.due_date 
          THEN julianday(bt.return_date) - julianday(bt.due_date)
          ELSE NULL
        END as days_overdue,
        
        -- Book details
        b.id as book_id,
        b.title as book_title,
        b.author as book_author,
        b.isbn as book_isbn,
        b.genre as book_genre,
        b.publication_year as book_publication_year,
        bc.id as copy_id,
        COALESCE(bc.condition_notes, 'Good') as copy_condition,
        
        -- Member details
        m.member_id,
        m.first_name as member_first_name,
        m.last_name as member_last_name,
        m.email as member_email,
        m.status as member_status,
        m.registration_date as member_registration_date
        
      FROM borrowing_transactions bt
      JOIN book_copies bc ON bt.book_copy_id = bc.id
      JOIN books b ON bc.book_id = b.id
      JOIN members m ON bt.member_id = m.member_id
      WHERE m.member_id = ?
    `;

    const whereConditions: string[] = [];
    const params: any[] = [memberId];

    if (filters) {
      if (filters.startDate && filters.endDate) {
        whereConditions.push('bt.borrow_date BETWEEN ? AND ?');
        params.push(filters.startDate, filters.endDate);
      }

      if (filters.bookGenre) {
        whereConditions.push('b.genre = ?');
        params.push(filters.bookGenre);
      }

      if (filters.transactionStatus) {
        whereConditions.push('bt.status = ?');
        params.push(filters.transactionStatus);
      }
    }

    let finalQuery = baseQuery;
    if (whereConditions.length > 0) {
      finalQuery += ` AND ${whereConditions.join(' AND ')}`;
    }

    // Add sorting and pagination
    const sortBy = filters?.sortBy || 'borrow_date';
    const sortOrder = filters?.sortOrder || 'DESC';

    const sortColumn =
      {
        borrow_date: 'bt.borrow_date',
        return_date: 'bt.return_date',
        book_title: 'b.title',
        member_name: 'm.last_name, m.first_name',
        days_borrowed: 'days_borrowed',
      }[sortBy] || 'bt.borrow_date';

    finalQuery += ` ORDER BY ${sortColumn} ${sortOrder}`;

    if (filters?.limit) {
      finalQuery += ` LIMIT ${filters.limit}`;
      if (filters.offset) {
        finalQuery += ` OFFSET ${filters.offset}`;
      }
    }

    return (await databaseConnection.all(
      finalQuery,
      params
    )) as HistoricalRentalRecord[];
  }

  /**
   * Get rental trends over time periods
   */
  async getRentalTrends(
    startDate: string,
    endDate: string,
    periodType: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'
  ): Promise<TemporalRentalTrend[]> {
    const dateFormat = {
      daily: '%Y-%m-%d',
      weekly: '%Y-W%W',
      monthly: '%Y-%m',
      yearly: '%Y',
    }[periodType];

    const query = `
      SELECT 
        strftime('${dateFormat}', bt.borrow_date) as period,
        '${periodType}' as period_type,
        COUNT(bt.id) as total_borrows,
        COUNT(CASE WHEN bt.return_date IS NOT NULL THEN 1 END) as total_returns,
        COUNT(CASE WHEN bt.status = 'Active' THEN 1 END) as active_borrows,
        COUNT(DISTINCT bt.member_id) as unique_borrowers,
        COUNT(DISTINCT bc.book_id) as unique_books_borrowed,
        COUNT(CASE 
          WHEN bt.return_date IS NULL AND bt.due_date < datetime('now') THEN 1
          WHEN bt.return_date IS NOT NULL AND bt.return_date > bt.due_date THEN 1
        END) as overdue_count,
        COALESCE(AVG(
          CASE 
            WHEN bt.return_date IS NOT NULL 
            THEN julianday(bt.return_date) - julianday(bt.borrow_date)
            ELSE julianday('now') - julianday(bt.borrow_date)
          END
        ), 0) as average_borrow_duration
      FROM borrowing_transactions bt
      JOIN book_copies bc ON bt.book_copy_id = bc.id
      WHERE bt.borrow_date BETWEEN ? AND ?
      GROUP BY strftime('${dateFormat}', bt.borrow_date)
      ORDER BY period ASC
    `;

    return (await databaseConnection.all(query, [
      startDate,
      endDate,
    ])) as TemporalRentalTrend[];
  }

  /**
   * Search rental history with complex filters
   */
  async searchRentalHistory(
    filters: RentalHistoryFilters
  ): Promise<HistoricalRentalRecord[]> {
    const baseQuery = `
      SELECT 
        bt.id as transaction_id,
        bt.borrow_date,
        bt.due_date,
        bt.return_date,
        bt.status,
        bt.notes,
        CASE 
          WHEN bt.return_date IS NOT NULL 
          THEN julianday(bt.return_date) - julianday(bt.borrow_date)
          ELSE julianday('now') - julianday(bt.borrow_date)
        END as days_borrowed,
        CASE 
          WHEN bt.return_date IS NULL AND bt.due_date < datetime('now') THEN 1
          WHEN bt.return_date IS NOT NULL AND bt.return_date > bt.due_date THEN 1
          ELSE 0
        END as is_overdue,
        CASE 
          WHEN bt.return_date IS NULL AND bt.due_date < datetime('now') 
          THEN julianday('now') - julianday(bt.due_date)
          WHEN bt.return_date IS NOT NULL AND bt.return_date > bt.due_date 
          THEN julianday(bt.return_date) - julianday(bt.due_date)
          ELSE NULL
        END as days_overdue,
        
        -- Book details
        b.id as book_id,
        b.title as book_title,
        b.author as book_author,
        b.isbn as book_isbn,
        b.genre as book_genre,
        b.publication_year as book_publication_year,
        bc.id as copy_id,
        COALESCE(bc.condition_notes, 'Good') as copy_condition,
        
        -- Member details
        m.member_id,
        m.first_name as member_first_name,
        m.last_name as member_last_name,
        m.email as member_email,
        m.status as member_status,
        m.registration_date as member_registration_date
        
      FROM borrowing_transactions bt
      JOIN book_copies bc ON bt.book_copy_id = bc.id
      JOIN books b ON bc.book_id = b.id
      JOIN members m ON bt.member_id = m.member_id
      WHERE 1=1
    `;

    const whereConditions: string[] = [];
    const params: any[] = [];

    // Apply all available filters
    if (filters.startDate && filters.endDate) {
      whereConditions.push('bt.borrow_date BETWEEN ? AND ?');
      params.push(filters.startDate, filters.endDate);
    }

    if (filters.borrowStartDate && filters.borrowEndDate) {
      whereConditions.push('bt.borrow_date BETWEEN ? AND ?');
      params.push(filters.borrowStartDate, filters.borrowEndDate);
    }

    if (filters.returnStartDate && filters.returnEndDate) {
      whereConditions.push('bt.return_date BETWEEN ? AND ?');
      params.push(filters.returnStartDate, filters.returnEndDate);
    }

    if (filters.bookId) {
      whereConditions.push('b.id = ?');
      params.push(filters.bookId);
    }

    if (filters.memberId) {
      whereConditions.push('m.member_id = ?');
      params.push(filters.memberId);
    }

    if (filters.bookGenre) {
      whereConditions.push('b.genre = ?');
      params.push(filters.bookGenre);
    }

    if (filters.memberStatus) {
      whereConditions.push('m.status = ?');
      params.push(filters.memberStatus);
    }

    if (filters.transactionStatus) {
      whereConditions.push('bt.status = ?');
      params.push(filters.transactionStatus);
    }

    if (filters.isOverdue !== undefined) {
      if (filters.isOverdue) {
        whereConditions.push(
          "(bt.return_date IS NULL AND bt.due_date < datetime('now')) OR (bt.return_date IS NOT NULL AND bt.return_date > bt.due_date)"
        );
      } else {
        whereConditions.push(
          "NOT ((bt.return_date IS NULL AND bt.due_date < datetime('now')) OR (bt.return_date IS NOT NULL AND bt.return_date > bt.due_date))"
        );
      }
    }

    if (filters.isReturned !== undefined) {
      if (filters.isReturned) {
        whereConditions.push('bt.return_date IS NOT NULL');
      } else {
        whereConditions.push('bt.return_date IS NULL');
      }
    }

    if (filters.minBorrowDays) {
      whereConditions.push(`(
        CASE 
          WHEN bt.return_date IS NOT NULL 
          THEN julianday(bt.return_date) - julianday(bt.borrow_date)
          ELSE julianday('now') - julianday(bt.borrow_date)
        END
      ) >= ?`);
      params.push(filters.minBorrowDays);
    }

    if (filters.maxBorrowDays) {
      whereConditions.push(`(
        CASE 
          WHEN bt.return_date IS NOT NULL 
          THEN julianday(bt.return_date) - julianday(bt.borrow_date)
          ELSE julianday('now') - julianday(bt.borrow_date)
        END
      ) <= ?`);
      params.push(filters.maxBorrowDays);
    }

    // Build final query
    let finalQuery = baseQuery;
    if (whereConditions.length > 0) {
      finalQuery += ` AND ${whereConditions.join(' AND ')}`;
    }

    // Add sorting
    const sortBy = filters.sortBy || 'borrow_date';
    const sortOrder = filters.sortOrder || 'DESC';

    const sortColumn =
      {
        borrow_date: 'bt.borrow_date',
        return_date: 'bt.return_date',
        book_title: 'b.title',
        member_name: 'm.last_name, m.first_name',
        days_borrowed: 'days_borrowed',
      }[sortBy] || 'bt.borrow_date';

    finalQuery += ` ORDER BY ${sortColumn} ${sortOrder}`;

    // Add pagination
    if (filters.limit) {
      finalQuery += ` LIMIT ${filters.limit}`;
      if (filters.offset) {
        finalQuery += ` OFFSET ${filters.offset}`;
      }
    }

    return (await databaseConnection.all(
      finalQuery,
      params
    )) as HistoricalRentalRecord[];
  }
}

// Export singleton instance
export const rentalHistoryRepository = new RentalHistoryRepository();
