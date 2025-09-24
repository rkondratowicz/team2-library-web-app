import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { BookController } from './presentation/controllers/book.controller.js';
import { ViewController } from './presentation/controllers/view.controller.js';
import { DatabaseConnection } from './data-access/database.connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Serve static files from presentation/views/public directory  
app.use(express.static(path.join(__dirname, 'presentation', 'views', 'public')));

// Initialize controllers
const bookController = new BookController();
const viewController = new ViewController();

// Presentation tier routes - handle user interactions
app.get('/', viewController.renderMainPage.bind(viewController));

// API routes - handle data interactions
app.get('/api/books', bookController.getAllBooks.bind(bookController));
app.get('/api/books/:id', bookController.getBookById.bind(bookController));

// Initialize database and start server
async function startServer() {
  try {
    // Initialize data access layer
    const dbConnection = new DatabaseConnection();
    await dbConnection.connect();
    await dbConnection.runMigrations();
    await dbConnection.populateSampleData();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 Books API available at http://localhost:${PORT}/api/books`);
      console.log('🏗️  3-Tier Architecture:');
      console.log('   📱 Presentation Tier: Controllers & Views');
      console.log('   🔧 Application Tier: Services & Models (Business Logic)');
      console.log('   💾 Data Access Tier: Repositories & Database');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();