import type { 
  Book, 
  CreateBookRequest, 
  UpdateBookRequest, 
  BookSearchOptions 
} from '../../application/models/Book.js';
import { databaseConnection } from '../DatabaseConnection.js';
import { randomUUID } from 'crypto';

export class BookRepository {
  // Get all books with optional pagination
  async getAllBooks(limit?: number, offset?: number): Promise<Book[]> {
    let sql = 'SELECT * FROM books ORDER BY created_at DESC';
    const params: unknown[] = [];
    
    if (limit !== undefined) {
      sql += ' LIMIT ?';
      params.push(limit);
      
      if (offset !== undefined) {
        sql += ' OFFSET ?';
        params.push(offset);
      }
    }
    
    const rows = await databaseConnection.all(sql, params);
    return rows as Book[];
  }

  // Get book by ID
  async getBookById(id: string): Promise<Book | null> {
    const row = await databaseConnection.getOne(
      'SELECT * FROM books WHERE id = ?',
      [id]
    );
    return (row as Book) || null;
  }

  // Get book by ISBN
  async getBookByIsbn(isbn: string): Promise<Book | null> {
    const row = await databaseConnection.getOne(
      'SELECT * FROM books WHERE isbn = ?',
      [isbn]
    );
    return (row as Book) || null;
  }

  // Create new book
  async create(bookData: CreateBookRequest): Promise<Book> {
    const bookId = randomUUID();
    
    const sql = `
      INSERT INTO books (id, title, author, isbn, genre, publication_year, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      bookId,
      bookData.title,
      bookData.author,
      bookData.isbn || null,
      bookData.genre || null,
      bookData.publication_year || null,
      bookData.description || null
    ];
    
    try {
      await databaseConnection.run(sql, params);
      
      const newBook = await this.getBookById(bookId);
      if (!newBook) {
        throw new Error('Failed to retrieve created book');
      }
      
      return newBook;
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed: books.isbn')) {
        throw new Error(`ISBN ${bookData.isbn} already exists`);
      }
      throw error;
    }
  }

  // Update book
  async update(id: string, updates: UpdateBookRequest): Promise<Book | null> {
    const fields = [];
    const values = [];
    
    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.author !== undefined) {
      fields.push('author = ?');
      values.push(updates.author);
    }
    if (updates.isbn !== undefined) {
      fields.push('isbn = ?');
      values.push(updates.isbn);
    }
    if (updates.genre !== undefined) {
      fields.push('genre = ?');
      values.push(updates.genre);
    }
    if (updates.publication_year !== undefined) {
      fields.push('publication_year = ?');
      values.push(updates.publication_year);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    
    if (fields.length === 0) {
      // No updates provided
      return this.getBookById(id);
    }
    
    // Add updated_at timestamp
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const sql = `UPDATE books SET ${fields.join(', ')} WHERE id = ?`;
    
    try {
      await databaseConnection.run(sql, values);
      return this.getBookById(id);
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed: books.isbn')) {
        throw new Error(`ISBN ${updates.isbn} already exists`);
      }
      throw error;
    }
  }

  // Delete book
  async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM books WHERE id = ?';
    
    try {
      await databaseConnection.run(sql, [id]);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Search books
  async search(query: string, limit?: number, offset?: number): Promise<Book[]> {
    const searchPattern = `%${query}%`;
    let sql = `
      SELECT * FROM books 
      WHERE title LIKE ? OR author LIKE ? OR genre LIKE ? OR description LIKE ?
      ORDER BY 
        CASE 
          WHEN title LIKE ? THEN 1
          WHEN author LIKE ? THEN 2
          WHEN genre LIKE ? THEN 3
          ELSE 4
        END,
        created_at DESC
    `;
    
    const params: unknown[] = [
      searchPattern, searchPattern, searchPattern, searchPattern,
      searchPattern, searchPattern, searchPattern
    ];
    
    if (limit !== undefined) {
      sql += ' LIMIT ?';
      params.push(limit);
      
      if (offset !== undefined) {
        sql += ' OFFSET ?';
        params.push(offset);
      }
    }
    
    const rows = await databaseConnection.all(sql, params);
    return rows as Book[];
  }

  // Advanced search with filters
  async advancedSearch(options: BookSearchOptions): Promise<Book[]> {
    const conditions = [];
    const params: unknown[] = [];
    
    if (options.query) {
      conditions.push('(title LIKE ? OR author LIKE ? OR genre LIKE ? OR description LIKE ?)');
      const searchPattern = `%${options.query}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }
    
    if (options.genre) {
      conditions.push('genre = ?');
      params.push(options.genre);
    }
    
    if (options.publicationYearFrom) {
      conditions.push('publication_year >= ?');
      params.push(options.publicationYearFrom);
    }
    
    if (options.publicationYearTo) {
      conditions.push('publication_year <= ?');
      params.push(options.publicationYearTo);
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = options.limit || 50;
    const offset = options.offset || 0;
    
    const sql = `
      SELECT * FROM books 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    params.push(limit, offset);
    
    const rows = await databaseConnection.all(sql, params);
    return rows as Book[];
  }

  // Get books by genre
  async getBooksByGenre(genre: string, limit?: number, offset?: number): Promise<Book[]> {
    let sql = 'SELECT * FROM books WHERE genre = ? ORDER BY created_at DESC';
    const params: unknown[] = [genre];
    
    if (limit !== undefined) {
      sql += ' LIMIT ?';
      params.push(limit);
      
      if (offset !== undefined) {
        sql += ' OFFSET ?';
        params.push(offset);
      }
    }
    
    const rows = await databaseConnection.all(sql, params);
    return rows as Book[];
  }

  // Get books by publication year range
  async getBooksByYearRange(fromYear: number, toYear: number): Promise<Book[]> {
    const sql = `
      SELECT * FROM books 
      WHERE publication_year BETWEEN ? AND ?
      ORDER BY publication_year DESC, created_at DESC
    `;
    
    const rows = await databaseConnection.all(sql, [fromYear, toYear]);
    return rows as Book[];
  }

  // Get all genres
  async getAllGenres(): Promise<string[]> {
    const rows = await databaseConnection.all(
      'SELECT DISTINCT genre FROM books WHERE genre IS NOT NULL ORDER BY genre'
    );
    return rows.map((row: any) => row.genre);
  }

  // Count books
  async count(): Promise<number> {
    const result = await databaseConnection.get('SELECT COUNT(*) as count FROM books');
    return result.count as number;
  }

  // Count books by genre
  async countByGenre(): Promise<{ genre: string; count: number }[]> {
    const rows = await databaseConnection.all(`
      SELECT genre, COUNT(*) as count 
      FROM books 
      WHERE genre IS NOT NULL 
      GROUP BY genre 
      ORDER BY count DESC, genre
    `);
    return rows as { genre: string; count: number }[];
  }

  // Get recent books
  async getRecentBooks(limit = 10): Promise<Book[]> {
    const rows = await databaseConnection.all(
      'SELECT * FROM books ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    return rows as Book[];
  }
}

export const bookRepository = new BookRepository();
