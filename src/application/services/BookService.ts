import { bookRepository } from '../../data-access/repositories/BookRepository.js';
import type { Book } from '../models/Book.js';

export class BookService {
  async getAllBooks(): Promise<Book[]> {
    return await bookRepository.getAllBooks();
  }

  async getBookById(id: string): Promise<Book | null> {
    return await bookRepository.getBookById(id);
  }

  async searchBooks(searchTerm: string): Promise<Book[]> {
    if (!searchTerm.trim()) {
      return await this.getAllBooks();
    }
    return await bookRepository.searchBooks(searchTerm.trim());
  }

  async createBook(bookData: Omit<Book, 'id' | 'created_at'>): Promise<Book> {
    // Basic validation
    if (!bookData.title?.trim()) {
      throw new Error('Title is required');
    }
    if (!bookData.author?.trim()) {
      throw new Error('Author is required');
    }

    // ISBN validation
    if (bookData.isbn) {
      const isbn = bookData.isbn.replace(/[-\s]/g, ''); // Remove hyphens and spaces
      if (!/^\d{10,13}$/.test(isbn)) {
        throw new Error('ISBN must be 10-13 digits only');
      }
      
      // Check for duplicate ISBN
      const existingBooks = await bookRepository.getAllBooks();
      const duplicateISBN = existingBooks.find(book => 
        book.isbn && book.isbn.replace(/[-\s]/g, '') === isbn
      );
      if (duplicateISBN) {
        throw new Error('A book with this ISBN already exists');
      }
    }

    // Genre validation
    if (bookData.genre && bookData.genre.trim().length > 32) {
      throw new Error('Genre cannot exceed 32 characters');
    }

    // Publication year validation
    if (bookData.publication_year !== undefined) {
      if (bookData.publication_year > 2025) {
        throw new Error('Publication year cannot be beyond 2025');
      }
      if (bookData.publication_year < -3000) { // Allow ancient texts like Homer
        throw new Error('Publication year too old');
      }
    }

    return await bookRepository.createBook(bookData);
  }

  async updateBook(id: string, bookData: Omit<Book, 'id' | 'created_at'>): Promise<Book> {
    if (!id?.trim()) {
      throw new Error('Book ID is required');
    }

    // Basic validation
    if (!bookData.title?.trim()) {
      throw new Error('Title is required');
    }
    if (!bookData.author?.trim()) {
      throw new Error('Author is required');
    }

    // Check if book exists
    const existingBook = await bookRepository.getBookById(id);
    if (!existingBook) {
      throw new Error('Book not found');
    }

    // ISBN validation
    if (bookData.isbn) {
      const isbn = bookData.isbn.replace(/[-\s]/g, ''); // Remove hyphens and spaces
      if (!/^\d{10,13}$/.test(isbn)) {
        throw new Error('ISBN must be 10-13 digits only');
      }
      
      // Check for duplicate ISBN (excluding the current book)
      const existingBooks = await bookRepository.getAllBooks();
      const duplicateISBN = existingBooks.find(book => 
        book.id !== id && // Exclude current book
        book.isbn && book.isbn.replace(/[-\s]/g, '') === isbn
      );
      if (duplicateISBN) {
        throw new Error('A book with this ISBN already exists');
      }
    }

    // Genre validation
    if (bookData.genre && bookData.genre.trim().length > 32) {
      throw new Error('Genre cannot exceed 32 characters');
    }

    // Publication year validation
    if (bookData.publication_year !== undefined) {
      if (bookData.publication_year > 2025) {
        throw new Error('Publication year cannot be beyond 2025');
      }
      if (bookData.publication_year < -3000) { // Allow ancient texts like Homer
        throw new Error('Publication year too old');
      }
    }

    return await bookRepository.updateBook(id, bookData);
  }

  async deleteBook(id: string): Promise<void> {
    if (!id?.trim()) {
      throw new Error('Book ID is required');
    }

    // Check if book exists before deleting
    const existingBook = await bookRepository.getBookById(id);
    if (!existingBook) {
      throw new Error('Book not found');
    }

    const wasDeleted = await bookRepository.deleteBook(id);
    if (!wasDeleted) {
      throw new Error('Failed to delete book');
    }
  }
}

export const bookService = new BookService();
