export interface Book {
  id: string; // UUID format
  title: string;
  author: string;
  isbn?: string | null;
  genre?: string | null;
  publication_year?: number | null;
  description?: string | null;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

// Request interface for creating new books
export interface CreateBookRequest {
  title: string;
  author: string;
  isbn?: string;
  genre?: string;
  publication_year?: number;
  description?: string;
}

// Request interface for updating existing books
export interface UpdateBookRequest {
  title?: string;
  author?: string;
  isbn?: string;
  genre?: string;
  publication_year?: number;
  description?: string;
}

// Search options for book queries
export interface BookSearchOptions {
  query?: string; // Search by title or author
  genre?: string;
  publicationYearFrom?: number;
  publicationYearTo?: number;
  limit?: number;
  offset?: number;
}

// Book with additional computed fields
export interface BookWithDetails extends Book {
  age_years?: number; // Computed: current year - publication_year
  has_isbn?: boolean; // Computed: whether ISBN is provided
}
