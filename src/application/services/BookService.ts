import { bookRepository } from '../../data-access/repositories/BookRepository.js';
import type {
  Book,
  BookSearchOptions,
  CreateBookRequest,
  UpdateBookRequest,
} from '../models/Book.js';

export class BookService {
  // Get all books with pagination
  async getAllBooks(limit?: number, offset?: number): Promise<Book[]> {
    return await bookRepository.getAllBooks(limit, offset);
  }

  // Get book by ID
  async getBookById(id: string): Promise<Book | null> {
    if (!id || id.trim() === '') {
      throw new Error('Book ID is required');
    }
    return await bookRepository.getBookById(id);
  }

  // Get book by ISBN
  async getBookByIsbn(isbn: string): Promise<Book | null> {
    if (!isbn || isbn.trim() === '') {
      throw new Error('ISBN is required');
    }
    return await bookRepository.getBookByIsbn(isbn);
  }

  // Create new book with validation
  async createBook(bookData: CreateBookRequest): Promise<Book> {
    // Validate required fields
    if (!bookData.title || bookData.title.trim() === '') {
      throw new Error('Book title is required');
    }
    if (!bookData.author || bookData.author.trim() === '') {
      throw new Error('Book author is required');
    }

    // Validate ISBN format if provided
    if (bookData.isbn && !this.isValidISBN(bookData.isbn)) {
      throw new Error('Invalid ISBN format');
    }

    // Validate publication year if provided
    if (bookData.publication_year !== undefined) {
      const currentYear = new Date().getFullYear();
      if (
        bookData.publication_year < 1800 ||
        bookData.publication_year > currentYear + 1
      ) {
        throw new Error(
          `Publication year must be between 1800 and ${currentYear + 1}`
        );
      }
    }

    // Check if ISBN already exists
    if (bookData.isbn) {
      const existingBook = await bookRepository.getBookByIsbn(bookData.isbn);
      if (existingBook) {
        throw new Error(`A book with ISBN ${bookData.isbn} already exists`);
      }
    }

    return await bookRepository.create(bookData);
  }

  // Update book
  async updateBook(
    id: string,
    updates: UpdateBookRequest
  ): Promise<Book | null> {
    if (!id || id.trim() === '') {
      throw new Error('Book ID is required');
    }

    // Check if book exists
    const existingBook = await bookRepository.getBookById(id);
    if (!existingBook) {
      throw new Error('Book not found');
    }

    // Validate updates
    if (
      updates.title !== undefined &&
      (!updates.title || updates.title.trim() === '')
    ) {
      throw new Error('Book title cannot be empty');
    }
    if (
      updates.author !== undefined &&
      (!updates.author || updates.author.trim() === '')
    ) {
      throw new Error('Book author cannot be empty');
    }

    // Validate ISBN if being updated
    if (
      updates.isbn !== undefined &&
      updates.isbn &&
      !this.isValidISBN(updates.isbn)
    ) {
      throw new Error('Invalid ISBN format');
    }

    // Validate publication year if being updated
    if (updates.publication_year !== undefined) {
      const currentYear = new Date().getFullYear();
      if (
        updates.publication_year < 1800 ||
        updates.publication_year > currentYear + 1
      ) {
        throw new Error(
          `Publication year must be between 1800 and ${currentYear + 1}`
        );
      }
    }

    // Check if new ISBN conflicts with existing books
    if (updates.isbn && updates.isbn !== existingBook.isbn) {
      const conflictingBook = await bookRepository.getBookByIsbn(updates.isbn);
      if (conflictingBook && conflictingBook.id !== id) {
        throw new Error(`A book with ISBN ${updates.isbn} already exists`);
      }
    }

    return await bookRepository.update(id, updates);
  }

  // Delete book
  async deleteBook(id: string): Promise<boolean> {
    if (!id || id.trim() === '') {
      throw new Error('Book ID is required');
    }

    // Check if book exists
    const existingBook = await bookRepository.getBookById(id);
    if (!existingBook) {
      throw new Error('Book not found');
    }

    return await bookRepository.delete(id);
  }

  // Search books
  async searchBooks(
    query: string,
    limit?: number,
    offset?: number
  ): Promise<Book[]> {
    if (!query || query.trim() === '') {
      return await this.getAllBooks(limit, offset);
    }
    return await bookRepository.search(query.trim(), limit, offset);
  }

  // Advanced search
  async advancedSearchBooks(options: BookSearchOptions): Promise<Book[]> {
    return await bookRepository.advancedSearch(options);
  }

  // Get books by genre
  async getBooksByGenre(
    genre: string,
    limit?: number,
    offset?: number
  ): Promise<Book[]> {
    if (!genre || genre.trim() === '') {
      throw new Error('Genre is required');
    }
    return await bookRepository.getBooksByGenre(genre, limit, offset);
  }

  // Get books by year range
  async getBooksByYearRange(fromYear: number, toYear: number): Promise<Book[]> {
    if (fromYear > toYear) {
      throw new Error('From year cannot be greater than to year');
    }
    return await bookRepository.getBooksByYearRange(fromYear, toYear);
  }

  // Get all genres
  async getAllGenres(): Promise<string[]> {
    return await bookRepository.getAllGenres();
  }

  // Get book statistics
  async getBookStatistics(): Promise<{
    total: number;
    byGenre: { genre: string; count: number }[];
    recent: Book[];
  }> {
    const [total, byGenre, recent] = await Promise.all([
      bookRepository.count(),
      bookRepository.countByGenre(),
      bookRepository.getRecentBooks(5),
    ]);

    return { total, byGenre, recent };
  }

  // Get recent books
  async getRecentBooks(limit = 10): Promise<Book[]> {
    return await bookRepository.getRecentBooks(limit);
  }

  // Private helper method to validate ISBN
  private isValidISBN(isbn: string): boolean {
    // Remove hyphens and spaces
    const cleanISBN = isbn.replace(/[-\s]/g, '');

    // Check if it's ISBN-10 or ISBN-13
    if (cleanISBN.length === 10) {
      return this.isValidISBN10(cleanISBN);
    } else if (cleanISBN.length === 13) {
      return this.isValidISBN13(cleanISBN);
    }

    return false;
  }

  private isValidISBN10(isbn: string): boolean {
    if (!/^\d{9}[\dX]$/.test(isbn)) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(isbn[i]) * (10 - i);
    }

    const checkDigit = isbn[9] === 'X' ? 10 : parseInt(isbn[9]);
    sum += checkDigit;

    return sum % 11 === 0;
  }

  private isValidISBN13(isbn: string): boolean {
    if (!/^\d{13}$/.test(isbn)) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(isbn[i]) * (i % 2 === 0 ? 1 : 3);
    }

    const checkDigit = parseInt(isbn[12]);
    const calculatedCheck = (10 - (sum % 10)) % 10;

    return checkDigit === calculatedCheck;
  }
}

export const bookService = new BookService();
