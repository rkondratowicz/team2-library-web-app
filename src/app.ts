import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { databaseConnection } from './data-access/DatabaseConnection.js';
import { bookController } from './presentation/controllers/BookController.js';
import { memberController } from './presentation/controllers/MemberController.js';

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
app.get(
  '/api/books/with-copies',
  bookController.getAllBooksWithCopies.bind(bookController)
);
app.get('/api/books/search', bookController.searchBooks.bind(bookController));
app.get(
  '/api/books/search/with-copies',
  bookController.searchBooksWithCopies.bind(bookController)
);
app.post('/api/books', bookController.createBook.bind(bookController));
app.get('/api/books/:id', bookController.getBookById.bind(bookController));
app.put('/api/books/:id', bookController.updateBook.bind(bookController));
app.delete('/api/books/:id', bookController.deleteBook.bind(bookController));

// Copy management routes
app.get(
  '/api/books/:id/with-copies',
  bookController.getBookWithCopies.bind(bookController)
);
app.post(
  '/api/books/:id/copies',
  bookController.addCopyToBook.bind(bookController)
);
app.delete('/api/copies/:id', bookController.deleteCopy.bind(bookController));

// Member API routes
app.get('/api/members', memberController.getAllMembers.bind(memberController));
app.get(
  '/api/members/search',
  memberController.searchMembers.bind(memberController)
);
app.get(
  '/api/members/statistics',
  memberController.getMemberStatistics.bind(memberController)
);
app.get(
  '/api/members/status/:status',
  memberController.getMembersByStatus.bind(memberController)
);
app.get(
  '/api/members/member-id/:memberId',
  memberController.getMemberByMemberId.bind(memberController)
);
app.post('/api/members', memberController.createMember.bind(memberController));
app.get(
  '/api/members/:id',
  memberController.getMemberById.bind(memberController)
);
app.put(
  '/api/members/:id',
  memberController.updateMember.bind(memberController)
);
app.put(
  '/api/members/:id/status',
  memberController.updateMemberStatus.bind(memberController)
);
app.delete(
  '/api/members/:id',
  memberController.deleteMember.bind(memberController)
);

// Initialize database and start server
async function startServer() {
  try {
    await databaseConnection.connect();
    await databaseConnection.runMigrations();
    await databaseConnection.populateSampleData();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Books API available at http://localhost:${PORT}/api/books`);
      console.log(
        `Members API available at http://localhost:${PORT}/api/members`
      );
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
