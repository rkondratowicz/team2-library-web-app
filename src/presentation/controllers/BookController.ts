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

  async updateBook(req: Request, res: Response): Promise<void> {
    try {
      const bookId = req.params.id;
      const bookData = req.body;
      const updatedBook = await bookService.updateBook(bookId, bookData);
      res.status(200).json(updatedBook);
    } catch (error) {
      console.error('Error updating book:', error);
      if (error instanceof Error) {
        if (error.message === 'Book not found') {
          res.status(404).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Failed to update book' });
      }
    }
  }

  async deleteBook(req: Request, res: Response): Promise<void> {
    try {
      const bookId = req.params.id;
      await bookService.deleteBook(bookId);
      res.status(204).send(); // 204 No Content for successful deletion
    } catch (error) {
      console.error('Error deleting book:', error);
      if (error instanceof Error) {
        if (error.message === 'Book not found') {
          res.status(404).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Failed to delete book' });
      }
    }
  }
}

export const bookController = new BookController();
