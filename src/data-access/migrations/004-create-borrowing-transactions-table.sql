-- Create borrowing_transactions table for tracking book loans and returns
-- This table manages the borrowing lifecycle: checkout, due dates, returns

CREATE TABLE IF NOT EXISTS borrowing_transactions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-a' || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    
    -- Foreign keys to link book copy and member
    book_copy_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    
    -- Borrowing dates and timeline
    borrow_date TEXT NOT NULL DEFAULT (datetime('now')),
    due_date TEXT NOT NULL,
    return_date TEXT NULL,  -- NULL until book is returned
    
    -- Transaction status tracking
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Returned', 'Overdue')),
    
    -- Additional tracking fields
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    -- Foreign key constraints
    FOREIGN KEY (book_copy_id) REFERENCES book_copies(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_borrowing_transactions_book_copy_id ON borrowing_transactions(book_copy_id);
CREATE INDEX IF NOT EXISTS idx_borrowing_transactions_member_id ON borrowing_transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_borrowing_transactions_status ON borrowing_transactions(status);
CREATE INDEX IF NOT EXISTS idx_borrowing_transactions_due_date ON borrowing_transactions(due_date);
CREATE INDEX IF NOT EXISTS idx_borrowing_transactions_borrow_date ON borrowing_transactions(borrow_date);

-- Partial indexes for active transactions (most common queries)
CREATE INDEX IF NOT EXISTS idx_borrowing_transactions_active ON borrowing_transactions(member_id, status) WHERE status = 'Active';
CREATE INDEX IF NOT EXISTS idx_borrowing_transactions_overdue ON borrowing_transactions(due_date, status) WHERE status IN ('Active', 'Overdue');

-- Trigger to update updated_at timestamp automatically
CREATE TRIGGER IF NOT EXISTS borrowing_transactions_updated_at 
    AFTER UPDATE ON borrowing_transactions
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE borrowing_transactions 
    SET updated_at = datetime('now') 
    WHERE id = NEW.id;
END;