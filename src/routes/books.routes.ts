import express from 'express';
import { BooksController } from '../controllers/books.controller.js';

const router = express.Router();
const booksController = new BooksController();

router.get('/', booksController.getAllBooks);
router.get('/:id', booksController.getBookById);

export default router;
