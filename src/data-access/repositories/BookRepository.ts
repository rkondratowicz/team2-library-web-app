import type { Book } from '../../application/models/Book.js';
import type {
  BookCopy,
  BookWithCopies,
  CreateCopyRequest,
  UpdateCopyRequest,
} from '../../application/models/BookCopy.js';
import { databaseConnection } from '../DatabaseConnection.js';

export class BookRepository {
  async getAllBooks(): Promise<Book[]> {
    const rows = await databaseConnection.all(
      'SELECT * FROM books ORDER BY created_at DESC'
    );
    return rows as Book[];
  }

  async getBookById(id: string): Promise<Book | null> {
    const row = await databaseConnection.getOne(
      'SELECT * FROM books WHERE id = ?',
      [id]
    );
    return (row as Book) || null;
  }

  async searchBooks(searchTerm: string): Promise<Book[]> {
    const rows = await databaseConnection.all(
      `SELECT * FROM books 
       WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ? OR genre LIKE ? OR CAST(publication_year as TEXT) LIKE ?
       ORDER BY created_at DESC`,
      [
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
      ]
    );
    return rows as Book[];
  }

  async createBook(book: Omit<Book, 'id' | 'created_at'>): Promise<Book> {
    const id = crypto.randomUUID();
    const _result = await databaseConnection.run(
      `INSERT INTO books (id, title, author, isbn, genre, publication_year, description, copies_available) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        book.title,
        book.author,
        book.isbn,
        book.genre,
        book.publication_year,
        book.description,
        book.copies_available || 1,
      ]
    );

    const createdBook = await this.getBookById(id);
    if (!createdBook) {
      throw new Error('Failed to retrieve created book');
    }
    return createdBook;
  }

  async updateBook(
    id: string,
    book: Omit<Book, 'id' | 'created_at'>
  ): Promise<Book> {
    const result = await databaseConnection.run(
      `UPDATE books SET 
       title = ?, author = ?, isbn = ?, genre = ?, publication_year = ?, description = ?, copies_available = ?
       WHERE id = ?`,
      [
        book.title,
        book.author,
        book.isbn,
        book.genre,
        book.publication_year,
        book.description,
        book.copies_available || 1,
        id,
      ]
    );

    if (result.changes === 0) {
      throw new Error('Book not found or no changes made');
    }

    const updatedBook = await this.getBookById(id);
    if (!updatedBook) {
      throw new Error('Failed to retrieve updated book');
    }
    return updatedBook;
  }

  async deleteBook(id: string): Promise<boolean> {
    const result = await databaseConnection.run(
      'DELETE FROM books WHERE id = ?',
      [id]
    );

    // Check if any rows were affected (book was actually deleted)
    return result.changes > 0;
  }

  // Copy management methods
  async getCopiesForBook(bookId: string): Promise<BookCopy[]> {
    const rows = await databaseConnection.all(
      'SELECT * FROM book_copies WHERE book_id = ? ORDER BY copy_number',
      [bookId]
    );
    return rows as BookCopy[];
  }

  async getCopyById(copyId: string): Promise<BookCopy | null> {
    const row = await databaseConnection.getOne(
      'SELECT * FROM book_copies WHERE id = ?',
      [copyId]
    );
    return (row as BookCopy) || null;
  }

  async createCopy(copyData: CreateCopyRequest): Promise<BookCopy> {
    const copyId = crypto.randomUUID();

    await databaseConnection.run(
      `INSERT INTO book_copies (id, book_id, copy_number, status, condition_notes, acquisition_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        copyId,
        copyData.book_id,
        copyData.copy_number,
        copyData.status || 'Available',
        copyData.condition_notes || null,
        copyData.acquisition_date || new Date().toISOString().split('T')[0],
      ]
    );

    const newCopy = await this.getCopyById(copyId);
    if (!newCopy) {
      throw new Error('Failed to retrieve created copy');
    }
    return newCopy;
  }

  async updateCopy(
    copyId: string,
    updateData: UpdateCopyRequest
  ): Promise<BookCopy> {
    const existingCopy = await this.getCopyById(copyId);
    if (!existingCopy) {
      throw new Error('Copy not found');
    }

    await databaseConnection.run(
      `UPDATE book_copies 
       SET copy_number = ?, status = ?, condition_notes = ?, acquisition_date = ?
       WHERE id = ?`,
      [
        updateData.copy_number ?? existingCopy.copy_number,
        updateData.status ?? existingCopy.status,
        updateData.condition_notes ?? existingCopy.condition_notes,
        updateData.acquisition_date ?? existingCopy.acquisition_date,
        copyId,
      ]
    );

    const updatedCopy = await this.getCopyById(copyId);
    if (!updatedCopy) {
      throw new Error('Failed to retrieve updated copy');
    }
    return updatedCopy;
  }

  async deleteCopy(copyId: string): Promise<boolean> {
    const result = await databaseConnection.run(
      'DELETE FROM book_copies WHERE id = ?',
      [copyId]
    );

    return result.changes > 0;
  }

  async getBookWithCopies(bookId: string): Promise<BookWithCopies | null> {
    const book = await this.getBookById(bookId);
    if (!book) {
      return null;
    }

    const copies = await this.getCopiesForBook(bookId);
    const availableCopies = copies.filter(
      (copy) => copy.status === 'Available'
    ).length;

    return {
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      genre: book.genre,
      publication_year: book.publication_year,
      description: book.description,
      created_at: book.created_at || new Date().toISOString(),
      copies,
      total_copies: copies.length,
      available_copies: availableCopies,
    };
  }
}

export const bookRepository = new BookRepository();
