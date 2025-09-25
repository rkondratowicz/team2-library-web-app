import type { Request, Response } from 'express';
import { transactionRepository } from '../../data-access/repositories/TransactionRepository.js';
import { memberRepository } from '../../data-access/repositories/MemberRepository.js';
import { bookRepository } from '../../data-access/repositories/BookRepository.js';

export class RentalController {
  // Get current borrowers for a specific book
  async getCurrentBorrowersForBook(req: Request, res: Response): Promise<void> {
    try {
      const bookId = req.params.bookId;
      
      if (!bookId) {
        res.status(400).json({ error: 'Book ID is required' });
        return;
      }

      // Get all active transactions and filter by book
      const allActive = await transactionRepository.getAllActiveTransactions();
      const currentBorrowings = allActive.filter((t: any) => t.book_id === bookId);
      
      res.json({
        bookId,
        currentBorrowers: currentBorrowings,
        count: currentBorrowings.length
      });
    } catch (error) {
      console.error('Error getting current borrowers for book:', error);
      res.status(500).json({ error: 'Failed to get current borrowers' });
    }
  }

  // Get all borrowers (current and past) for a specific book
  async getAllBorrowersForBook(req: Request, res: Response): Promise<void> {
    try {
      const bookId = req.params.bookId;
      
      if (!bookId) {
        res.status(400).json({ error: 'Book ID is required' });
        return;
      }

      // For now, just return active borrowings. This would need a new repository method for full history
      const allActive = await transactionRepository.getAllActiveTransactions();
      const allBorrowings = allActive.filter((t: any) => t.book_id === bookId);
      
      res.json({
        bookId,
        allBorrowers: allBorrowings,
        count: allBorrowings.length
      });
    } catch (error) {
      console.error('Error getting all borrowers for book:', error);
      res.status(500).json({ error: 'Failed to get borrowing history' });
    }
  }

  // Get borrowing summary for a specific book
  async getBookBorrowingSummary(req: Request, res: Response): Promise<void> {
    try {
      const bookId = req.params.bookId;
      
      if (!bookId) {
        res.status(400).json({ error: 'Book ID is required' });
        return;
      }

      const book = await bookRepository.getBookById(bookId);
      if (!book) {
        res.status(404).json({ error: 'Book not found' });
        return;
      }

      const copies = await bookRepository.getCopiesForBook(bookId);
      const allActive = await transactionRepository.getAllActiveTransactions();
      const currentBorrowings = allActive.filter((t: any) => t.book_id === bookId);
      const allBorrowings = currentBorrowings; // For now, same as current
      
      res.json({
        book,
        totalCopies: copies.length,
        currentlyBorrowed: currentBorrowings.length,
        availableCopies: copies.length - currentBorrowings.length,
        totalBorrowings: allBorrowings.length,
        currentBorrowings,
        borrowingHistory: allBorrowings
      });
    } catch (error) {
      console.error('Error getting book borrowing summary:', error);
      res.status(500).json({ error: 'Failed to get book borrowing summary' });
    }
  }

  // Get current books borrowed by a specific member
  async getCurrentBooksByMember(req: Request, res: Response): Promise<void> {
    try {
      const memberId = req.params.memberId;
      
      if (!memberId) {
        res.status(400).json({ error: 'Member ID is required' });
        return;
      }

      const currentBorrowings = await transactionRepository.getActiveBorrowingsByMember(memberId);
      
      res.json({
        memberId,
        currentBooks: currentBorrowings,
        count: currentBorrowings.length
      });
    } catch (error) {
      console.error('Error getting current books by member:', error);
      res.status(500).json({ error: 'Failed to get current books' });
    }
  }

  // Get all books (current and past) borrowed by a specific member
  async getAllBooksByMember(req: Request, res: Response): Promise<void> {
    try {
      const memberId = req.params.memberId;
      
      if (!memberId) {
        res.status(400).json({ error: 'Member ID is required' });
        return;
      }

      const allBorrowings = await transactionRepository.getAllBorrowingsByMember(memberId);
      
      res.json({
        memberId,
        allBooks: allBorrowings,
        count: allBorrowings.length
      });
    } catch (error) {
      console.error('Error getting all books by member:', error);
      res.status(500).json({ error: 'Failed to get borrowing history' });
    }
  }

  // Get active borrowing summary
  async getActiveSummary(req: Request, res: Response): Promise<void> {
    try {
      const activeTransactions = await transactionRepository.getAllActiveTransactions();
      const overdueTransactions = await transactionRepository.getOverdueTransactions();
      
      // Group by member
      const memberSummary = activeTransactions.reduce((acc: any, transaction: any) => {
        if (!acc[transaction.member_id]) {
          acc[transaction.member_id] = {
            memberId: transaction.member_id,
            memberName: transaction.member_name,
            activeBooks: [],
            count: 0
          };
        }
        acc[transaction.member_id].activeBooks.push(transaction);
        acc[transaction.member_id].count++;
        return acc;
      }, {});

      res.json({
        totalActiveTransactions: activeTransactions.length,
        totalOverdueTransactions: overdueTransactions.length,
        memberSummary: Object.values(memberSummary),
        overdueTransactions
      });
    } catch (error) {
      console.error('Error getting active summary:', error);
      res.status(500).json({ error: 'Failed to get active summary' });
    }
  }

  // Get rental statistics
  async getRentalStatistics(req: Request, res: Response): Promise<void> {
    try {
      // Create basic stats from active transactions
      const activeTransactions = await transactionRepository.getAllActiveTransactions();
      const overdueTransactions = await transactionRepository.getOverdueTransactions();
      const stats = {
        totalActive: activeTransactions.length,
        totalOverdue: overdueTransactions.length,
        totalMembers: new Set(activeTransactions.map((t: any) => t.member_id)).size,
        totalBooks: new Set(activeTransactions.map((t: any) => t.book_id)).size
      };
      
      res.json({
        statistics: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting rental statistics:', error);
      res.status(500).json({ error: 'Failed to get rental statistics' });
    }
  }

  // Get member-book associations (for analytics)
  async getMemberBookAssociations(req: Request, res: Response): Promise<void> {
    try {
      const allTransactions = await transactionRepository.getAllActiveTransactions();
      
      // Create associations map
      const associations = allTransactions.reduce((acc: any, transaction: any) => {
        const key = `${transaction.member_id}-${transaction.book_id}`;
        if (!acc[key]) {
          acc[key] = {
            memberId: transaction.member_id,
            memberName: transaction.member_name,
            bookId: transaction.book_id,
            bookTitle: transaction.book_title,
            borrowCount: 0,
            lastBorrowed: null
          };
        }
        acc[key].borrowCount++;
        if (!acc[key].lastBorrowed || new Date(transaction.borrow_date) > new Date(acc[key].lastBorrowed)) {
          acc[key].lastBorrowed = transaction.borrow_date;
        }
        return acc;
      }, {});

      res.json({
        associations: Object.values(associations),
        totalAssociations: Object.keys(associations).length
      });
    } catch (error) {
      console.error('Error getting member-book associations:', error);
      res.status(500).json({ error: 'Failed to get associations' });
    }
  }

  // Get overdue rentals
  async getOverdueRentals(req: Request, res: Response): Promise<void> {
    try {
      const overdueTransactions = await transactionRepository.getOverdueTransactions();
      
      res.json({
        overdueRentals: overdueTransactions,
        count: overdueTransactions.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting overdue rentals:', error);
      res.status(500).json({ error: 'Failed to get overdue rentals' });
    }
  }
}

export const rentalController = new RentalController();