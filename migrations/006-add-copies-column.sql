-- Migration: 006-add-copies-column
-- Description: Add copies_available column to books table to track inventory

ALTER TABLE books ADD COLUMN copies_available INTEGER DEFAULT 1;
