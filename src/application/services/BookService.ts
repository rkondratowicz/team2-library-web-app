import { bookRepository } from '../../data-access/repositories/BookRepository.js';
import type { Book } from '../models/Book.js';

export class BookService {
  async getAllBooks(): Promise<Book[]> {
    return await bookRepository.getAllBooks();
  }

  async getBookById(id: string): Promise<Book | null> {
    return await bookRepository.getBookById(id);
  }
}

export const bookService = new BookService();
