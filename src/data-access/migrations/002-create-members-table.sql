-- Migration: 002-create-members-table
-- Description: Create members table for library member management

CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL CHECK(length(trim(first_name)) > 0),
    last_name VARCHAR(50) NOT NULL CHECK(length(trim(last_name)) > 0),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
    registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_members_member_id ON members(member_id);
CREATE INDEX IF NOT EXISTS idx_members_name ON members(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_registration_date ON members(registration_date);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_members_updated_at 
    AFTER UPDATE ON members 
BEGIN
    UPDATE members SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;