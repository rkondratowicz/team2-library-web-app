import { transactionRepository } from '../../data-access/repositories/TransactionRepository.js';
import { bookRepository } from '../../data-access/repositories/BookRepository.js';
import type { 
    BorrowingTransaction, 
    CreateBorrowingRequest,
    BorrowingValidation,
    MemberBorrowingSummary,
    BorrowingTransactionWithDetails 
} from '../models/BorrowingTransaction.js';

export class TransactionService {
    private readonly MAX_BOOKS_PER_MEMBER = 3;
    private readonly DEFAULT_LOAN_PERIOD_DAYS = 14;

    // Borrow a book copy
    async borrowBook(request: CreateBorrowingRequest): Promise<BorrowingTransaction> {
        // Validate the borrowing request
        const validation = await this.validateBorrowingRequest(request);
        if (!validation.is_valid) {
            throw new Error(validation.errors.join(', '));
        }

        // Calculate due date
        const loanDays = request.loan_period_days || this.DEFAULT_LOAN_PERIOD_DAYS;
        const dueDate = this.calculateDueDate(loanDays);

        // Create the borrowing transaction
        const transaction = await transactionRepository.createBorrowingTransaction({
            ...request,
            due_date: dueDate
        });

        // Update book copy status to borrowed
        await bookRepository.updateCopy(request.book_copy_id, {
            status: 'Borrowed'
        });

        return transaction;
    }

    // Return a borrowed book
    async returnBook(transactionId: string, returnNotes?: string): Promise<BorrowingTransaction> {
        // Get the transaction
        const transaction = await transactionRepository.getTransactionById(transactionId);
        if (!transaction) {
            throw new Error('Transaction not found');
        }

        if (transaction.status !== 'Active') {
            throw new Error('Book is not currently borrowed');
        }

        // Update transaction as returned
        const updatedTransaction = await transactionRepository.returnBook(transactionId, returnNotes);

        // Update book copy status back to available
        await bookRepository.updateCopy(transaction.book_copy_id, {
            status: 'Available'
        });

        return updatedTransaction;
    }

    // Get member's borrowing summary
    async getMemberBorrowingSummary(memberId: string): Promise<MemberBorrowingSummary | null> {
        return await transactionRepository.getMemberBorrowingSummary(memberId);
    }

    // Get transaction details with book and member info
    async getTransactionWithDetails(transactionId: string): Promise<BorrowingTransactionWithDetails | null> {
        return await transactionRepository.getTransactionWithDetails(transactionId);
    }

    // Get all active transactions (admin view)
    async getAllActiveTransactions(): Promise<BorrowingTransactionWithDetails[]> {
        return await transactionRepository.getAllActiveTransactions();
    }

    // Get overdue transactions
    async getOverdueTransactions(): Promise<BorrowingTransaction[]> {
        const overdueTransactions = await transactionRepository.getOverdueTransactions();
        
        // Update their status to overdue if not already
        for (const transaction of overdueTransactions) {
            if (transaction.status === 'Active') {
                await transactionRepository.updateTransactionStatus(transaction.id, 'Overdue');
            }
        }

        return overdueTransactions;
    }

    // Validate borrowing request
    private async validateBorrowingRequest(request: CreateBorrowingRequest): Promise<BorrowingValidation> {
        const errors: string[] = [];

        try {
            // Check if book copy exists and is available
            const copy = await bookRepository.getCopyById(request.book_copy_id);
            if (!copy) {
                errors.push('Book copy not found');
                return { is_valid: false, errors };
            }

            if (copy.status !== 'Available') {
                errors.push('Book copy is not available for borrowing');
            }

            // Check if copy is already borrowed
            const activeBorrowing = await transactionRepository.getActiveBorrowingByCopy(request.book_copy_id);
            if (activeBorrowing) {
                errors.push('Book copy is already borrowed by another member');
            }

            // Check member borrowing limits
            const activeBorrows = await transactionRepository.countActiveBorrowsByMember(request.member_id);
            if (activeBorrows >= this.MAX_BOOKS_PER_MEMBER) {
                errors.push(`Member has reached maximum borrowing limit of ${this.MAX_BOOKS_PER_MEMBER} books`);
            }

            // TODO: Add member validation once member service is available
            // - Check if member exists
            // - Check if member has overdue books (block new borrowing)
            // - Check member status (active/suspended)

            return {
                is_valid: errors.length === 0,
                errors
            };

        } catch (error) {
            console.error('Error validating borrowing request:', error);
            return {
                is_valid: false,
                errors: ['Validation failed due to system error']
            };
        }
    }

    // Calculate due date based on loan period
    private calculateDueDate(loanPeriodDays: number): string {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + loanPeriodDays);
        return dueDate.toISOString();
    }

    // Check if a member can borrow more books
    async canMemberBorrow(memberId: string): Promise<{ canBorrow: boolean; reason?: string }> {
        try {
            const activeBorrows = await transactionRepository.countActiveBorrowsByMember(memberId);
            
            if (activeBorrows >= this.MAX_BOOKS_PER_MEMBER) {
                return {
                    canBorrow: false,
                    reason: `Member has reached maximum borrowing limit (${activeBorrows}/${this.MAX_BOOKS_PER_MEMBER})`
                };
            }

            // TODO: Check for overdue books once overdue tracking is implemented
            
            return { canBorrow: true };

        } catch (error) {
            console.error('Error checking member borrowing eligibility:', error);
            return {
                canBorrow: false,
                reason: 'Unable to verify member borrowing eligibility'
            };
        }
    }

    // Get borrowing statistics
    async getBorrowingStats() {
        try {
            const activeTransactions = await transactionRepository.getAllActiveTransactions();
            const overdueTransactions = await this.getOverdueTransactions();

            return {
                total_active_borrows: activeTransactions.length,
                overdue_count: overdueTransactions.length,
                members_with_active_borrows: new Set(activeTransactions.map(t => t.member_id)).size,
                most_borrowed_books: await this.getMostBorrowedBooks()
            };
        } catch (error) {
            console.error('Error getting borrowing statistics:', error);
            return {
                total_active_borrows: 0,
                overdue_count: 0,
                members_with_active_borrows: 0,
                most_borrowed_books: []
            };
        }
    }

    // Get most borrowed books (simple version)
    private async getMostBorrowedBooks() {
        // This is a simplified version - in a real system you'd have more sophisticated analytics
        const activeTransactions = await transactionRepository.getAllActiveTransactions();
        
        // Group by book title and count
        const bookCounts: { [key: string]: { title: string; count: number } } = {};
        
        for (const transaction of activeTransactions) {
            const title = transaction.book_title;
            if (!bookCounts[title]) {
                bookCounts[title] = { title, count: 0 };
            }
            bookCounts[title].count++;
        }

        // Return top 5 most borrowed books
        return Object.values(bookCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }
}

export const transactionService = new TransactionService();