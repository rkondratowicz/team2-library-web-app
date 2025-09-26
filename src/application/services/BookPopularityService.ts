import { databaseConnection } from '../../data-access/DatabaseConnection.js';

/**
 * Book Popularity Service
 *
 * Analyzes book popularity and provides insights into:
 * - Which books are most/least popular based on borrowing frequency
 * - Popularity trends over time periods
 * - Book recommendation analytics
 * - Genre popularity analysis
 * - Seasonal borrowing patterns
 */

// Interfaces for book popularity analytics
export interface BookPopularityRecord {
  book_id: number;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  publication_year: number;
  total_borrows: number;
  unique_borrowers: number;
  current_active_borrows: number;
  average_borrow_duration: number;
  popularity_score: number; // Calculated metric
  last_borrowed_date: string | null;
  first_borrowed_date: string | null;
  times_overdue: number;
  overdue_rate: number; // Percentage
  availability_rate: number; // How often it's available vs borrowed
}

export interface GenrePopularityRecord {
  genre: string;
  total_books: number;
  total_borrows: number;
  unique_borrowers: number;
  average_borrows_per_book: number;
  most_popular_book: string;
  most_popular_book_borrows: number;
  popularity_rank: number;
}

export interface PopularityTrend {
  period: string;
  period_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  book_id: number;
  title: string;
  author: string;
  borrows_in_period: number;
  unique_borrowers_in_period: number;
  popularity_score_for_period: number;
}

export interface BookRecommendation {
  recommended_book_id: number;
  title: string;
  author: string;
  genre: string;
  similarity_score: number;
  recommendation_reason: string;
  shared_borrowers: number;
  popularity_score: number;
}

export interface PopularityFilters {
  genre?: string;
  minBorrows?: number;
  maxBorrows?: number;
  publicationYearFrom?: number;
  publicationYearTo?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  sortBy?:
    | 'popularity_score'
    | 'total_borrows'
    | 'unique_borrowers'
    | 'title'
    | 'last_borrowed_date';
  sortOrder?: 'ASC' | 'DESC';
}

