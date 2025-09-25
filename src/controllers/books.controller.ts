import { Request, Response } from 'express';
import { databaseService } from '../services/database.service.js';

export class BooksController {
  async getAllBooks(req: Request, res: Response): Promise<void> {
    try {
      const books = await databaseService.getAllBooks();
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch books' });
    }
  }

  async getBookById(req: Request, res: Response): Promise<void> {
    try {
      const book = await databaseService.getBookById(req.params.id);
      if (!book) {
        res.status(404).json({ error: 'Book not found' });
        return;
      }
      res.json(book);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch book' });
    }
  }
}
