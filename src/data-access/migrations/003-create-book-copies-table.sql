-- Migration: 003-create-book-copies-table
-- Description: Create book_copies table to track individual physical copies of books

CREATE TABLE IF NOT EXISTS book_copies (
    id TEXT PRIMARY KEY CHECK(length(id) = 36 AND id GLOB '[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]-[0-9a-f][0-9a-f][0-9a-f][0-9a-f]-[0-9a-f][0-9a-f][0-9a-f][0-9a-f]-[0-9a-f][0-9a-f][0-9a-f][0-9a-f]-[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]'),
    book_id TEXT NOT NULL,
    copy_number TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Available', 'Borrowed', 'Damaged', 'Lost')) DEFAULT 'Available',
    condition_notes TEXT,
    acquisition_date DATE DEFAULT CURRENT_DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    
    -- Ensure copy numbers are unique per book
    UNIQUE(book_id, copy_number)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_book_copies_book_id ON book_copies(book_id);
CREATE INDEX IF NOT EXISTS idx_book_copies_status ON book_copies(status);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_book_copies_timestamp 
    AFTER UPDATE ON book_copies
    FOR EACH ROW
BEGIN
    UPDATE book_copies SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;