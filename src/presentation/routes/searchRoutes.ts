import { Router } from 'express';
import { searchController } from '../controllers/SearchController.js';

/**
 * Task 9: Search Routes
 *
 * Defines REST API endpoints for advanced search and filtering functionality.
 * All routes are prefixed with /api/search
 */

const router = Router();

/**
 * Advanced book search with multiple filters and sorting options
 * GET /api/search/books
 *
 * Search books by title, author, genre, ISBN, publication year, language,
 * availability status, and popularity score with fuzzy matching support.
 */
router.get('/books', searchController.searchBooks.bind(searchController));

/**
 * Advanced member search with behavioral analytics
 * GET /api/search/members
 *
 * Search members by name, email, phone, status, activity level, risk level,
 * and registration date with overdue book filtering.
 */
router.get('/members', searchController.searchMembers.bind(searchController));

/**
 * Advanced rental transaction search
 * GET /api/search/rentals
 *
 * Search rental transactions by member, book, dates, status, and overdue criteria
 * with comprehensive filtering and analytics integration.
 */
router.get('/rentals', searchController.searchRentals.bind(searchController));

/**
 * Global search across all entities
 * GET /api/search/global
 *
 * Perform cross-entity search across books, members, and rentals
 * with unified result ranking and relevance scoring.
 */
router.get('/global', searchController.globalSearch.bind(searchController));

/**
 * Search suggestions for autocomplete
 * GET /api/search/suggestions
 *
 * Get intelligent search suggestions based on partial input
 * for books, members, or both entities.
 */
router.get(
  '/suggestions',
  searchController.getSearchSuggestions.bind(searchController)
);

/**
 * Available filter options
 * GET /api/search/filters
 *
 * Get metadata about available search filters, sort options,
 * and search capabilities for each entity type.
 */
router.get(
  '/filters',
  searchController.getFilterOptions.bind(searchController)
);

export default router;
