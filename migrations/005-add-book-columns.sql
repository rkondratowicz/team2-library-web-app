-- Migration: 005-add-book-columns
-- Description: Add isbn, genre, publication_year, description, and copies_available columns to books table

ALTER TABLE books ADD COLUMN isbn TEXT;
ALTER TABLE books ADD COLUMN genre TEXT;
ALTER TABLE books ADD COLUMN publication_year INTEGER;
ALTER TABLE books ADD COLUMN description TEXT;
ALTER TABLE books ADD COLUMN copies_available INTEGER DEFAULT 1;
