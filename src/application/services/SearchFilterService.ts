import { databaseConnection } from '../../data-access/DatabaseConnection.js';
import type { Book } from '../models/Book.js';
import type { BorrowingTransaction } from '../models/BorrowingTransaction.js';
import type { Member } from '../models/Member.js';

/**
 * Task 9: Search and Filter Enhancement Service
 *
 * Provides comprehensive search and filtering capabilities across the library system.
 * Supports advanced queries with multiple criteria, fuzzy matching, sorting, and pagination.
 *
 * Features:
 * - Multi-field book search with fuzzy matching
 * - Member search with behavioral and status filters
 * - Rental transaction search with date ranges and status filters
 * - Cross-entity search capabilities
 * - Advanced sorting and pagination
 * - Integration with analytics services for enriched results
 */

// Search interfaces and types
export interface BookSearchFilters {
  title?: string;
  author?: string;
  genre?: string;
  isbn?: string;
  publicationYear?: number;
  publicationYearFrom?: number;
  publicationYearTo?: number;
  language?: string;
  availabilityStatus?: 'available' | 'borrowed' | 'all';
  fuzzyMatch?: boolean;
  minPopularityScore?: number;
}

export interface MemberSearchFilters {
  name?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'suspended' | 'pending' | 'all';
  registrationDateFrom?: string;
  registrationDateTo?: string;
  activityLevel?: 'high' | 'medium' | 'low' | 'inactive' | 'all';
  riskLevel?: 'low' | 'medium' | 'high' | 'all';
  membershipType?: string;
  hasOverdueBooks?: boolean;
}

export interface RentalSearchFilters {
  memberId?: string;
  bookId?: string;
  memberName?: string;
  bookTitle?: string;
  borrowDateFrom?: string;
  borrowDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  returnDateFrom?: string;
  returnDateTo?: string;
  transactionStatus?: 'active' | 'returned' | 'overdue' | 'all';
  isOverdue?: boolean;
  daysOverdueMin?: number;
  daysOverdueMax?: number;
}

export interface SearchOptions {
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
  includeAnalytics?: boolean;
}

export interface SearchResult<T> {
  results: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  searchMetadata: {
    searchTime: number;
    searchQuery: string;
    filtersApplied: number;
    fuzzyMatchUsed: boolean;
  };
}

// Enhanced result types with analytics
export interface BookSearchResult extends Book {
  popularity_score?: number;
  total_borrows?: number;
  current_borrows?: number;
  available_copies?: number;
  total_copies?: number;
  avg_rating?: number;
  last_borrowed_date?: string;
}

export interface MemberSearchResult extends Member {
  total_borrows?: number;
  active_borrows?: number;
  overdue_books?: number;
  activity_score?: number;
  risk_level?: string;
  last_activity_date?: string;
  total_late_fees?: number;
}

export interface RentalSearchResult extends BorrowingTransaction {
  member_name?: string;
  member_email?: string;
  book_title?: string;
  book_author?: string;
  book_genre?: string;
  days_borrowed?: number;
  days_overdue?: number;
  late_fee_amount?: number;
  is_overdue?: boolean;
}

