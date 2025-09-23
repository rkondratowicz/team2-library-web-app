-- Migration: 001-create-first-table
-- Description: Create a simple table with id (UUID primary key), title, and author

CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL
);