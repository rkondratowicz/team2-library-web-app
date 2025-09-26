import type { Request, Response } from 'express';
import {
  type BookSearchFilters,
  type MemberSearchFilters,
  type RentalSearchFilters,
  type SearchOptions,
  searchFilterService,
} from '../../application/services/SearchFilterService.js';

/**
 * Task 9: Search Controller
 *
 * Provides REST API endpoints for advanced search and filtering capabilities
 * across books, members, and rental transactions.
 *
 * Endpoints:
 * - GET /api/search/books - Advanced book search with filters
 * - GET /api/search/members - Advanced member search with filters
 * - GET /api/search/rentals - Advanced rental transaction search
 * - GET /api/search/global - Cross-entity global search
 * - GET /api/search/suggestions - Search autocomplete suggestions
 * - GET /api/search/filters - Get available filter options
 */

class SearchController {
  /**
   * Advanced book search with multiple criteria
   * GET /api/search/books
   *
   * Query parameters:
   * - title, author, genre, isbn, publicationYear, language
   * - publicationYearFrom, publicationYearTo
   * - availabilityStatus, minPopularityScore
   * - fuzzyMatch (boolean)
   * - sortBy, sortOrder, page, limit, includeAnalytics
   */
  async searchBooks(req: Request, res: Response): Promise<void> {
    try {
      const {
        title,
        author,
        genre,
        isbn,
        publicationYear,
        publicationYearFrom,
        publicationYearTo,
        language,
        availabilityStatus,
        minPopularityScore,
        fuzzyMatch,
        sortBy,
        sortOrder,
        page,
        limit,
        includeAnalytics,
      } = req.query;

      const filters: BookSearchFilters = {};
      const options: SearchOptions = {};

      // Build filters object
      if (title) filters.title = title as string;
      if (author) filters.author = author as string;
      if (genre) filters.genre = genre as string;
      if (isbn) filters.isbn = isbn as string;
      if (language) filters.language = language as string;
      if (availabilityStatus)
        filters.availabilityStatus = availabilityStatus as
          | 'available'
          | 'borrowed'
          | 'all';

      if (publicationYear) filters.publicationYear = Number(publicationYear);
      if (publicationYearFrom)
        filters.publicationYearFrom = Number(publicationYearFrom);
      if (publicationYearTo)
        filters.publicationYearTo = Number(publicationYearTo);
      if (minPopularityScore)
        filters.minPopularityScore = Number(minPopularityScore);

      if (fuzzyMatch !== undefined) filters.fuzzyMatch = fuzzyMatch === 'true';

      // Build options object
      if (sortBy) options.sortBy = sortBy as string;
      if (sortOrder) options.sortOrder = sortOrder as 'ASC' | 'DESC';
      if (page) options.page = Number(page);
      if (limit) options.limit = Number(limit);
      if (includeAnalytics !== undefined)
        options.includeAnalytics = includeAnalytics === 'true';

      const results = await searchFilterService.searchBooks(filters, options);

      res.json({
        success: true,
        message: 'Book search completed successfully',
        data: results,
      });
    } catch (error) {
      console.error('Book search error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search books',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Advanced member search with behavioral filters
   * GET /api/search/members
   *
   * Query parameters:
   * - name, email, phone, status, membershipType
   * - registrationDateFrom, registrationDateTo
   * - activityLevel, riskLevel, hasOverdueBooks
   * - sortBy, sortOrder, page, limit, includeAnalytics
   */
  async searchMembers(req: Request, res: Response): Promise<void> {
    try {
      const {
        name,
        email,
        phone,
        status,
        registrationDateFrom,
        registrationDateTo,
        activityLevel,
        riskLevel,
        membershipType,
        hasOverdueBooks,
        sortBy,
        sortOrder,
        page,
        limit,
        includeAnalytics,
      } = req.query;

      const filters: MemberSearchFilters = {};
      const options: SearchOptions = {};

      // Build filters object
      if (name) filters.name = name as string;
      if (email) filters.email = email as string;
      if (phone) filters.phone = phone as string;
      if (membershipType) filters.membershipType = membershipType as string;

      if (status)
        filters.status = status as 'active' | 'suspended' | 'pending' | 'all';
      if (activityLevel)
        filters.activityLevel = activityLevel as
          | 'high'
          | 'medium'
          | 'low'
          | 'inactive'
          | 'all';
      if (riskLevel)
        filters.riskLevel = riskLevel as 'low' | 'medium' | 'high' | 'all';

      if (registrationDateFrom)
        filters.registrationDateFrom = registrationDateFrom as string;
      if (registrationDateTo)
        filters.registrationDateTo = registrationDateTo as string;

      if (hasOverdueBooks !== undefined)
        filters.hasOverdueBooks = hasOverdueBooks === 'true';

      // Build options object
      if (sortBy) options.sortBy = sortBy as string;
      if (sortOrder) options.sortOrder = sortOrder as 'ASC' | 'DESC';
      if (page) options.page = Number(page);
      if (limit) options.limit = Number(limit);
      if (includeAnalytics !== undefined)
        options.includeAnalytics = includeAnalytics === 'true';

      const results = await searchFilterService.searchMembers(filters, options);

      res.json({
        success: true,
        message: 'Member search completed successfully',
        data: results,
      });
    } catch (error) {
      console.error('Member search error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search members',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Advanced rental transaction search
   * GET /api/search/rentals
   *
   * Query parameters:
   * - memberId, bookId, memberName, bookTitle
   * - borrowDateFrom, borrowDateTo, dueDateFrom, dueDateTo
   * - returnDateFrom, returnDateTo, transactionStatus
   * - isOverdue, daysOverdueMin, daysOverdueMax
   * - sortBy, sortOrder, page, limit, includeAnalytics
   */
  async searchRentals(req: Request, res: Response): Promise<void> {
    try {
      const {
        memberId,
        bookId,
        memberName,
        bookTitle,
        borrowDateFrom,
        borrowDateTo,
        dueDateFrom,
        dueDateTo,
        returnDateFrom,
        returnDateTo,
        transactionStatus,
        isOverdue,
        daysOverdueMin,
        daysOverdueMax,
        sortBy,
        sortOrder,
        page,
        limit,
        includeAnalytics,
      } = req.query;

      const filters: RentalSearchFilters = {};
      const options: SearchOptions = {};

      // Build filters object
      if (memberId) filters.memberId = memberId as string;
      if (bookId) filters.bookId = bookId as string;
      if (memberName) filters.memberName = memberName as string;
      if (bookTitle) filters.bookTitle = bookTitle as string;

      if (borrowDateFrom) filters.borrowDateFrom = borrowDateFrom as string;
      if (borrowDateTo) filters.borrowDateTo = borrowDateTo as string;
      if (dueDateFrom) filters.dueDateFrom = dueDateFrom as string;
      if (dueDateTo) filters.dueDateTo = dueDateTo as string;
      if (returnDateFrom) filters.returnDateFrom = returnDateFrom as string;
      if (returnDateTo) filters.returnDateTo = returnDateTo as string;

      if (transactionStatus)
        filters.transactionStatus = transactionStatus as
          | 'active'
          | 'returned'
          | 'overdue'
          | 'all';
      if (isOverdue !== undefined) filters.isOverdue = isOverdue === 'true';

      if (daysOverdueMin) filters.daysOverdueMin = Number(daysOverdueMin);
      if (daysOverdueMax) filters.daysOverdueMax = Number(daysOverdueMax);

      // Build options object
      if (sortBy) options.sortBy = sortBy as string;
      if (sortOrder) options.sortOrder = sortOrder as 'ASC' | 'DESC';
      if (page) options.page = Number(page);
      if (limit) options.limit = Number(limit);
      if (includeAnalytics !== undefined)
        options.includeAnalytics = includeAnalytics === 'true';

      const results = await searchFilterService.searchRentals(filters, options);

      res.json({
        success: true,
        message: 'Rental search completed successfully',
        data: results,
      });
    } catch (error) {
      console.error('Rental search error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search rentals',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Global search across all entities
   * GET /api/search/global
   *
   * Query parameters:
   * - q (search term) - required
   * - entities (comma-separated: books,members,rentals)
   * - sortBy, sortOrder, limit
   */
  async globalSearch(req: Request, res: Response): Promise<void> {
    try {
      const { q: searchTerm, entities, sortBy, sortOrder, limit } = req.query;

      if (!searchTerm) {
        res.status(400).json({
          success: false,
          message: 'Search term (q) is required',
        });
        return;
      }

      const options: SearchOptions & {
        entities?: ('books' | 'members' | 'rentals')[];
      } = {};

      if (entities) {
        options.entities = (entities as string)
          .split(',')
          .map((e) => e.trim()) as ('books' | 'members' | 'rentals')[];
      }

      if (sortBy) options.sortBy = sortBy as string;
      if (sortOrder) options.sortOrder = sortOrder as 'ASC' | 'DESC';
      if (limit) options.limit = Number(limit);

      const results = await searchFilterService.globalSearch(
        searchTerm as string,
        options
      );

      res.json({
        success: true,
        message: 'Global search completed successfully',
        data: results,
      });
    } catch (error) {
      console.error('Global search error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform global search',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get search suggestions for autocomplete
   * GET /api/search/suggestions
   *
   * Query parameters:
   * - q (search term) - required
   * - type (books|members|all) - default: all
   * - limit - default: 10
   */
  async getSearchSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { q: searchTerm, type = 'all', limit = '10' } = req.query;

      if (!searchTerm) {
        res.status(400).json({
          success: false,
          message: 'Search term (q) is required',
        });
        return;
      }

      const suggestions = await searchFilterService.getSearchSuggestions(
        searchTerm as string,
        type as 'books' | 'members' | 'all',
        Number(limit)
      );

      res.json({
        success: true,
        message: 'Search suggestions retrieved successfully',
        data: suggestions,
      });
    } catch (error) {
      console.error('Search suggestions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get search suggestions',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get available filter options for each search type
   * GET /api/search/filters
   *
   * Query parameters:
   * - type (books|members|rentals|all) - default: all
   */
  async getFilterOptions(req: Request, res: Response): Promise<void> {
    try {
      const { type = 'all' } = req.query;

      const filterOptions: Record<string, unknown> = {};

      if (type === 'books' || type === 'all') {
        filterOptions.books = {
          availabilityStatus: ['available', 'borrowed', 'all'],
          sortOptions: [
            'title',
            'author',
            'genre',
            'publication_year',
            'total_borrows',
            'available_copies',
            'avg_rating',
            'last_borrowed_date',
          ],
          fuzzyMatchSupported: true,
          numericFilters: [
            'publicationYear',
            'publicationYearFrom',
            'publicationYearTo',
            'minPopularityScore',
          ],
        };
      }

      if (type === 'members' || type === 'all') {
        filterOptions.members = {
          status: ['active', 'suspended', 'pending', 'all'],
          activityLevel: ['high', 'medium', 'low', 'inactive', 'all'],
          riskLevel: ['low', 'medium', 'high', 'all'],
          sortOptions: [
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
          ],
          booleanFilters: ['hasOverdueBooks'],
          dateFilters: ['registrationDateFrom', 'registrationDateTo'],
        };
      }

      if (type === 'rentals' || type === 'all') {
        filterOptions.rentals = {
          transactionStatus: ['active', 'returned', 'overdue', 'all'],
          sortOptions: [
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
          ],
          booleanFilters: ['isOverdue'],
          dateFilters: [
            'borrowDateFrom',
            'borrowDateTo',
            'dueDateFrom',
            'dueDateTo',
            'returnDateFrom',
            'returnDateTo',
          ],
          numericFilters: ['daysOverdueMin', 'daysOverdueMax'],
        };
      }

      const commonOptions = {
        sortOrder: ['ASC', 'DESC'],
        paginationDefaults: {
          page: 1,
          limit: 20,
          maxLimit: 100,
        },
        includeAnalytics: true,
      };

      res.json({
        success: true,
        message: 'Filter options retrieved successfully',
        data: {
          ...filterOptions,
          common: commonOptions,
        },
      });
    } catch (error) {
      console.error('Filter options error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get filter options',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

// Export singleton instance
export const searchController = new SearchController();
