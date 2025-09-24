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
}

export const bookRepository = new BookRepository();