class SearchFilterService {
  /**
   * Advanced book search with multiple criteria and fuzzy matching
   */
  async searchBooks(
    filters: BookSearchFilters = {},
    options: SearchOptions = {}
  ): Promise<SearchResult<BookSearchResult>> {
    const startTime = Date.now();
    const {
      sortBy = 'title',
      sortOrder = 'ASC',
      page = 1,
      limit = 20,
      includeAnalytics = true,
    } = options;

    const offset = (page - 1) * limit;
    const whereConditions: string[] = [];
    const params: (string | number)[] = [];
    let filtersApplied = 0;
    let fuzzyMatchUsed = false;

    // Base query with analytics data
    let query = `
      SELECT 
        b.*,
        COUNT(bt.id) as total_borrows,
        COUNT(CASE WHEN bt.return_date IS NULL THEN 1 END) as current_borrows,
        COUNT(bc.id) as total_copies,
        COUNT(CASE WHEN bc.id NOT IN (
          SELECT book_copy_id FROM borrowing_transactions 
          WHERE return_date IS NULL
        ) THEN 1 END) as available_copies,
        MAX(bt.borrow_date) as last_borrowed_date,
        COALESCE(AVG(br.rating), 0) as avg_rating
      FROM books b
      LEFT JOIN book_copies bc ON b.id = bc.book_id
      LEFT JOIN borrowing_transactions bt ON bc.id = bt.book_copy_id
      LEFT JOIN book_ratings br ON b.id = br.book_id
    `;

    // Title search with fuzzy matching option
    if (filters.title) {
      if (filters.fuzzyMatch) {
        whereConditions.push('b.title LIKE ?');
        params.push(`%${filters.title}%`);
        fuzzyMatchUsed = true;
      } else {
        whereConditions.push('b.title = ?');
        params.push(filters.title);
      }
      filtersApplied++;
    }

    // Author search with fuzzy matching option
    if (filters.author) {
      if (filters.fuzzyMatch) {
        whereConditions.push('b.author LIKE ?');
        params.push(`%${filters.author}%`);
        fuzzyMatchUsed = true;
      } else {
        whereConditions.push('b.author = ?');
        params.push(filters.author);
      }
      filtersApplied++;
    }

    // Genre filter
    if (filters.genre) {
      whereConditions.push('b.genre = ?');
      params.push(filters.genre);
      filtersApplied++;
    }

    // ISBN search
    if (filters.isbn) {
      whereConditions.push('b.isbn = ?');
      params.push(filters.isbn);
      filtersApplied++;
    }

    // Publication year filters
    if (filters.publicationYear) {
      whereConditions.push('b.publication_year = ?');
      params.push(filters.publicationYear);
      filtersApplied++;
    }

    if (filters.publicationYearFrom && filters.publicationYearTo) {
      whereConditions.push('b.publication_year BETWEEN ? AND ?');
      params.push(filters.publicationYearFrom, filters.publicationYearTo);
      filtersApplied++;
    } else if (filters.publicationYearFrom) {
      whereConditions.push('b.publication_year >= ?');
      params.push(filters.publicationYearFrom);
      filtersApplied++;
    } else if (filters.publicationYearTo) {
      whereConditions.push('b.publication_year <= ?');
      params.push(filters.publicationYearTo);
      filtersApplied++;
    }

    // Language filter
    if (filters.language) {
      whereConditions.push('b.language = ?');
      params.push(filters.language);
      filtersApplied++;
    }

    // Add WHERE conditions
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    // Group by for aggregations
    query += ` GROUP BY b.id`;

    // Having clause for availability and popularity filters
    const havingConditions: string[] = [];

    if (filters.availabilityStatus === 'available') {
      havingConditions.push('available_copies > 0');
      filtersApplied++;
    } else if (filters.availabilityStatus === 'borrowed') {
      havingConditions.push('current_borrows > 0');
      filtersApplied++;
    }

    if (filters.minPopularityScore) {
      havingConditions.push('total_borrows >= ?');
      params.push(filters.minPopularityScore);
      filtersApplied++;
    }

    if (havingConditions.length > 0) {
      query += ` HAVING ${havingConditions.join(' AND ')}`;
    }

    // Sorting
    const allowedSortFields = [
      'title',
      'author',
      'genre',
      'publication_year',
      'total_borrows',
      'available_copies',
      'avg_rating',
      'last_borrowed_date',
    ];

    if (allowedSortFields.includes(sortBy)) {
      query += ` ORDER BY ${sortBy} ${sortOrder}`;
    } else {
      query += ` ORDER BY title ${sortOrder}`;
    }

    // Pagination
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Execute main query
    const results = await databaseConnection.all(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT b.id) as total
      FROM books b
      LEFT JOIN book_copies bc ON b.id = bc.book_id
      LEFT JOIN borrowing_transactions bt ON bc.id = bt.book_copy_id
      LEFT JOIN book_ratings br ON b.id = br.book_id
    `;

    if (whereConditions.length > 0) {
      countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    // For count query, we need to replicate the having conditions in a subquery
    if (havingConditions.length > 0) {
      countQuery = `
        SELECT COUNT(*) as total FROM (
          SELECT b.id
          FROM books b
          LEFT JOIN book_copies bc ON b.id = bc.book_id
          LEFT JOIN borrowing_transactions bt ON bc.id = bt.book_copy_id
          LEFT JOIN book_ratings br ON b.id = br.book_id
          ${whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''}
          GROUP BY b.id
          HAVING ${havingConditions.join(' AND ')}
        )
      `;
    }

    const countParams = params.slice(0, params.length - 2); // Remove LIMIT and OFFSET
    const countResult = await databaseConnection.getOne(
      countQuery,
      countParams
    );
    const totalCount = (countResult as unknown as { total: number }).total;

    const searchTime = Date.now() - startTime;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      results: results.map((row: unknown) => ({
        ...(row as Record<string, unknown>),
        popularity_score:
          Number((row as Record<string, unknown>).total_borrows) || 0,
      })) as BookSearchResult[],
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      searchMetadata: {
        searchTime,
        searchQuery: query,
        filtersApplied,
        fuzzyMatchUsed,
      },
    };
  }

  /**
   * Advanced member search with behavioral and status filters
   */
  async searchMembers(
    filters: MemberSearchFilters = {},
    options: SearchOptions = {}
  ): Promise<SearchResult<MemberSearchResult>> {
    const startTime = Date.now();
    const {
      sortBy = 'name',
      sortOrder = 'ASC',
      page = 1,
      limit = 20,
      includeAnalytics = true,
    } = options;

    const offset = (page - 1) * limit;
    const whereConditions: string[] = [];
    const params: (string | number)[] = [];
    let filtersApplied = 0;
    let fuzzyMatchUsed = false;

    // Base query with analytics data
    let query = `
      SELECT 
        m.*,
        COUNT(bt.id) as total_borrows,
        COUNT(CASE WHEN bt.return_date IS NULL THEN 1 END) as active_borrows,
        COUNT(CASE WHEN bt.return_date IS NULL AND 
          julianday('now') - julianday(bt.due_date) > 0 THEN 1 END) as overdue_books,
        MAX(bt.borrow_date) as last_activity_date,
        COALESCE(SUM(lf.amount), 0) as total_late_fees,
        CASE 
          WHEN COUNT(bt.id) > 20 THEN 'high'
          WHEN COUNT(bt.id) > 5 THEN 'medium'  
          WHEN COUNT(bt.id) > 0 THEN 'low'
          ELSE 'inactive'
        END as activity_level,
        CASE
          WHEN COUNT(CASE WHEN bt.return_date IS NULL AND 
            julianday('now') - julianday(bt.due_date) > 7 THEN 1 END) > 0 THEN 'high'
          WHEN COUNT(CASE WHEN bt.return_date IS NULL AND 
            julianday('now') - julianday(bt.due_date) > 0 THEN 1 END) > 0 THEN 'medium'
          ELSE 'low'
        END as risk_level
      FROM members m
      LEFT JOIN borrowing_transactions bt ON m.id = bt.member_id
      LEFT JOIN late_fees lf ON bt.id = lf.transaction_id
    `;

    // Name search (fuzzy by default for names)
    if (filters.name) {
      whereConditions.push('m.name LIKE ?');
      params.push(`%${filters.name}%`);
      fuzzyMatchUsed = true;
      filtersApplied++;
    }

    // Email search
    if (filters.email) {
      whereConditions.push('m.email LIKE ?');
      params.push(`%${filters.email}%`);
      fuzzyMatchUsed = true;
      filtersApplied++;
    }

    // Phone search
    if (filters.phone) {
      whereConditions.push('m.phone LIKE ?');
      params.push(`%${filters.phone}%`);
      filtersApplied++;
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      whereConditions.push('m.status = ?');
      params.push(filters.status);
      filtersApplied++;
    }

    // Registration date range
    if (filters.registrationDateFrom && filters.registrationDateTo) {
      whereConditions.push('m.registration_date BETWEEN ? AND ?');
      params.push(filters.registrationDateFrom, filters.registrationDateTo);
      filtersApplied++;
    } else if (filters.registrationDateFrom) {
      whereConditions.push('m.registration_date >= ?');
      params.push(filters.registrationDateFrom);
      filtersApplied++;
    } else if (filters.registrationDateTo) {
      whereConditions.push('m.registration_date <= ?');
      params.push(filters.registrationDateTo);
      filtersApplied++;
    }

    // Membership type
    if (filters.membershipType) {
      whereConditions.push('m.membership_type = ?');
      params.push(filters.membershipType);
      filtersApplied++;
    }

    // Add WHERE conditions
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    // Group by for aggregations
    query += ` GROUP BY m.id`;

    // Having clauses for computed filters
    const havingConditions: string[] = [];

    if (filters.activityLevel && filters.activityLevel !== 'all') {
      switch (filters.activityLevel) {
        case 'high':
          havingConditions.push('COUNT(bt.id) > 20');
          break;
        case 'medium':
          havingConditions.push('COUNT(bt.id) BETWEEN 6 AND 20');
          break;
        case 'low':
          havingConditions.push('COUNT(bt.id) BETWEEN 1 AND 5');
          break;
        case 'inactive':
          havingConditions.push('COUNT(bt.id) = 0');
          break;
      }
      filtersApplied++;
    }

    if (filters.hasOverdueBooks === true) {
      havingConditions.push(`COUNT(CASE WHEN bt.return_date IS NULL AND 
        julianday('now') - julianday(bt.due_date) > 0 THEN 1 END) > 0`);
      filtersApplied++;
    } else if (filters.hasOverdueBooks === false) {
      havingConditions.push(`COUNT(CASE WHEN bt.return_date IS NULL AND 
        julianday('now') - julianday(bt.due_date) > 0 THEN 1 END) = 0`);
      filtersApplied++;
    }

    if (filters.riskLevel && filters.riskLevel !== 'all') {
      switch (filters.riskLevel) {
        case 'high':
          havingConditions.push(`COUNT(CASE WHEN bt.return_date IS NULL AND 
            julianday('now') - julianday(bt.due_date) > 7 THEN 1 END) > 0`);
          break;
        case 'medium':
          havingConditions.push(`COUNT(CASE WHEN bt.return_date IS NULL AND 
            julianday('now') - julianday(bt.due_date) > 0 THEN 1 END) > 0 AND
            COUNT(CASE WHEN bt.return_date IS NULL AND 
            julianday('now') - julianday(bt.due_date) > 7 THEN 1 END) = 0`);
          break;
        case 'low':
          havingConditions.push(`COUNT(CASE WHEN bt.return_date IS NULL AND 
            julianday('now') - julianday(bt.due_date) > 0 THEN 1 END) = 0`);
          break;
      }
      filtersApplied++;
    }

    if (havingConditions.length > 0) {
      query += ` HAVING ${havingConditions.join(' AND ')}`;
    }

    // Sorting
    const allowedSortFields = [
      'name',
      'email',
      'registration_date',
      'status',
      'total_borrows',
      'active_borrows',
      'overdue_books',
      'last_activity_date',
      'total_late_fees',
      'activity_level',
      'risk_level',
    ];

    if (allowedSortFields.includes(sortBy)) {
      query += ` ORDER BY ${sortBy} ${sortOrder}`;
    } else {
      query += ` ORDER BY name ${sortOrder}`;
    }

    // Pagination
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Execute queries
    const results = await databaseConnection.all(query, params);

    // Get total count (similar pattern as books search)
    let countQuery = `
      SELECT COUNT(DISTINCT m.id) as total
      FROM members m
      LEFT JOIN borrowing_transactions bt ON m.id = bt.member_id
      LEFT JOIN late_fees lf ON bt.id = lf.transaction_id
    `;

    if (whereConditions.length > 0) {
      countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    if (havingConditions.length > 0) {
      countQuery = `
        SELECT COUNT(*) as total FROM (
          SELECT m.id
          FROM members m
          LEFT JOIN borrowing_transactions bt ON m.id = bt.member_id
          LEFT JOIN late_fees lf ON bt.id = lf.transaction_id
          ${whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''}
          GROUP BY m.id
          HAVING ${havingConditions.join(' AND ')}
        )
      `;
    }

    const countParams = params.slice(0, params.length - 2);
    const countResult = await databaseConnection.getOne(
      countQuery,
      countParams
    );
    const totalCount = (countResult as unknown as { total: number }).total;

    const searchTime = Date.now() - startTime;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      results: results.map((row: unknown) => ({
        ...(row as Record<string, unknown>),
        activity_score:
          Number((row as Record<string, unknown>).total_borrows) || 0,
      })) as MemberSearchResult[],
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      searchMetadata: {
        searchTime,
        searchQuery: query,
        filtersApplied,
        fuzzyMatchUsed,
      },
    };
  }

  /**
   * Advanced rental/transaction search with comprehensive filters
   */
  async searchRentals(
    filters: RentalSearchFilters = {},
    options: SearchOptions = {}
  ): Promise<SearchResult<RentalSearchResult>> {
    const startTime = Date.now();
    const {
      sortBy = 'borrow_date',
      sortOrder = 'DESC',
      page = 1,
      limit = 20,
      includeAnalytics = true,
    } = options;

    const offset = (page - 1) * limit;
    const whereConditions: string[] = [];
    const params: (string | number)[] = [];
    let filtersApplied = 0;
    let fuzzyMatchUsed = false;

    // Base query with enriched data
    let query = `
      SELECT 
        bt.*,
        m.name as member_name,
        m.email as member_email,
        b.title as book_title,
        b.author as book_author,
        b.genre as book_genre,
        julianday(COALESCE(bt.return_date, 'now')) - julianday(bt.borrow_date) as days_borrowed,
        CASE 
          WHEN bt.return_date IS NULL AND julianday('now') - julianday(bt.due_date) > 0
          THEN julianday('now') - julianday(bt.due_date)
          ELSE 0
        END as days_overdue,
        CASE 
          WHEN bt.return_date IS NULL AND julianday('now') - julianday(bt.due_date) > 0
          THEN 1 ELSE 0
        END as is_overdue,
        COALESCE(lf.amount, 0) as late_fee_amount
      FROM borrowing_transactions bt
      INNER JOIN members m ON bt.member_id = m.id
      INNER JOIN book_copies bc ON bt.book_copy_id = bc.id
      INNER JOIN books b ON bc.book_id = b.id
      LEFT JOIN late_fees lf ON bt.id = lf.transaction_id
    `;

    // Member ID filter
    if (filters.memberId) {
      whereConditions.push('bt.member_id = ?');
      params.push(filters.memberId);
      filtersApplied++;
    }

    // Book ID filter
    if (filters.bookId) {
      whereConditions.push('bc.book_id = ?');
      params.push(filters.bookId);
      filtersApplied++;
    }

    // Member name search (fuzzy)
    if (filters.memberName) {
      whereConditions.push('m.name LIKE ?');
      params.push(`%${filters.memberName}%`);
      fuzzyMatchUsed = true;
      filtersApplied++;
    }

    // Book title search (fuzzy)
    if (filters.bookTitle) {
      whereConditions.push('b.title LIKE ?');
      params.push(`%${filters.bookTitle}%`);
      fuzzyMatchUsed = true;
      filtersApplied++;
    }

    // Date range filters
    if (filters.borrowDateFrom && filters.borrowDateTo) {
      whereConditions.push('bt.borrow_date BETWEEN ? AND ?');
      params.push(filters.borrowDateFrom, filters.borrowDateTo);
      filtersApplied++;
    } else if (filters.borrowDateFrom) {
      whereConditions.push('bt.borrow_date >= ?');
      params.push(filters.borrowDateFrom);
      filtersApplied++;
    } else if (filters.borrowDateTo) {
      whereConditions.push('bt.borrow_date <= ?');
      params.push(filters.borrowDateTo);
      filtersApplied++;
    }

    // Due date filters
    if (filters.dueDateFrom && filters.dueDateTo) {
      whereConditions.push('bt.due_date BETWEEN ? AND ?');
      params.push(filters.dueDateFrom, filters.dueDateTo);
      filtersApplied++;
    } else if (filters.dueDateFrom) {
      whereConditions.push('bt.due_date >= ?');
      params.push(filters.dueDateFrom);
      filtersApplied++;
    } else if (filters.dueDateTo) {
      whereConditions.push('bt.due_date <= ?');
      params.push(filters.dueDateTo);
      filtersApplied++;
    }

    // Return date filters
    if (filters.returnDateFrom && filters.returnDateTo) {
      whereConditions.push('bt.return_date BETWEEN ? AND ?');
      params.push(filters.returnDateFrom, filters.returnDateTo);
      filtersApplied++;
    } else if (filters.returnDateFrom) {
      whereConditions.push('bt.return_date >= ?');
      params.push(filters.returnDateFrom);
      filtersApplied++;
    } else if (filters.returnDateTo) {
      whereConditions.push('bt.return_date <= ?');
      params.push(filters.returnDateTo);
      filtersApplied++;
    }

    // Transaction status filters
    if (filters.transactionStatus && filters.transactionStatus !== 'all') {
      switch (filters.transactionStatus) {
        case 'active':
          whereConditions.push('bt.return_date IS NULL');
          break;
        case 'returned':
          whereConditions.push('bt.return_date IS NOT NULL');
          break;
        case 'overdue':
          whereConditions.push(
            "bt.return_date IS NULL AND julianday('now') - julianday(bt.due_date) > 0"
          );
          break;
      }
      filtersApplied++;
    }

    // Overdue filter
    if (filters.isOverdue === true) {
      whereConditions.push(
        "bt.return_date IS NULL AND julianday('now') - julianday(bt.due_date) > 0"
      );
      filtersApplied++;
    } else if (filters.isOverdue === false) {
      whereConditions.push(
        "bt.return_date IS NOT NULL OR julianday('now') - julianday(bt.due_date) <= 0"
      );
      filtersApplied++;
    }

    // Days overdue range
    if (filters.daysOverdueMin || filters.daysOverdueMax) {
      if (filters.daysOverdueMin && filters.daysOverdueMax) {
        whereConditions.push(
          "bt.return_date IS NULL AND julianday('now') - julianday(bt.due_date) BETWEEN ? AND ?"
        );
        params.push(filters.daysOverdueMin, filters.daysOverdueMax);
      } else if (filters.daysOverdueMin) {
        whereConditions.push(
          "bt.return_date IS NULL AND julianday('now') - julianday(bt.due_date) >= ?"
        );
        params.push(filters.daysOverdueMin);
      } else if (filters.daysOverdueMax) {
        whereConditions.push(
          "bt.return_date IS NULL AND julianday('now') - julianday(bt.due_date) <= ?"
        );
        params.push(filters.daysOverdueMax);
      }
      filtersApplied++;
    }

    // Add WHERE conditions
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    // Sorting
    const allowedSortFields = [
      'borrow_date',
      'due_date',
      'return_date',
      'member_name',
      'book_title',
      'book_author',
      'book_genre',
      'days_borrowed',
      'days_overdue',
      'late_fee_amount',
    ];

    if (allowedSortFields.includes(sortBy)) {
      query += ` ORDER BY ${sortBy} ${sortOrder}`;
    } else {
      query += ` ORDER BY borrow_date ${sortOrder}`;
    }

    // Pagination
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Execute queries
    const results = await databaseConnection.all(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM borrowing_transactions bt
      INNER JOIN members m ON bt.member_id = m.id
      INNER JOIN book_copies bc ON bt.book_copy_id = bc.id
      INNER JOIN books b ON bc.book_id = b.id
      LEFT JOIN late_fees lf ON bt.id = lf.transaction_id
    `;

    if (whereConditions.length > 0) {
      countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    const countParams = params.slice(0, params.length - 2);
    const countResult = await databaseConnection.getOne(
      countQuery,
      countParams
    );
    const totalCount = (countResult as unknown as { total: number }).total;

    const searchTime = Date.now() - startTime;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      results: results.map((row: unknown) => ({
        ...(row as Record<string, unknown>),
        is_overdue: Boolean((row as Record<string, unknown>).is_overdue),
        days_overdue: Math.max(
          Number((row as Record<string, unknown>).days_overdue) || 0,
          0
        ),
      })) as RentalSearchResult[],
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      searchMetadata: {
        searchTime,
        searchQuery: query,
        filtersApplied,
        fuzzyMatchUsed,
      },
    };
  }

