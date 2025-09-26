import type {
  BorrowingTransaction,
  BorrowingTransactionWithDetails,
  CreateBorrowingRequest,
  MemberBorrowingSummary,
  TransactionStatus,
} from '../../application/models/BorrowingTransaction.js';
import type { DatabaseConnection } from '../DatabaseConnection.js';

export class TransactionRepository {
  constructor(private db: DatabaseConnection) {}

  // Create new borrowing transaction
  async createBorrowingTransaction(
    request: CreateBorrowingRequest & { due_date: string }
  ): Promise<BorrowingTransaction> {
    const id = crypto.randomUUID();

    await this.db.run(
      `
            INSERT INTO borrowing_transactions 
            (id, book_copy_id, member_id, due_date, notes)
            VALUES (?, ?, ?, ?, ?)
        `,
      [
        id,
        request.book_copy_id,
        request.member_id,
        request.due_date,
        request.notes || null,
      ]
    );

    // Fetch the created transaction
    const result = await this.db.getOne(
      'SELECT * FROM borrowing_transactions WHERE id = ?',
      [id]
    );

    if (!result) {
      throw new Error('Failed to create borrowing transaction');
    }

    return result as BorrowingTransaction;
  }

  // Get transaction by ID
  async getTransactionById(id: string): Promise<BorrowingTransaction | null> {
    const query = 'SELECT * FROM borrowing_transactions WHERE id = ?';
    const result = await this.db.getOne(query, [id]);
    return (result as BorrowingTransaction) || null;
  }

  // Get active transactions for a member
  async getActiveBorrowingsByMember(
    memberId: string
  ): Promise<BorrowingTransaction[]> {
    const query = `
            SELECT * FROM borrowing_transactions 
            WHERE member_id = ? AND status = 'Active'
            ORDER BY borrow_date DESC
        `;
    const results = await this.db.all(query, [memberId]);
    return results as BorrowingTransaction[];
  }

  // Get active transactions for a member with book details
  async getActiveBorrowingsByMemberWithDetails(
    memberId: string
  ): Promise<BorrowingTransactionWithDetails[]> {
    const query = `
            SELECT 
                bt.*,
                b.title as book_title,
                b.author as book_author,
                b.isbn as book_isbn,
                bc.copy_number,
                (m.first_name || ' ' || m.last_name) as member_name,
                m.email as member_email,
                julianday('now') - julianday(bt.borrow_date) as days_borrowed,
                CASE 
                    WHEN date(bt.due_date) < date('now') THEN 1 
                    ELSE 0 
                END as is_overdue,
                CASE 
                    WHEN date(bt.due_date) < date('now') 
                    THEN julianday('now') - julianday(bt.due_date)
                    ELSE NULL 
                END as days_overdue
            FROM borrowing_transactions bt
            JOIN book_copies bc ON bt.book_copy_id = bc.id
            JOIN books b ON bc.book_id = b.id
            JOIN members m ON bt.member_id = m.member_id
            WHERE bt.member_id = ? AND bt.status = 'Active'
            ORDER BY bt.borrow_date DESC
        `;
    const results = await this.db.all(query, [memberId]);
    return results as BorrowingTransactionWithDetails[];
  }

  // Get all transactions for a member (history)
  async getAllBorrowingsByMember(
    memberId: string
  ): Promise<BorrowingTransaction[]> {
    const query = `
            SELECT * FROM borrowing_transactions 
            WHERE member_id = ?
            ORDER BY borrow_date DESC
        `;
    const results = await this.db.all(query, [memberId]);
    return results as BorrowingTransaction[];
  }

  // Get transaction by book copy (check if copy is currently borrowed)
  async getActiveBorrowingByCopy(
    copyId: string
  ): Promise<BorrowingTransaction | null> {
    const query = `
            SELECT * FROM borrowing_transactions 
            WHERE book_copy_id = ? AND status = 'Active'
        `;
    const result = await this.db.getOne(query, [copyId]);
    return (result as BorrowingTransaction) || null;
  }

  // Return a book (update transaction)
  async returnBook(
    transactionId: string,
    returnNotes?: string
  ): Promise<BorrowingTransaction> {
    await this.db.run(
      `
            UPDATE borrowing_transactions 
            SET return_date = datetime('now'), 
                status = 'Returned',
                notes = COALESCE(?, notes),
                updated_at = datetime('now')
            WHERE id = ? AND status = 'Active'
        `,
      [returnNotes, transactionId]
    );

    const result = await this.db.getOne(
      'SELECT * FROM borrowing_transactions WHERE id = ?',
      [transactionId]
    );

    if (!result) {
      throw new Error('Transaction not found or already returned');
    }

    return result as BorrowingTransaction;
  }

  // Update transaction status (for overdue tracking)
  async updateTransactionStatus(
    id: string,
    status: TransactionStatus
  ): Promise<boolean> {
    const query = `
            UPDATE borrowing_transactions 
            SET status = ?, updated_at = datetime('now')
            WHERE id = ?
        `;

    const result = await this.db.run(query, [status, id]);
    return (result?.changes || 0) > 0;
  }

  // Get overdue transactions
  async getOverdueTransactions(): Promise<BorrowingTransaction[]> {
    const query = `
            SELECT * FROM borrowing_transactions 
            WHERE status = 'Active' 
            AND date(due_date) < date('now')
            ORDER BY due_date ASC
        `;
    const results = await this.db.all(query);
    return results as BorrowingTransaction[];
  }

