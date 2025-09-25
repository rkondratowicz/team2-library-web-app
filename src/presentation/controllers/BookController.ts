import type { Request, Response } from 'express';
import { bookService } from '../../application/services/BookService.js';

export class BookController {
  async getAllBooks(_req: Request, res: Response): Promise<void> {
    try {
      const books = await bookService.getAllBooks();
      res.json(books);
    } catch (error) {
      console.error('Error fetching books:', error);
      res.status(500).json({ error: 'Failed to fetch books' });
    }
  }

  async getBookById(req: Request, res: Response): Promise<void> {
    try {
      const book = await bookService.getBookById(req.params.id);
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

  async searchBooks(req: Request, res: Response): Promise<void> {
    try {
      const searchTerm = (req.query.q as string) || '';
      const books = await bookService.searchBooks(searchTerm);
      res.json(books);
    } catch (error) {
      console.error('Error searching books:', error);
      res.status(500).json({ error: 'Failed to search books' });
    }
  }
}

export const bookController = new BookController();
