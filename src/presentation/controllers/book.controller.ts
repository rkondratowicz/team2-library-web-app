import { Request, Response } from 'express';
import { BookService } from '../../application/services/book.service.js';

export class BookController {
  private bookService: BookService;

  constructor() {
    this.bookService = new BookService();
  }

  /**
   * Get all books
   * Handles user interaction for retrieving book list
   */
  async getAllBooks(_req: Request, res: Response): Promise<void> {
    try {
      const books = await this.bookService.getAllBooks();
      res.json(books);
    } catch (error) {
      console.error('Error fetching books:', error);
      res.status(500).json({ error: 'Failed to fetch books' });
    }
  }

  /**
   * Get book by ID
   * Handles user interaction for retrieving specific book
   */
  async getBookById(req: Request, res: Response): Promise<void> {
    try {
      const book = await this.bookService.getBookById(req.params.id);
      if (book) {
        res.json(book);
      } else {
        res.status(404).json({ error: 'Book not found' });
      }
    } catch (error) {
      console.error('Error fetching book:', error);
      res.status(500).json({ error: 'Failed to fetch book' });
    }
  }
}