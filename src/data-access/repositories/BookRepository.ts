import type { Book } from '../../application/models/Book.js';
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
    const result = await databaseConnection.run(
      `INSERT INTO books (id, title, author, isbn, genre, publication_year, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        book.title,
        book.author,
        book.isbn,
        book.genre,
        book.publication_year,
        book.description,
      ]
    );

    const createdBook = await this.getBookById(id);
    if (!createdBook) {
      throw new Error('Failed to retrieve created book');
    }
    return createdBook;
  }

  async updateBook(id: string, book: Omit<Book, 'id' | 'created_at'>): Promise<Book> {
    const result = await databaseConnection.run(
      `UPDATE books SET 
       title = ?, author = ?, isbn = ?, genre = ?, publication_year = ?, description = ?
       WHERE id = ?`,
      [book.title, book.author, book.isbn, book.genre, book.publication_year, book.description, id]
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
}

export const bookRepository = new BookRepository();
