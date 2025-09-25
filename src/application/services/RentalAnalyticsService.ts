import { databaseConnection } from '../../data-access/DatabaseConnection.js';
import type { Book } from '../models/Book.js';
import type { BorrowingTransaction } from '../models/BorrowingTransaction.js';
import type { Member, MemberStatus } from '../models/Member.js';

/**
 * Rental Analytics Service
 *
 * Provides comprehensive analytics for book rental tracking, answering key questions:
 * - Which members have borrowed a specific book?
 * - What books has a specific member borrowed?
 * - Current borrowing status and rental history
 */

// Enhanced interfaces for rental analytics
export interface MemberBorrowRecord {
  // Member fields
  id: number;
  member_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  status: MemberStatus;
  registration_date: string;
  created_at: string;
  updated_at: string;
  // Borrowing fields
  borrow_date: string;
  return_date: string | null;
  due_date: string;
  transaction_id: string;
  book_copy_id: string;
  is_overdue: boolean;
  days_overdue: number | null;
  transaction_status: string; // Renamed to avoid conflict with member status
}

export interface BookBorrowRecord extends Book {
  borrow_date: string;
  return_date: string | null;
  due_date: string;
  transaction_id: string;
  book_copy_id: string;
  is_overdue: boolean;
  days_overdue: number | null;
  status: string;
  copy_condition: string;
}

export interface MemberBookAssociation {
  member_id: string;
  member_name: string;
  book_id: string;
  book_title: string;
  borrow_date: string;
  return_date: string | null;
  due_date: string;
  is_current: boolean;
  is_overdue: boolean;
  transaction_id: string;
}

export interface CurrentBorrowerSummary {
  book_id: string;
  book_title: string;
  total_copies: number;
  available_copies: number;
  borrowed_copies: number;
  current_borrowers: MemberBorrowRecord[];
}

export class RentalAnalyticsService {
  /**
   * Get all members who have ever borrowed a specific book
   * Answers: "Which members have borrowed Book X?"
   */
  async getMembersByBookId(bookId: string): Promise<MemberBorrowRecord[]> {
    const query = `
      SELECT DISTINCT 
        m.*,
        bt.id as transaction_id,
        bt.book_copy_id,
        bt.borrow_date,
        bt.return_date,
        bt.due_date,
        bt.status as transaction_status,
        CASE 
          WHEN bt.return_date IS NULL AND date(bt.due_date) < date('now') 
          THEN 1 
          ELSE 0 
        END as is_overdue,
        CASE 
          WHEN bt.return_date IS NULL AND date(bt.due_date) < date('now') 
          THEN julianday('now') - julianday(bt.due_date)
          ELSE NULL 
        END as days_overdue
      FROM members m
      INNER JOIN borrowing_transactions bt ON m.id = bt.member_id
      INNER JOIN book_copies bc ON bt.book_copy_id = bc.id
      WHERE bc.book_id = ?
      ORDER BY bt.borrow_date DESC
    `;

    const rows = await databaseConnection.all(query, [bookId]);

    return rows.map((row: any) => ({
      ...row,
      is_overdue: Boolean(row.is_overdue),
      days_overdue: row.days_overdue ? Math.ceil(row.days_overdue) : null,
    })) as MemberBorrowRecord[];
  }

  /**
   * Get all current borrowers of a specific book
   * Answers: "Who currently has Book X?"
   */
  async getCurrentBorrowersForBook(
    bookId: string
  ): Promise<MemberBorrowRecord[]> {
    const query = `
      SELECT DISTINCT 
        m.*,
        bt.id as transaction_id,
        bt.book_copy_id,
        bt.borrow_date,
        bt.return_date,
        bt.due_date,
        bt.status as transaction_status,
        CASE 
          WHEN date(bt.due_date) < date('now') 
          THEN 1 
          ELSE 0 
        END as is_overdue,
        CASE 
          WHEN date(bt.due_date) < date('now') 
          THEN julianday('now') - julianday(bt.due_date)
          ELSE NULL 
        END as days_overdue
      FROM members m
      INNER JOIN borrowing_transactions bt ON m.id = bt.member_id
      INNER JOIN book_copies bc ON bt.book_copy_id = bc.id
      WHERE bc.book_id = ? 
        AND bt.return_date IS NULL
        AND bt.status IN ('Active', 'Overdue')
      ORDER BY bt.borrow_date DESC
    `;

    const rows = await databaseConnection.all(query, [bookId]);

    return rows.map((row: any) => ({
      ...row,
      is_overdue: Boolean(row.is_overdue),
      days_overdue: row.days_overdue ? Math.ceil(row.days_overdue) : null,
    })) as MemberBorrowRecord[];
  }

