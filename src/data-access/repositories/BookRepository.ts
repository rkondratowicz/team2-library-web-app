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
      [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
    );
    return rows as Book[];
  }
}

export const bookRepository = new BookRepository();
