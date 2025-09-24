import { Book, BookModel } from '../models/book.model.js';
import { BookRepository } from '../../data-access/repositories/book.repository.js';

/**
 * Book Service
 * Enforces business rules and uses data access layer to read/store data
 * Contains the business logic for book operations
 */
export class BookService {
  private bookRepository: BookRepository;

  constructor() {
    this.bookRepository = new BookRepository();
  }

  /**
   * Get all books with business logic applied
   */
  async getAllBooks(): Promise<Book[]> {
    try {
      const books = await this.bookRepository.findAll();
      
      // Business logic: Sort books by title
      return books.sort((a: Book, b: Book) => a.title.localeCompare(b.title));
    } catch (error) {
      console.error('Service error getting all books:', error);
      throw new Error('Failed to retrieve books');
    }
  }

  /**
   * Get book by ID with business validation
   */
  async getBookById(id: string): Promise<Book | null> {
    // Business rule: Validate ID format
    if (!id || isNaN(Number(id))) {
      throw new Error('Invalid book ID format');
    }

    try {
      return await this.bookRepository.findById(Number(id));
    } catch (error) {
      console.error(`Service error getting book ${id}:`, error);
      throw new Error('Failed to retrieve book');
    }
  }

  /**
   * Create new book with business validation
   */
  async createBook(bookData: Partial<Book>): Promise<Book> {
    const book = new BookModel(bookData);
    
    // Enforce business rules
    const validation = book.validate();
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Business rule: Check for duplicate titles by same author
    const existingBooks = await this.bookRepository.findByAuthor(book.author);
    const duplicate = existingBooks.find(
      (b: Book) => b.title.toLowerCase() === book.title.toLowerCase()
    );
    
    if (duplicate) {
      throw new Error('A book with this title already exists by this author');
    }

    try {
      return await this.bookRepository.create(book.toJSON());
    } catch (error) {
      console.error('Service error creating book:', error);
      throw new Error('Failed to create book');
    }
  }

  /**
   * Update book with business validation
   */
  async updateBook(id: string, bookData: Partial<Book>): Promise<Book | null> {
    if (!id || isNaN(Number(id))) {
      throw new Error('Invalid book ID format');
    }

    const existingBook = await this.bookRepository.findById(Number(id));
    if (!existingBook) {
      throw new Error('Book not found');
    }

    const updatedBook = new BookModel({ ...existingBook, ...bookData });
    const validation = updatedBook.validate();
    
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    try {
      return await this.bookRepository.update(Number(id), updatedBook.toJSON());
    } catch (error) {
      console.error(`Service error updating book ${id}:`, error);
      throw new Error('Failed to update book');
    }
  }

  /**
   * Delete book with business validation
   */
  async deleteBook(id: string): Promise<boolean> {
    if (!id || isNaN(Number(id))) {
      throw new Error('Invalid book ID format');
    }

    const existingBook = await this.bookRepository.findById(Number(id));
    if (!existingBook) {
      throw new Error('Book not found');
    }

    try {
      return await this.bookRepository.delete(Number(id));
    } catch (error) {
      console.error(`Service error deleting book ${id}:`, error);
      throw new Error('Failed to delete book');
    }
  }
}