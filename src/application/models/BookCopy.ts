// Copy model interfaces for book copy management
// Represents individual physical copies of books in the library

export interface BookCopy {
  id: string;
  book_id: string;
  copy_number: string;
  status: CopyStatus;
  condition_notes?: string;
  acquisition_date: string;
  created_at: string;
  updated_at: string;
}

export type CopyStatus = 'Available' | 'Borrowed' | 'Damaged' | 'Lost';

export interface CreateCopyRequest {
  book_id: string;
  copy_number: string;
  status?: CopyStatus;
  condition_notes?: string;
  acquisition_date?: string;
}

export interface UpdateCopyRequest {
  copy_number?: string;
  status?: CopyStatus;
  condition_notes?: string;
  acquisition_date?: string;
}

export interface CopyWithBookInfo extends BookCopy {
  book_title: string;
  book_author: string;
}

export interface BookWithCopies {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  genre?: string;
  publication_year?: number;
  description?: string;
  created_at: string;
  copies: BookCopy[];
  total_copies: number;
  available_copies: number;
}