  /**
   * Get all books ever borrowed by a specific member
   * Answers: "What books has Member Y borrowed?"
   */
  async getBooksByMemberId(memberId: string): Promise<BookBorrowRecord[]> {
    const query = `
      SELECT DISTINCT 
        b.*,
        bt.id as transaction_id,
        bt.book_copy_id,
        bt.borrow_date,
        bt.return_date,
        bt.due_date,
        bt.status as transaction_status,
        bc.condition as copy_condition,
        CASE 
          WHEN bt.return_date IS NULL AND date(bt.due_date) < date('now') 
          THEN 1 
          ELSE 0 
        END as is_overdue,
        CASE 
          WHEN bt.return_date IS NULL AND date(bt.due_date) < date('now') 
          THEN julianday('now') - julianday(bt.due_date)
          ELSE NULL 
        END as days_overdue
      FROM books b
      INNER JOIN book_copies bc ON b.id = bc.book_id
      INNER JOIN borrowing_transactions bt ON bc.id = bt.book_copy_id
      WHERE bt.member_id = ?
      ORDER BY bt.borrow_date DESC
    `;

    const rows = await databaseConnection.all(query, [memberId]);

    return rows.map((row: any) => ({
      ...row,
      is_overdue: Boolean(row.is_overdue),
      days_overdue: row.days_overdue ? Math.ceil(row.days_overdue) : null,
    })) as BookBorrowRecord[];
  }

  /**
   * Get all books currently borrowed by a specific member
   * Answers: "What books does Member Y currently have?"
   */
  async getCurrentBooksByMemberId(
    memberId: string
  ): Promise<BookBorrowRecord[]> {
    const query = `
      SELECT DISTINCT 
        b.*,
        bt.id as transaction_id,
        bt.book_copy_id,
        bt.borrow_date,
        bt.return_date,
        bt.due_date,
        bt.status as transaction_status,
        bc.condition as copy_condition,
        CASE 
          WHEN date(bt.due_date) < date('now') 
          THEN 1 
          ELSE 0 
        END as is_overdue,
        CASE 
          WHEN date(bt.due_date) < date('now') 
          THEN julianday('now') - julianday(bt.due_date)
          ELSE NULL 
        END as days_overdue
      FROM books b
      INNER JOIN book_copies bc ON b.id = bc.book_id
      INNER JOIN borrowing_transactions bt ON bc.id = bt.book_copy_id
      WHERE bt.member_id = ? 
        AND bt.return_date IS NULL
        AND bt.status IN ('Active', 'Overdue')
      ORDER BY bt.borrow_date DESC
    `;

    const rows = await databaseConnection.all(query, [memberId]);

    return rows.map((row: any) => ({
      ...row,
      is_overdue: Boolean(row.is_overdue),
      days_overdue: row.days_overdue ? Math.ceil(row.days_overdue) : null,
    })) as BookBorrowRecord[];
  }

  /**
   * Get comprehensive borrowing summary for a book
   * Answers: "What's the complete borrowing status for Book X?"
   */
  async getCurrentBorrowerSummaryForBook(
    bookId: string
  ): Promise<CurrentBorrowerSummary> {
    // Get book details
    const bookQuery = `SELECT * FROM books WHERE id = ?`;
    const book = await databaseConnection.getOne(bookQuery, [bookId]);

    if (!book) {
      throw new Error(`Book with ID ${bookId} not found`);
    }

    // Get copy statistics
    const copyStatsQuery = `
      SELECT 
        COUNT(*) as total_copies,
        COUNT(CASE WHEN bc.status = 'Available' THEN 1 END) as available_copies,
        COUNT(CASE WHEN bc.status = 'Borrowed' THEN 1 END) as borrowed_copies
      FROM book_copies bc
      WHERE bc.book_id = ?
    `;
    const copyStats = await databaseConnection.getOne(copyStatsQuery, [bookId]);

    // Get current borrowers
    const currentBorrowers = await this.getCurrentBorrowersForBook(bookId);

    return {
      book_id: bookId,
      book_title: (book as any)?.title || 'Unknown',
      total_copies: (copyStats as any)?.total_copies || 0,
      available_copies: (copyStats as any)?.available_copies || 0,
      borrowed_copies: (copyStats as any)?.borrowed_copies || 0,
      current_borrowers: currentBorrowers,
    };
  }

