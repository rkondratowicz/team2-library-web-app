import type { Request, Response } from 'express';
import { transactionService } from '../../application/services/TransactionService.js';

export class TransactionController {
  // Borrow a book
  async borrowBook(req: Request, res: Response): Promise<void> {
    try {
      const { book_copy_id, member_id, loan_period_days, notes } = req.body;

      if (!book_copy_id || !member_id) {
        res.status(400).json({
          error:
            'Missing required fields: book_copy_id and member_id are required',
        });
        return;
      }

      const transaction = await transactionService.borrowBook({
        book_copy_id,
        member_id,
        loan_period_days,
        notes,
      });

      res.status(201).json({
        message: 'Book borrowed successfully',
        transaction,
      });
    } catch (error) {
      console.error('Error borrowing book:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to borrow book' });
      }
    }
  }

  // Return a book
  async returnBook(req: Request, res: Response): Promise<void> {
    try {
      const transactionId = req.params.transactionId;
      const { return_notes } = req.body;

      if (!transactionId) {
        res.status(400).json({ error: 'Transaction ID is required' });
        return;
      }

      const transaction = await transactionService.returnBook(
        transactionId,
        return_notes
      );

      res.json({
        message: 'Book returned successfully',
        transaction,
      });
    } catch (error) {
      console.error('Error returning book:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to return book' });
      }
    }
  }

  // Get member's borrowing summary
  async getMemberBorrowingSummary(req: Request, res: Response): Promise<void> {
    try {
      const memberId = req.params.memberId;

      if (!memberId) {
        res.status(400).json({ error: 'Member ID is required' });
        return;
      }

      const summary =
        await transactionService.getMemberBorrowingSummary(memberId);

      if (!summary) {
        res
          .status(404)
          .json({ error: 'Member not found or no borrowing history' });
        return;
      }

      res.json(summary);
    } catch (error) {
      console.error('Error fetching member borrowing summary:', error);
      res
        .status(500)
        .json({ error: 'Failed to fetch member borrowing summary' });
    }
  }

  // Get transaction details
  async getTransactionDetails(req: Request, res: Response): Promise<void> {
    try {
      const transactionId = req.params.transactionId;

      if (!transactionId) {
        res.status(400).json({ error: 'Transaction ID is required' });
        return;
      }

      const transaction =
        await transactionService.getTransactionWithDetails(transactionId);

      if (!transaction) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }

      res.json(transaction);
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      res.status(500).json({ error: 'Failed to fetch transaction details' });
    }
  }

  // Get all active transactions (admin view)
  async getAllActiveTransactions(_req: Request, res: Response): Promise<void> {
    try {
      const transactions = await transactionService.getAllActiveTransactions();
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching active transactions:', error);
      res.status(500).json({ error: 'Failed to fetch active transactions' });
    }
  }

  // Get overdue transactions
  async getOverdueTransactions(_req: Request, res: Response): Promise<void> {
    try {
      const overdueTransactions =
        await transactionService.getOverdueTransactions();
      res.json(overdueTransactions);
    } catch (error) {
      console.error('Error fetching overdue transactions:', error);
      res.status(500).json({ error: 'Failed to fetch overdue transactions' });
    }
  }

  // Check if member can borrow
  async checkMemberBorrowingEligibility(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const memberId = req.params.memberId;

      if (!memberId) {
        res.status(400).json({ error: 'Member ID is required' });
        return;
      }

      const eligibility = await transactionService.canMemberBorrow(memberId);
      res.json(eligibility);
    } catch (error) {
      console.error('Error checking member borrowing eligibility:', error);
      res.status(500).json({ error: 'Failed to check borrowing eligibility' });
    }
  }

  // Get borrowing statistics (admin dashboard)
  async getBorrowingStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await transactionService.getBorrowingStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching borrowing statistics:', error);
      res.status(500).json({ error: 'Failed to fetch borrowing statistics' });
    }
  }

  // Quick endpoint to borrow a book copy by copy ID (simplified for frontend)
  async quickBorrowCopy(req: Request, res: Response): Promise<void> {
    try {
      const copyId = req.params.copyId;
      const { member_id } = req.body;

      if (!copyId || !member_id) {
        res.status(400).json({
          error: 'Copy ID in URL and member_id in body are required',
        });
        return;
      }

      const transaction = await transactionService.borrowBook({
        book_copy_id: copyId,
        member_id,
        notes: 'Borrowed via quick borrow',
      });

      res.status(201).json({
        message: 'Book copy borrowed successfully',
        transaction,
      });
    } catch (error) {
      console.error('Error in quick borrow:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to borrow book copy' });
      }
    }
  }
}

export const transactionController = new TransactionController();
