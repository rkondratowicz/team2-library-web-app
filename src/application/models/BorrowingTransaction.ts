// Transaction model interfaces for library borrowing system
// Manages book checkout, returns, and borrowing lifecycle

export interface BorrowingTransaction {
  id: string;
  book_copy_id: string;
  member_id: string;
  borrow_date: string;
  due_date: string;
  return_date?: string; // NULL until returned
  status: TransactionStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type TransactionStatus = 'Active' | 'Returned' | 'Overdue';

// Request interfaces for API operations
export interface CreateBorrowingRequest {
  book_copy_id: string;
  member_id: string;
  loan_period_days?: number; // Optional, defaults to 14 days
  notes?: string;
}

export interface ReturnBookRequest {
  transaction_id: string;
  return_notes?: string;
}

export interface UpdateTransactionRequest {
  due_date?: string;
  status?: TransactionStatus;
  notes?: string;
}

// Extended interfaces for detailed views
export interface BorrowingTransactionWithDetails extends BorrowingTransaction {
  // Book information
  book_title: string;
  book_author: string;
  book_isbn?: string;
  copy_number: string;

  // Member information
  member_name: string;
  member_email?: string;

  // Calculated fields
  days_borrowed: number;
  is_overdue: boolean;
  days_overdue?: number;
}

// Summary interfaces for analytics
export interface MemberBorrowingSummary {
  member_id: string;
  member_name: string;
  active_borrows_count: number;
  total_borrows_count: number;
  overdue_count: number;
  active_transactions: BorrowingTransactionWithDetails[];
}

export interface BookBorrowingStats {
  book_id: string;
  book_title: string;
  total_copies: number;
  available_copies: number;
  borrowed_copies: number;
  total_borrows: number;
  current_borrowers: string[]; // member names
}

// Validation and utility types
export interface BorrowingValidation {
  is_valid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface LoanPeriodConfig {
  default_days: number;
  max_days: number;
  member_limit: number; // maximum books per member
}