  /**
   * Get all member-book associations with filters
   * Answers: "Show me all borrowing relationships"
   */
  async getMemberBookAssociations(
    options: {
      memberId?: string;
      bookId?: string;
      currentOnly?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<MemberBookAssociation[]> {
    const whereConditions: string[] = [];
    const params: any[] = [];

    if (options.memberId) {
      whereConditions.push('m.id = ?');
      params.push(options.memberId);
    }

    if (options.bookId) {
      whereConditions.push('b.id = ?');
      params.push(options.bookId);
    }

    if (options.currentOnly) {
      whereConditions.push('bt.return_date IS NULL');
      whereConditions.push("bt.status IN ('Active', 'Overdue')");
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

    const limitClause = options.limit ? `LIMIT ${options.limit}` : '';
    const offsetClause = options.offset ? `OFFSET ${options.offset}` : '';

    const query = `
      SELECT 
        m.id as member_id,
        (m.first_name || ' ' || m.last_name) as member_name,
        b.id as book_id,
        b.title as book_title,
        bt.borrow_date,
        bt.return_date,
        bt.due_date,
        bt.id as transaction_id,
        CASE WHEN bt.return_date IS NULL THEN 1 ELSE 0 END as is_current,
        CASE 
          WHEN bt.return_date IS NULL AND date(bt.due_date) < date('now') 
          THEN 1 
          ELSE 0 
        END as is_overdue
      FROM members m
      INNER JOIN borrowing_transactions bt ON m.id = bt.member_id
      INNER JOIN book_copies bc ON bt.book_copy_id = bc.id
      INNER JOIN books b ON bc.book_id = b.id
      ${whereClause}
      ORDER BY bt.borrow_date DESC
      ${limitClause} ${offsetClause}
    `;

    const rows = await databaseConnection.all(query, params);

    return rows.map((row: any) => ({
      ...row,
      is_current: Boolean(row.is_current),
      is_overdue: Boolean(row.is_overdue),
    })) as MemberBookAssociation[];
  }

  /**
   * Get rental statistics
   * Answers: "What are the overall rental patterns?"
   */
  async getRentalStatistics() {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN return_date IS NULL THEN 1 END) as active_rentals,
        COUNT(CASE WHEN return_date IS NOT NULL THEN 1 END) as completed_rentals,
        COUNT(CASE WHEN return_date IS NULL AND date(due_date) < date('now') THEN 1 END) as overdue_rentals,
        COUNT(DISTINCT member_id) as unique_borrowers,
        COUNT(DISTINCT book_copy_id) as unique_books_borrowed,
        AVG(julianday(COALESCE(return_date, 'now')) - julianday(borrow_date)) as avg_loan_duration_days
      FROM borrowing_transactions
    `;

    const stats = await databaseConnection.getOne(statsQuery, []);

    return {
      total_transactions: (stats as any)?.total_transactions || 0,
      active_rentals: (stats as any)?.active_rentals || 0,
      completed_rentals: (stats as any)?.completed_rentals || 0,
      overdue_rentals: (stats as any)?.overdue_rentals || 0,
      unique_borrowers: (stats as any)?.unique_borrowers || 0,
      unique_books_borrowed: (stats as any)?.unique_books_borrowed || 0,
      avg_loan_duration_days: (stats as any)?.avg_loan_duration_days
        ? Math.round((stats as any).avg_loan_duration_days * 10) / 10
        : 0,
    };
  }
}

// Export singleton instance
export const rentalAnalyticsService = new RentalAnalyticsService();
