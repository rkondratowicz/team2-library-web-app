-- Migration: 005-add-book-columns
-- Description: Add ISBN, genre, publication_year, description, and copies_available columns to books table

ALTER TABLE books ADD COLUMN copies_available INTEGER DEFAULT 1;