  // Get detailed transaction info with book and member details
  async getTransactionWithDetails(
    id: string
  ): Promise<BorrowingTransactionWithDetails | null> {
    const query = `
            SELECT 
                bt.*,
                b.title as book_title,
                b.author as book_author, 
                b.isbn as book_isbn,
                bc.copy_number,
                (m.first_name || ' ' || m.last_name) as member_name,
                m.email as member_email,
                julianday('now') - julianday(bt.borrow_date) as days_borrowed,
                CASE 
                    WHEN date(bt.due_date) < date('now') AND bt.status = 'Active' THEN 1 
                    ELSE 0 
                END as is_overdue,
                CASE 
                    WHEN date(bt.due_date) < date('now') AND bt.status = 'Active' 
                    THEN julianday('now') - julianday(bt.due_date)
                    ELSE NULL 
                END as days_overdue
            FROM borrowing_transactions bt
            JOIN book_copies bc ON bt.book_copy_id = bc.id
            JOIN books b ON bc.book_id = b.id
            JOIN members m ON bt.member_id = m.member_id
            WHERE bt.id = ?
        `;

    const result = await this.db.getOne(query, [id]);
    return (result as BorrowingTransactionWithDetails) || null;
  }

  // Get member borrowing summary
  async getMemberBorrowingSummary(
    memberId: string
  ): Promise<MemberBorrowingSummary | null> {
    const summaryQuery = `
            SELECT 
                m.member_id as member_id,
                (m.first_name || ' ' || m.last_name) as member_name,
                COUNT(CASE WHEN bt.status = 'Active' THEN 1 END) as active_borrows_count,
                COUNT(bt.id) as total_borrows_count,
                COUNT(CASE WHEN bt.status = 'Active' AND date(bt.due_date) < date('now') THEN 1 END) as overdue_count
            FROM members m
            LEFT JOIN borrowing_transactions bt ON m.member_id = bt.member_id
            WHERE m.member_id = ?
            GROUP BY m.member_id, m.first_name, m.last_name
        `;

    const summary = await this.db.getOne(summaryQuery, [memberId]);
    if (!summary) return null;

    const activeTransactions =
      await this.getActiveBorrowingsByMemberWithDetails(memberId);

    return {
      ...summary,
      active_transactions: activeTransactions,
    } as MemberBorrowingSummary;
  }

  // Get all active transactions (admin view)
  async getAllActiveTransactions(): Promise<BorrowingTransactionWithDetails[]> {
    const query = `
            SELECT 
                bt.*,
                b.title as book_title,
                b.author as book_author,
                b.isbn as book_isbn,
                bc.copy_number,
                (m.first_name || ' ' || m.last_name) as member_name,
                m.email as member_email,
                julianday('now') - julianday(bt.borrow_date) as days_borrowed,
                CASE 
                    WHEN date(bt.due_date) < date('now') THEN 1 
                    ELSE 0 
                END as is_overdue,
                CASE 
                    WHEN date(bt.due_date) < date('now') 
                    THEN julianday('now') - julianday(bt.due_date)
                    ELSE NULL 
                END as days_overdue
            FROM borrowing_transactions bt
            JOIN book_copies bc ON bt.book_copy_id = bc.id
            JOIN books b ON bc.book_id = b.id
            JOIN members m ON bt.member_id = m.member_id
            WHERE bt.status = 'Active'
            ORDER BY bt.borrow_date DESC
        `;

    const results = await this.db.all(query);
    return results as BorrowingTransactionWithDetails[];
  }

  // Check if a copy is available for borrowing
  async isCopyAvailable(copyId: string): Promise<boolean> {
    const activeTransaction = await this.getActiveBorrowingByCopy(copyId);
    return activeTransaction === null;
  }

  // Count active borrows for a member (for limit checking)
  async countActiveBorrowsByMember(memberId: string): Promise<number> {
    const activeTransactions = await this.getActiveBorrowingsByMember(memberId);
    return activeTransactions.length;
  }

  // Search active transactions with details
  async searchActiveTransactions(
    searchTerm: string
  ): Promise<BorrowingTransactionWithDetails[]> {
    const query = `
            SELECT 
                bt.*,
                b.title as book_title,
                b.author as book_author,
                b.isbn as book_isbn,
                bc.copy_number,
                (m.first_name || ' ' || m.last_name) as member_name,
                m.email as member_email,
                julianday('now') - julianday(bt.borrow_date) as days_borrowed,
                CASE 
                    WHEN date(bt.due_date) < date('now') THEN 1 
                    ELSE 0 
                END as is_overdue,
                CASE 
                    WHEN date(bt.due_date) < date('now') 
                    THEN julianday('now') - julianday(bt.due_date)
                    ELSE NULL 
                END as days_overdue
            FROM borrowing_transactions bt
            JOIN book_copies bc ON bt.book_copy_id = bc.id
            JOIN books b ON bc.book_id = b.id
            JOIN members m ON bt.member_id = m.member_id
            WHERE bt.status = 'Active' AND (
                LOWER(m.first_name || ' ' || m.last_name) LIKE LOWER(?) OR
                LOWER(m.member_id) LIKE LOWER(?) OR
                LOWER(b.title) LIKE LOWER(?) OR
                LOWER(b.author) LIKE LOWER(?) OR
                LOWER(bc.copy_number) LIKE LOWER(?) OR
                LOWER(bt.id) LIKE LOWER(?)
            )
            ORDER BY bt.borrow_date DESC
        `;

    const searchPattern = `%${searchTerm}%`;
    const results = await this.db.all(query, [
      searchPattern, // member name
      searchPattern, // member id
      searchPattern, // book title
      searchPattern, // book author
      searchPattern, // copy number
      searchPattern, // transaction id
    ]);

    return results as BorrowingTransactionWithDetails[];
  }
}

// Export singleton instance
import { databaseConnection } from '../DatabaseConnection.js';
export const transactionRepository = new TransactionRepository(
  databaseConnection
);