  /**
   * Cross-entity search - search across books, members, and rentals simultaneously
   */
  async globalSearch(
    searchTerm: string,
    options: SearchOptions & {
      entities?: ('books' | 'members' | 'rentals')[];
    } = {}
  ) {
    const { entities = ['books', 'members', 'rentals'], limit = 10 } = options;
    const results: Record<string, unknown> = {};

    const searchPromises = [];

    // Search books
    if (entities.includes('books')) {
      searchPromises.push(
        this.searchBooks(
          {
            title: searchTerm,
            author: searchTerm,
            genre: searchTerm,
            fuzzyMatch: true,
          },
          { ...options, limit }
        ).then((result) => ({ books: result }))
      );
    }

    // Search members
    if (entities.includes('members')) {
      searchPromises.push(
        this.searchMembers(
          {
            name: searchTerm,
            email: searchTerm,
          },
          { ...options, limit }
        ).then((result) => ({ members: result }))
      );
    }

    // Search rentals
    if (entities.includes('rentals')) {
      searchPromises.push(
        this.searchRentals(
          {
            memberName: searchTerm,
            bookTitle: searchTerm,
          },
          { ...options, limit }
        ).then((result) => ({ rentals: result }))
      );
    }

    const searchResults = await Promise.all(searchPromises);
    searchResults.forEach((result) => Object.assign(results, result));

    return results;
  }

