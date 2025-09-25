import type { Request, Response } from 'express';
import { rentalAnalyticsService } from '../../application/services/RentalAnalyticsService.js';

/**
 * Rental Controller
 * 
 * Provides REST API endpoints for book rental tracking and analytics.
 * Exposes the RentalAnalyticsService methods through HTTP endpoints.
 */

export class RentalController {
  
  /**
   * GET /api/rentals/books/:bookId/current-borrowers
   * Get all current borrowers for a specific book
   * Answers: "Who currently has Book X?"
   */
  async getCurrentBorrowersForBook(req: Request, res: Response): Promise<void> {
    try {
      const bookId = req.params.bookId;
      
      if (!bookId) {
        res.status(400).json({ error: 'Book ID is required' });
        return;
      }

      const currentBorrowers = await rentalAnalyticsService.getCurrentBorrowersForBook(bookId);
      
      res.json({
        book_id: bookId,
        current_borrowers: currentBorrowers,
        total_current_borrowers: currentBorrowers.length,
        has_overdue: currentBorrowers.some((borrower: any) => borrower.is_overdue)
      });
    } catch (error) {
      console.error('Error fetching current borrowers:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch current borrowers' });
      }
    }
  }

  /**
   * GET /api/rentals/books/:bookId/borrowers/all
   * Get all members who have ever borrowed a specific book
   * Answers: "Who has borrowed Book X?" (historical)
   */
  async getAllBorrowersForBook(req: Request, res: Response): Promise<void> {
    try {
      const bookId = req.params.bookId;
      
      if (!bookId) {
        res.status(400).json({ error: 'Book ID is required' });
        return;
      }

      const allBorrowers = await rentalAnalyticsService.getMembersByBookId(bookId);
      
      res.json({
        book_id: bookId,
        all_borrowers: allBorrowers,
        total_borrowers: allBorrowers.length,
        unique_borrowers: new Set(allBorrowers.map((b: any) => b.member_id)).size
      });
    } catch (error) {
      console.error('Error fetching all borrowers:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch borrowers' });
      }
    }
  }

  /**
   * GET /api/rentals/books/:bookId/summary
   * Get comprehensive borrowing summary for a book
   * Answers: "What's the complete status of Book X?"
   */
  async getBookBorrowingSummary(req: Request, res: Response): Promise<void> {
    try {
      const bookId = req.params.bookId;
      
      if (!bookId) {
        res.status(400).json({ error: 'Book ID is required' });
        return;
      }

      const summary = await rentalAnalyticsService.getCurrentBorrowerSummaryForBook(bookId);
      
      res.json(summary);
    } catch (error) {
      console.error('Error fetching book summary:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch book summary' });
      }
    }
  }

  /**
   * GET /api/rentals/members/:memberId/current-books
   * Get all books currently borrowed by a specific member
   * Answers: "What books does Member Y currently have?"
   */
  async getCurrentBooksByMember(req: Request, res: Response): Promise<void> {
    try {
      const memberId = req.params.memberId;
      
      // Handle both numeric ID and member_id format
      const memberIdNum = Number.parseInt(memberId, 10);
      const queryId = Number.isNaN(memberIdNum) ? memberId : memberIdNum.toString();

      const currentBooks = await rentalAnalyticsService.getCurrentBooksByMemberId(queryId);
      
      res.json({
        member_id: queryId,
        current_books: currentBooks,
        total_current_books: currentBooks.length,
        has_overdue: currentBooks.some((book: any) => book.is_overdue),
        overdue_books: currentBooks.filter((book: any) => book.is_overdue)
      });
    } catch (error) {
      console.error('Error fetching current books for member:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch current books for member' });
      }
    }
  }

  /**
   * GET /api/rentals/members/:memberId/books/all
   * Get all books ever borrowed by a specific member
   * Answers: "What books has Member Y borrowed?" (historical)
   */
  async getAllBooksByMember(req: Request, res: Response): Promise<void> {
    try {
      const memberId = req.params.memberId;
      
      // Handle both numeric ID and member_id format
      const memberIdNum = Number.parseInt(memberId, 10);
      const queryId = Number.isNaN(memberIdNum) ? memberId : memberIdNum.toString();

      const allBooks = await rentalAnalyticsService.getBooksByMemberId(queryId);
      
      res.json({
        member_id: queryId,
        all_books: allBooks,
        total_books_borrowed: allBooks.length,
        unique_books: new Set(allBooks.map((b: any) => b.id)).size,
        completed_rentals: allBooks.filter((b: any) => b.return_date !== null).length,
        active_rentals: allBooks.filter((b: any) => b.return_date === null).length
      });
    } catch (error) {
      console.error('Error fetching all books for member:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch books for member' });
      }
    }
  }

  /**
   * GET /api/rentals/active-summary
   * Get summary of all active rentals
   * Answers: "What's currently being borrowed?"
   */
  async getActiveSummary(_req: Request, res: Response): Promise<void> {
    try {
      const associations = await rentalAnalyticsService.getMemberBookAssociations({
        currentOnly: true,
        limit: 100
      });

      const overdueAssociations = associations.filter((a: any) => a.is_overdue);
      
      res.json({
        total_active_rentals: associations.length,
        overdue_rentals: overdueAssociations.length,
        active_associations: associations,
        overdue_associations: overdueAssociations
      });
    } catch (error) {
      console.error('Error fetching active summary:', error);
      res.status(500).json({ error: 'Failed to fetch active rental summary' });
    }
  }

  /**
   * GET /api/rentals/statistics
   * Get overall rental statistics
   * Answers: "What are the library rental patterns?"
   */
  async getRentalStatistics(_req: Request, res: Response): Promise<void> {
    try {
      const statistics = await rentalAnalyticsService.getRentalStatistics();
      res.json(statistics);
    } catch (error) {
      console.error('Error fetching rental statistics:', error);
      res.status(500).json({ error: 'Failed to fetch rental statistics' });
    }
  }

  /**
   * GET /api/rentals/associations
   * Get member-book associations with optional filtering
   * Supports query parameters: memberId, bookId, currentOnly, limit, offset
   */
  async getMemberBookAssociations(req: Request, res: Response): Promise<void> {
    try {
      const {
        memberId,
        bookId,
        currentOnly,
        limit,
        offset
      } = req.query;

      const options: any = {};
      
      if (memberId) options.memberId = memberId as string;
      if (bookId) options.bookId = bookId as string;
      if (currentOnly === 'true') options.currentOnly = true;
      if (limit) options.limit = Number.parseInt(limit as string, 10);
      if (offset) options.offset = Number.parseInt(offset as string, 10);

      const associations = await rentalAnalyticsService.getMemberBookAssociations(options);
      
      res.json({
        total_associations: associations.length,
        associations,
        filters_applied: options
      });
    } catch (error) {
      console.error('Error fetching member-book associations:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch associations' });
      }
    }
  }

  /**
   * GET /api/rentals/overdue
   * Get all overdue rentals
   * Answers: "What books are overdue and by whom?"
   */
  async getOverdueRentals(_req: Request, res: Response): Promise<void> {
    try {
      const associations = await rentalAnalyticsService.getMemberBookAssociations({
        currentOnly: true
      });

      const overdueRentals = associations.filter((a: any) => a.is_overdue);
      
      res.json({
        total_overdue: overdueRentals.length,
        overdue_rentals: overdueRentals
      });
    } catch (error) {
      console.error('Error fetching overdue rentals:', error);
      res.status(500).json({ error: 'Failed to fetch overdue rentals' });
    }
  }
}

export const rentalController = new RentalController();