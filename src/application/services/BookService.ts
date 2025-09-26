import { bookRepository } from '../../data-access/repositories/BookRepository.js';
import type { Book } from '../models/Book.js';
import type { CreateCopyRequest } from '../models/BookCopy.js';

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
      const duplicateISBN = existingBooks.find(
        (book) => book.isbn && book.isbn.replace(/[-\s]/g, '') === isbn
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
      if (bookData.publication_year < -3000) {
        // Allow ancient texts like Homer
        throw new Error('Publication year too old');
      }
    }

    // Copies validation
    const copiesToCreate = bookData.copies_available || 1;
    if (copiesToCreate < 1 || copiesToCreate > 100) {
      throw new Error('Number of copies must be between 1 and 100');
    }

    // Create the book first
    const newBook = await bookRepository.createBook(bookData);

    // Now create individual copies for this book
    for (let i = 1; i <= copiesToCreate; i++) {
      const copyData: CreateCopyRequest = {
        book_id: newBook.id,
        copy_number: i.toString().padStart(3, '0'), // e.g., "001", "002", etc.
        status: 'Available',
        acquisition_date: new Date().toISOString().split('T')[0],
      };

      try {
        await bookRepository.createCopy(copyData);
      } catch (error) {
        console.error(
          `Failed to create copy ${i} for book ${newBook.id}:`,
          error
        );
        // Continue creating other copies even if one fails
      }
    }

    return newBook;
  }

  async updateBook(
    id: string,
    bookData: Omit<Book, 'id' | 'created_at'>
  ): Promise<Book> {
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
      const duplicateISBN = existingBooks.find(
        (book) =>
          book.id !== id && // Exclude current book
          book.isbn &&
          book.isbn.replace(/[-\s]/g, '') === isbn
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
      if (bookData.publication_year < -3000) {
        // Allow ancient texts like Homer
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

  async getCopiesForBook(bookId: string) {
    return await bookRepository.getCopiesForBook(bookId);
  }

  async deleteCopy(copyId: string): Promise<boolean> {
    if (!copyId?.trim()) {
      throw new Error('Copy ID is required');
    }
    return await bookRepository.deleteCopy(copyId);
  }
}

export const bookService = new BookService();
