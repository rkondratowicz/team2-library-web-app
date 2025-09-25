import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { databaseConnection } from './data-access/DatabaseConnection.js';
import { bookController } from './presentation/controllers/BookController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// API routes
app.get('/api/books', bookController.getAllBooks.bind(bookController));
app.get('/api/books/search', bookController.searchBooks.bind(bookController));
app.post('/api/books', bookController.createBook.bind(bookController));
app.get('/api/books/:id', bookController.getBookById.bind(bookController));

// Initialize database and start server
async function startServer() {
  try {
    await databaseConnection.connect();
    await databaseConnection.runMigrations();
    await databaseConnection.populateSampleData();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Books API available at http://localhost:${PORT}/api/books`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
