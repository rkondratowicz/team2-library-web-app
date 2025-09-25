import type { Request, Response } from 'express';
import { bookService } from '../../application/services/BookService.js';

export class BookController {
  async getAllBooks(req: Request, res: Response): Promise<void> {
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
      const searchTerm = req.query.q as string || '';
      const books = await bookService.searchBooks(searchTerm);
      res.json(books);
    } catch (error) {
      console.error('Error searching books:', error);
      res.status(500).json({ error: 'Failed to search books' });
    }
  }

  async createBook(req: Request, res: Response): Promise<void> {
    try {
      const bookData = req.body;
      const newBook = await bookService.createBook(bookData);
      res.status(201).json(newBook);
    } catch (error) {
      console.error('Error creating book:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create book' });
      }
    }
  }
}

export const bookController = new BookController();
