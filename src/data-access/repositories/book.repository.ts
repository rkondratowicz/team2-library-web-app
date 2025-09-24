import { Book } from '../../application/models/book.model.js';
import { DatabaseConnection } from '../database.connection.js';

/**
 * Book Repository  
 * Handles all database interactions for Book entities
 * Implements CRUD operations and data access logic
 */
export class BookRepository {
  private dbConnection: DatabaseConnection;

  constructor() {
    this.dbConnection = new DatabaseConnection();
  }

  /**
   * Find all books
   */
  async findAll(): Promise<Book[]> {
    try {
      const rows = await this.dbConnection.all(
        'SELECT * FROM books ORDER BY created_at DESC'
      );
      
      return rows.map(this.mapRowToBook);
    } catch (error) {
      console.error('Repository error finding all books:', error);
      throw error;
    }
  }

  /**
   * Find book by ID
   */
  async findById(id: number): Promise<Book | null> {
    try {
      const row = await this.dbConnection.get(
        'SELECT * FROM books WHERE id = ?',
        [id]
      );
      
      return row ? this.mapRowToBook(row) : null;
    } catch (error) {
      console.error(`Repository error finding book ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find books by author
   */
  async findByAuthor(author: string): Promise<Book[]> {
    try {
      const rows = await this.dbConnection.all(
        'SELECT * FROM books WHERE author = ? ORDER BY title',
        [author]
      );
      
      return rows.map(this.mapRowToBook);
    } catch (error) {
      console.error(`Repository error finding books by author ${author}:`, error);
      throw error;
    }
  }

  /**
   * Create new book
   */
  async create(book: Omit<Book, 'id'>): Promise<Book> {
    try {
      await this.dbConnection.run(
        'INSERT INTO books (title, author) VALUES (?, ?)',
        [book.title, book.author]
      );
      
      // Get the created book (SQLite doesn't return the inserted row directly)
      const result = await this.dbConnection.get(
        'SELECT * FROM books WHERE title = ? AND author = ? ORDER BY id DESC LIMIT 1',
        [book.title, book.author]
      );
      
      if (!result) {
        throw new Error('Failed to retrieve created book');
      }
      
      return this.mapRowToBook(result);
    } catch (error) {
      console.error('Repository error creating book:', error);
      throw error;
    }
  }

  /**
   * Update book
   */
  async update(id: number, book: Partial<Book>): Promise<Book | null> {
    try {
      const updateFields: string[] = [];
      const params: unknown[] = [];
      
      if (book.title !== undefined) {
        updateFields.push('title = ?');
        params.push(book.title);
      }
      
      if (book.author !== undefined) {
        updateFields.push('author = ?');
        params.push(book.author);
      }
      
      if (updateFields.length === 0) {
        return this.findById(id);
      }
      
      params.push(id);
      
      await this.dbConnection.run(
        `UPDATE books SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );
      
      return this.findById(id);
    } catch (error) {
      console.error(`Repository error updating book ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete book
   */
  async delete(id: number): Promise<boolean> {
    try {
      await this.dbConnection.run('DELETE FROM books WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error(`Repository error deleting book ${id}:`, error);
      throw error;
    }
  }

  /**
   * Map database row to Book model
   */
  private mapRowToBook(row: any): Book {
    return {
      id: row.id,
      title: row.title,
      author: row.author,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
    };
  }

  /**
   * Get database connection for migrations
   */
  getDatabaseConnection(): DatabaseConnection {
    return this.dbConnection;
  }
}