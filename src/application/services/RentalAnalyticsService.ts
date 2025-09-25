import { transactionRepository } from '../../data-access/repositories/TransactionRepository.js';
import { bookRepository } from '../../data-access/repositories/BookRepository.js';
import { memberRepository } from '../../data-access/repositories/MemberRepository.js';

/**
 * Rental Analytics Service
 * 
 * Provides business logic for rental tracking and analytics operations.
 * Aggregates data from multiple repositories to provide insights.
 */
export class RentalAnalyticsService {

  /**
   * Get current borrowers for a specific book
   */
  async getCurrentBorrowersForBook(bookId: string) {
    const activeTransactions = await transactionRepository.getAllActiveTransactions();
    // Note: We need to get book copies first to filter by book_id
    const copies = await bookRepository.getCopiesForBook(bookId);
    const copyIds = copies.map(c => c.id);
    const bookBorrowings = activeTransactions.filter(t => copyIds.includes(t.book_copy_id));
    
    return bookBorrowings.map(transaction => ({
      member_id: transaction.member_id,
      member_name: transaction.member_name,
      borrow_date: transaction.borrow_date,
      due_date: transaction.due_date,
      copy_id: transaction.book_copy_id,
      copy_number: transaction.copy_number,
      is_overdue: new Date(transaction.due_date) < new Date(),
      days_overdue: Math.max(0, Math.ceil((Date.now() - new Date(transaction.due_date).getTime()) / (1000 * 60 * 60 * 24)))
    }));
  }

  /**
   * Get all members who have borrowed a specific book (historical)
   */
  async getMembersByBookId(bookId: string) {
    // For now, return active transactions. In a full implementation, this would query all historical data
    const activeTransactions = await transactionRepository.getAllActiveTransactions();
    // Get copies for this book to filter transactions
    const copies = await bookRepository.getCopiesForBook(bookId);
    const copyIds = copies.map(c => c.id);
    const bookBorrowings = activeTransactions.filter(t => copyIds.includes(t.book_copy_id));
    
    return bookBorrowings.map(transaction => ({
      member_id: transaction.member_id,
      member_name: transaction.member_name,
      borrow_date: transaction.borrow_date,
      due_date: transaction.due_date,
      return_date: transaction.return_date,
      is_active: transaction.status === 'Active'
    }));
  }

  /**
   * Get comprehensive borrowing summary for a book
   */
  async getCurrentBorrowerSummaryForBook(bookId: string) {
    const book = await bookRepository.getBookById(bookId);
    if (!book) {
      throw new Error('Book not found');
    }

    const copies = await bookRepository.getCopiesForBook(bookId);
    const currentBorrowers = await this.getCurrentBorrowersForBook(bookId);
    const allBorrowers = await this.getMembersByBookId(bookId);
    
    return {
      book_info: book,
      total_copies: copies.length,
      available_copies: copies.length - currentBorrowers.length,
      currently_borrowed: currentBorrowers.length,
      current_borrowers: currentBorrowers,
      total_historical_borrowers: allBorrowers.length,
      overdue_count: currentBorrowers.filter(b => b.is_overdue).length
    };
  }

  /**
   * Get current books borrowed by a specific member
   */
  async getCurrentBooksByMemberId(memberId: string) {
    // Use getAllActiveTransactions to get detailed info, then filter by member
    const allActiveTransactions = await transactionRepository.getAllActiveTransactions();
    const memberTransactions = allActiveTransactions.filter(t => t.member_id === memberId);
    
    return memberTransactions.map(transaction => ({
      id: transaction.book_copy_id, // Use the copy ID since we don't have book_id in the interface
      title: transaction.book_title,
      author: transaction.book_author,
      copy_number: transaction.copy_number,
      borrow_date: transaction.borrow_date,
      due_date: transaction.due_date,
      is_overdue: new Date(transaction.due_date) < new Date(),
      days_overdue: Math.max(0, Math.ceil((Date.now() - new Date(transaction.due_date).getTime()) / (1000 * 60 * 60 * 24)))
    }));
  }

  /**
   * Get all books ever borrowed by a specific member
   */
  async getBooksByMemberId(memberId: string) {
    // For now, use active transactions since getAllBorrowingsByMember returns basic BorrowingTransaction
    // In a full implementation, this would query all historical data with full details
    const allActiveTransactions = await transactionRepository.getAllActiveTransactions();
    const memberTransactions = allActiveTransactions.filter(t => t.member_id === memberId);
    
    return memberTransactions.map(transaction => ({
      id: transaction.book_copy_id, // Use copy_id since book_id isn't available
      title: transaction.book_title,
      author: transaction.book_author,
      copy_number: transaction.copy_number,
      borrow_date: transaction.borrow_date,
      due_date: transaction.due_date,
      return_date: transaction.return_date,
      is_active: transaction.status === 'Active'
    }));
  }

  /**
   * Get member-book associations with filtering options
   */
  async getMemberBookAssociations(options: {
    memberId?: string;
    bookId?: string;
    currentOnly?: boolean;
    limit?: number;
    offset?: number;
  } = {}) {
    let transactions;
    
    if (options.currentOnly) {
      transactions = await transactionRepository.getAllActiveTransactions();
    } else {
      // For now, just use active transactions since we don't have a full historical query
      transactions = await transactionRepository.getAllActiveTransactions();
    }
    
    // Filter by member or book if specified
    if (options.memberId) {
      transactions = transactions.filter(t => t.member_id === options.memberId);
    }
    if (options.bookId) {
      // Filter by book ID - need to get copies for the book first
      const copies = await bookRepository.getCopiesForBook(options.bookId);
      const copyIds = copies.map(c => c.id);
      transactions = transactions.filter(t => copyIds.includes(t.book_copy_id));
    }
    
    // Apply pagination
    if (options.offset) {
      transactions = transactions.slice(options.offset);
    }
    if (options.limit) {
      transactions = transactions.slice(0, options.limit);
    }
    
    return transactions.map(transaction => ({
      member_id: transaction.member_id,
      member_name: transaction.member_name,
      book_copy_id: transaction.book_copy_id, // Use book_copy_id instead of book_id
      book_title: transaction.book_title,
      book_author: transaction.book_author,
      copy_number: transaction.copy_number,
      borrow_date: transaction.borrow_date,
      due_date: transaction.due_date,
      return_date: transaction.return_date,
      is_active: transaction.status === 'Active',
      is_overdue: new Date(transaction.due_date) < new Date(),
      days_borrowed: Math.ceil((Date.now() - new Date(transaction.borrow_date).getTime()) / (1000 * 60 * 60 * 24))
    }));
  }

  /**
   * Get overall rental statistics
   */
  async getRentalStatistics() {
    const activeTransactions = await transactionRepository.getAllActiveTransactions();
    const overdueTransactions = await transactionRepository.getOverdueTransactions();
    
    const uniqueMembers = new Set(activeTransactions.map(t => t.member_id));
    const uniqueBooks = new Set(activeTransactions.map(t => t.book_copy_id)); // Use copy_id for now
    
    return {
      total_active_rentals: activeTransactions.length,
      total_overdue_rentals: overdueTransactions.length,
      unique_active_members: uniqueMembers.size,
      unique_active_books: uniqueBooks.size,
      average_rentals_per_member: uniqueMembers.size > 0 ? activeTransactions.length / uniqueMembers.size : 0,
      overdue_rate: activeTransactions.length > 0 ? (overdueTransactions.length / activeTransactions.length) * 100 : 0,
      timestamp: new Date().toISOString()
    };
  }
}

export const rentalAnalyticsService = new RentalAnalyticsService();