export class BookPopularityService {
  /**
   * Get most popular books based on borrowing frequency and engagement
   */
  async getMostPopularBooks(
    filters?: PopularityFilters
  ): Promise<BookPopularityRecord[]> {
    const query = `
      SELECT 
        b.id as book_id,
        b.title,
        b.author,
        b.isbn,
        b.genre,
        b.publication_year,
        COALESCE(COUNT(bt.id), 0) as total_borrows,
        COALESCE(COUNT(DISTINCT bt.member_id), 0) as unique_borrowers,
        COALESCE(COUNT(CASE WHEN bt.status = 'Active' THEN 1 END), 0) as current_active_borrows,
        COALESCE(AVG(
          CASE 
            WHEN bt.return_date IS NOT NULL 
            THEN julianday(bt.return_date) - julianday(bt.borrow_date)
            ELSE julianday('now') - julianday(bt.borrow_date)
          END
        ), 0) as average_borrow_duration,
        
        -- Popularity score calculation (combines frequency, recency, and diversity)
        CASE 
          WHEN COUNT(bt.id) = 0 THEN 0
          ELSE (
            -- Base score from total borrows (40% weight)
            (COALESCE(COUNT(bt.id), 0) * 0.4) +
            -- Unique borrowers bonus (30% weight) - more diverse = more popular  
            (COALESCE(COUNT(DISTINCT bt.member_id), 0) * 0.3) +
            -- Recency bonus (30% weight) - recently borrowed = more relevant
            (CASE 
              WHEN MAX(bt.borrow_date) IS NULL THEN 0
              WHEN julianday('now') - julianday(MAX(bt.borrow_date)) <= 30 THEN 0.3
              WHEN julianday('now') - julianday(MAX(bt.borrow_date)) <= 90 THEN 0.2  
              WHEN julianday('now') - julianday(MAX(bt.borrow_date)) <= 180 THEN 0.1
              ELSE 0
            END)
          )
        END as popularity_score,
        
        MAX(bt.borrow_date) as last_borrowed_date,
        MIN(bt.borrow_date) as first_borrowed_date,
        
        COALESCE(COUNT(CASE 
          WHEN bt.return_date IS NULL AND bt.due_date < datetime('now') THEN 1
          WHEN bt.return_date IS NOT NULL AND bt.return_date > bt.due_date THEN 1
        END), 0) as times_overdue,
        
        CASE 
          WHEN COUNT(bt.id) = 0 THEN 0
          ELSE (COALESCE(COUNT(CASE 
            WHEN bt.return_date IS NULL AND bt.due_date < datetime('now') THEN 1
            WHEN bt.return_date IS NOT NULL AND bt.return_date > bt.due_date THEN 1
          END), 0) * 100.0 / COUNT(bt.id))
        END as overdue_rate,
        
        -- Availability rate: how often book is available vs borrowed
        CASE 
          WHEN COUNT(bt.id) = 0 THEN 100.0
          ELSE (
            100.0 - (COUNT(CASE WHEN bt.status = 'Active' THEN 1 END) * 100.0 / 
            (SELECT COUNT(*) FROM book_copies WHERE book_id = b.id))
          )
        END as availability_rate
        
      FROM books b
      LEFT JOIN book_copies bc ON b.id = bc.book_id
      LEFT JOIN borrowing_transactions bt ON bc.id = bt.book_copy_id
      WHERE 1=1
    `;

    const whereConditions: string[] = [];
    const params: (string | number)[] = [];

    if (filters) {
      if (filters.genre) {
        whereConditions.push('b.genre = ?');
        params.push(filters.genre);
      }

      if (filters.publicationYearFrom) {
        whereConditions.push('b.publication_year >= ?');
        params.push(filters.publicationYearFrom);
      }

      if (filters.publicationYearTo) {
        whereConditions.push('b.publication_year <= ?');
        params.push(filters.publicationYearTo);
      }

      if (filters.startDate && filters.endDate) {
        whereConditions.push('bt.borrow_date BETWEEN ? AND ?');
        params.push(filters.startDate, filters.endDate);
      }
    }

    let finalQuery = query;
    if (whereConditions.length > 0) {
      finalQuery += ` AND ${whereConditions.join(' AND ')}`;
    }

    finalQuery +=
      ' GROUP BY b.id, b.title, b.author, b.isbn, b.genre, b.publication_year';

    // Apply post-aggregation filters
    const havingConditions: string[] = [];
    if (filters?.minBorrows) {
      havingConditions.push('COUNT(bt.id) >= ?');
      params.push(filters.minBorrows);
    }

    if (filters?.maxBorrows) {
      havingConditions.push('COUNT(bt.id) <= ?');
      params.push(filters.maxBorrows);
    }

    if (havingConditions.length > 0) {
      finalQuery += ` HAVING ${havingConditions.join(' AND ')}`;
    }

    // Sorting
    const sortBy = filters?.sortBy || 'popularity_score';
    const sortOrder = filters?.sortOrder || 'DESC';

    const sortColumn =
      {
        popularity_score: 'popularity_score',
        total_borrows: 'total_borrows',
        unique_borrowers: 'unique_borrowers',
        title: 'b.title',
        last_borrowed_date: 'last_borrowed_date',
      }[sortBy] || 'popularity_score';

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
    )) as BookPopularityRecord[];
  }

  /**
   * Get least popular books (books that are rarely borrowed)
   */
  async getLeastPopularBooks(
    filters?: PopularityFilters
  ): Promise<BookPopularityRecord[]> {
    // Use the same query but with ASC order by default
    const modifiedFilters = {
      ...filters,
      sortBy: filters?.sortBy || 'popularity_score',
      sortOrder: 'ASC' as const,
    };

    return this.getMostPopularBooks(modifiedFilters);
  }

  /**
   * Get books that have never been borrowed
   */
  async getNeverBorrowedBooks(): Promise<BookPopularityRecord[]> {
    const query = `
      SELECT 
        b.id as book_id,
        b.title,
        b.author,
        b.isbn,
        b.genre,
        b.publication_year,
        0 as total_borrows,
        0 as unique_borrowers,
        0 as current_active_borrows,
        0 as average_borrow_duration,
        0 as popularity_score,
        NULL as last_borrowed_date,
        NULL as first_borrowed_date,
        0 as times_overdue,
        0 as overdue_rate,
        100.0 as availability_rate
      FROM books b
      LEFT JOIN book_copies bc ON b.id = bc.book_id
      LEFT JOIN borrowing_transactions bt ON bc.id = bt.book_copy_id
      WHERE bt.id IS NULL
      GROUP BY b.id, b.title, b.author, b.isbn, b.genre, b.publication_year
      ORDER BY b.title ASC
    `;

    return (await databaseConnection.all(query, [])) as BookPopularityRecord[];
  }

  /**
   * Get genre popularity rankings
   */
  async getGenrePopularity(): Promise<GenrePopularityRecord[]> {
    const query = `
      WITH genre_stats AS (
        SELECT 
          b.genre,
          COUNT(DISTINCT b.id) as total_books,
          COALESCE(COUNT(bt.id), 0) as total_borrows,
          COALESCE(COUNT(DISTINCT bt.member_id), 0) as unique_borrowers,
          CASE 
            WHEN COUNT(DISTINCT b.id) = 0 THEN 0
            ELSE COALESCE(COUNT(bt.id), 0) * 1.0 / COUNT(DISTINCT b.id)
          END as average_borrows_per_book
        FROM books b
        LEFT JOIN book_copies bc ON b.id = bc.book_id
        LEFT JOIN borrowing_transactions bt ON bc.id = bt.book_copy_id
        GROUP BY b.genre
      ),
      genre_top_books AS (
        SELECT DISTINCT
          b.genre,
          first_value(b.title) OVER (PARTITION BY b.genre ORDER BY COUNT(bt.id) DESC, b.title) as most_popular_book,
          first_value(COUNT(bt.id)) OVER (PARTITION BY b.genre ORDER BY COUNT(bt.id) DESC, b.title) as most_popular_book_borrows
        FROM books b
        LEFT JOIN book_copies bc ON b.id = bc.book_id
        LEFT JOIN borrowing_transactions bt ON bc.id = bt.book_copy_id
        GROUP BY b.id, b.genre, b.title
      )
      SELECT 
        gs.genre,
        gs.total_books,
        gs.total_borrows,
        gs.unique_borrowers,
        gs.average_borrows_per_book,
        gtb.most_popular_book,
        gtb.most_popular_book_borrows,
        ROW_NUMBER() OVER (ORDER BY gs.total_borrows DESC, gs.average_borrows_per_book DESC) as popularity_rank
      FROM genre_stats gs
      LEFT JOIN genre_top_books gtb ON gs.genre = gtb.genre
      ORDER BY gs.total_borrows DESC, gs.average_borrows_per_book DESC
    `;

    return (await databaseConnection.all(query, [])) as GenrePopularityRecord[];
  }

  /**
   * Get popularity trends for a specific book over time
   */
  async getBookPopularityTrends(
    bookId: number,
    startDate: string,
    endDate: string,
    periodType: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'
  ): Promise<PopularityTrend[]> {
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
        b.id as book_id,
        b.title,
        b.author,
        COUNT(bt.id) as borrows_in_period,
        COUNT(DISTINCT bt.member_id) as unique_borrowers_in_period,
        
        -- Period popularity score
        (COUNT(bt.id) * 0.7 + COUNT(DISTINCT bt.member_id) * 0.3) as popularity_score_for_period
        
      FROM books b
      JOIN book_copies bc ON b.id = bc.book_id
      JOIN borrowing_transactions bt ON bc.id = bt.book_copy_id
      WHERE b.id = ? AND bt.borrow_date BETWEEN ? AND ?
      GROUP BY strftime('${dateFormat}', bt.borrow_date), b.id, b.title, b.author
      ORDER BY period ASC
    `;

    return (await databaseConnection.all(query, [
      bookId,
      startDate,
      endDate,
    ])) as PopularityTrend[];
  }

  /**
   * Get book recommendations based on borrowing patterns
   */
  async getBookRecommendations(
    bookId: number,
    limit: number = 10
  ): Promise<BookRecommendation[]> {
    const query = `
      WITH book_borrowers AS (
        -- Get all members who borrowed the target book
        SELECT DISTINCT bt.member_id
        FROM borrowing_transactions bt
        JOIN book_copies bc ON bt.book_copy_id = bc.id
        WHERE bc.book_id = ?
      ),
      similar_books AS (
        -- Find books borrowed by the same members
        SELECT 
          b.id as recommended_book_id,
          b.title,
          b.author,
          b.genre,
          COUNT(DISTINCT bt.member_id) as shared_borrowers,
          COUNT(bt.id) as total_borrows_of_recommended
        FROM books b
        JOIN book_copies bc ON b.id = bc.book_id
        JOIN borrowing_transactions bt ON bc.id = bt.book_copy_id
        WHERE bt.member_id IN (SELECT member_id FROM book_borrowers)
        AND b.id != ?  -- Exclude the original book
        GROUP BY b.id, b.title, b.author, b.genre
      ),
      book_popularity AS (
        -- Get popularity scores for recommended books
        SELECT 
          b.id,
          (COUNT(bt.id) * 0.4 + COUNT(DISTINCT bt.member_id) * 0.6) as popularity_score
        FROM books b
        LEFT JOIN book_copies bc ON b.id = bc.book_id
        LEFT JOIN borrowing_transactions bt ON bc.id = bt.book_copy_id
        GROUP BY b.id
      )
      SELECT 
        sb.recommended_book_id,
        sb.title,
        sb.author,
        sb.genre,
        -- Similarity score based on shared borrowers and genre match
        (
          (sb.shared_borrowers * 10.0 / (SELECT COUNT(*) FROM book_borrowers)) +
          (CASE WHEN sb.genre = (SELECT genre FROM books WHERE id = ?) THEN 20 ELSE 0 END) +
          COALESCE(bp.popularity_score * 0.1, 0)
        ) as similarity_score,
        
        CASE
          WHEN sb.shared_borrowers >= 5 THEN 'Frequently borrowed by similar readers'
          WHEN sb.genre = (SELECT genre FROM books WHERE id = ?) THEN 'Same genre preference'
          ELSE 'Popular among readers with similar taste'
        END as recommendation_reason,
        
        sb.shared_borrowers,
        COALESCE(bp.popularity_score, 0) as popularity_score
        
      FROM similar_books sb
      LEFT JOIN book_popularity bp ON sb.recommended_book_id = bp.id
      WHERE sb.shared_borrowers > 0
      ORDER BY similarity_score DESC
      LIMIT ?
    `;

    return (await databaseConnection.all(query, [
      bookId,
      bookId,
      bookId,
      bookId,
      limit,
    ])) as BookRecommendation[];
  }

  /**
   * Get trending books (recently popular)
   */
  async getTrendingBooks(
    daysBack: number = 30,
    limit: number = 20
  ): Promise<BookPopularityRecord[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    const startDateString = startDate.toISOString().split('T')[0];

    const filters: PopularityFilters = {
      startDate: startDateString,
      endDate: new Date().toISOString().split('T')[0],
      limit,
      sortBy: 'popularity_score',
      sortOrder: 'DESC',
      minBorrows: 1, // Only include books that have been borrowed
    };

    return this.getMostPopularBooks(filters);
  }
}

// Export singleton instance
export const bookPopularityService = new BookPopularityService();