  /**
   * Get search suggestions based on partial input
   */
  async getSearchSuggestions(
    searchTerm: string,
    type: 'books' | 'members' | 'all' = 'all',
    limit = 10
  ): Promise<{ suggestions: string[]; type: string }[]> {
    const suggestions: { suggestions: string[]; type: string }[] = [];

    if (type === 'books' || type === 'all') {
      const bookQuery = `
        SELECT DISTINCT title as suggestion, 'book_title' as type FROM books 
        WHERE title LIKE ? 
        UNION
        SELECT DISTINCT author as suggestion, 'book_author' as type FROM books 
        WHERE author LIKE ?
        UNION  
        SELECT DISTINCT genre as suggestion, 'book_genre' as type FROM books 
        WHERE genre LIKE ?
        LIMIT ?
      `;

      const bookSuggestions = await databaseConnection.all(bookQuery, [
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        limit,
      ]);

      suggestions.push({
        suggestions: bookSuggestions.map(
          (s: unknown) => (s as Record<string, string>).suggestion
        ),
        type: 'books',
      });
    }

    if (type === 'members' || type === 'all') {
      const memberQuery = `
        SELECT DISTINCT name as suggestion, 'member_name' as type FROM members 
        WHERE name LIKE ? 
        UNION
        SELECT DISTINCT email as suggestion, 'member_email' as type FROM members 
        WHERE email LIKE ?
        LIMIT ?
      `;

      const memberSuggestions = await databaseConnection.all(memberQuery, [
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        limit,
      ]);

      suggestions.push({
        suggestions: memberSuggestions.map(
          (s: unknown) => (s as Record<string, string>).suggestion
        ),
        type: 'members',
      });
    }

    return suggestions;
  }
}

// Export singleton instance
export const searchFilterService = new SearchFilterService();
