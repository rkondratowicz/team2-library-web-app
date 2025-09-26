import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { databaseConnection } from './src/data-access/DatabaseConnection.js';
import { bookController } from './src/presentation/controllers/BookController.js';
import { memberController } from './src/presentation/controllers/MemberController.js';
import { rentalController } from './src/presentation/controllers/RentalController.js';
import { transactionController } from './src/presentation/controllers/TransactionController.js';
import { dashboardController } from './src/presentation/controllers/DashboardController.js';
import searchRoutes from './src/presentation/routes/searchRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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

// Transaction/Borrowing routes
app.post(
  '/api/transactions/borrow',
  transactionController.borrowBook.bind(transactionController)
);
app.post(
  '/api/transactions/:transactionId/return',
  transactionController.returnBook.bind(transactionController)
);
app.get(
  '/api/transactions/active',
  transactionController.getAllActiveTransactions.bind(transactionController)
);
app.get(
  '/api/transactions/overdue',
  transactionController.getOverdueTransactions.bind(transactionController)
);
app.get(
  '/api/transactions/stats',
  transactionController.getBorrowingStats.bind(transactionController)
);
app.get(
  '/api/transactions/:transactionId',
  transactionController.getTransactionDetails.bind(transactionController)
);

// Member-related transaction routes
app.get(
  '/api/members/:memberId/borrowing',
  transactionController.getMemberBorrowingSummary.bind(transactionController)
);
app.get(
  '/api/members/:memberId/can-borrow',
  transactionController.checkMemberBorrowingEligibility.bind(
    transactionController
  )
);

// Quick borrow route for frontend convenience
app.post(
  '/api/copies/:copyId/borrow',
  transactionController.quickBorrowCopy.bind(transactionController)
);

// Alternative quick borrow route that matches frontend expectations
app.post(
  '/api/transactions/quickBorrowCopy',
  transactionController.quickBorrowCopyByBookId.bind(transactionController)
);

// Rental Analytics API routes
app.get(
  '/api/rentals/books/:bookId/current-borrowers',
  rentalController.getCurrentBorrowersForBook.bind(rentalController)
);
app.get(
  '/api/rentals/books/:bookId/borrowers/all',
  rentalController.getAllBorrowersForBook.bind(rentalController)
);
app.get(
  '/api/rentals/books/:bookId/summary',
  rentalController.getBookBorrowingSummary.bind(rentalController)
);
app.get(
  '/api/rentals/members/:memberId/current-books',
  rentalController.getCurrentBooksByMember.bind(rentalController)
);
app.get(
  '/api/rentals/members/:memberId/books/all',
  rentalController.getAllBooksByMember.bind(rentalController)
);
app.get(
  '/api/rentals/active-summary',
  rentalController.getActiveSummary.bind(rentalController)
);
app.get(
  '/api/rentals/statistics',
  rentalController.getRentalStatistics.bind(rentalController)
);
app.get(
  '/api/rentals/associations',
  rentalController.getMemberBookAssociations.bind(rentalController)
);
app.get(
  '/api/rentals/overdue',
  rentalController.getOverdueRentals.bind(rentalController)
);

// Dashboard API routes
app.get(
  '/api/dashboard/overview',
  dashboardController.getDashboardOverview.bind(dashboardController)
);
app.get(
  '/api/dashboard/widgets',
  dashboardController.getDashboardWidgets.bind(dashboardController)
);
app.get(
  '/api/dashboard/widgets/:widgetId',
  dashboardController.getDashboardWidget.bind(dashboardController)
);
app.get(
  '/api/dashboard/alerts',
  dashboardController.getSystemAlerts.bind(dashboardController)
);
app.get(
  '/api/dashboard/actions',
  dashboardController.getQuickActions.bind(dashboardController)
);
app.get(
  '/api/dashboard/metrics',
  dashboardController.getPerformanceMetrics.bind(dashboardController)
);
app.get(
  '/api/dashboard/reports/:reportType',
  dashboardController.generateDashboardReport.bind(dashboardController)
);

// Search API routes - Task 9
app.use('/api/search', searchRoutes);

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
      console.log(
        `Transactions API available at http://localhost:${PORT}/api/transactions`
      );
      console.log(
        `Rentals API available at http://localhost:${PORT}/api/rentals`
      );
      console.log(
        `Dashboard API available at http://localhost:${PORT}/api/dashboard`
      );
      console.log(
        `Search API available at http://localhost:${PORT}/api/search`
      );
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
