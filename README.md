# Library Web App

A modern web-based library management system built with Express.js, TypeScript, and Bootstrap. Features a clean, responsive interface for browsing book collections with real-time updates.

## Features

- **Book Display**: Interactive table format with Bootstrap styling
- **Responsive Design**: Mobile-friendly interface with Bootstrap 5.3.2
- **Real-time Updates**: Auto-refresh book list every 30 seconds  
- **Modern UI**: Cards, gradients, hover effects, and smooth animations
- **TypeScript**: Enhanced code reliability and developer experience
- **SQLite Database**: Lightweight database for book storage
- **Code Quality**: Biome 2.2.4 for consistent formatting and linting

## Tech Stack

- **Backend**: Express.js with TypeScript ES modules
- **Frontend**: Bootstrap 5.3.2 with custom CSS enhancements
- **Database**: SQLite3
- **Code Quality**: Biome 2.2.4 formatter and linter

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/rkondratowicz/team2-library-web-app.git
cd team2-library-web-app
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Start the server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

> **Note**: The application uses SQLite for data storage, which doesn't require additional setup. The database will be created automatically on first run.


## Development

Start the development server:
```bash
npm run dev
```

Build the project:
```bash
npm run build
```

Clean build artifacts:
```bash
npm run clean
```

## Code Quality and Formatting

This project uses [Biome](https://biomejs.dev/) v2.2.4 for code formatting and linting. Biome is a high-performance formatter, linter, and toolchain for JavaScript, TypeScript, JSON, and CSS.

**Available commands:**

```bash
# Format all files
npm run format

# Run linting checks only
npm run lint

# Format + apply safe fixes (recommended)
npm run check

# Apply all fixes including unsafe ones (use with caution)
npm run check -- --unsafe
```

### Biome Configuration

The project includes a `biome.json` configuration file with:
- **TypeScript support** with ES modules
- **Automatic import organization** with `node:` protocol for built-ins  
- **Code style rules**: 2 spaces, single quotes, ES5 trailing commas
- **Recommended linting rules** for code quality
- **Maximum line width** of 80 characters
- **Semicolon enforcement** for consistency

## UI and Styling

The application features a modern, responsive design:

- **Bootstrap 5.3.2**: Responsive grid system and components
- **Custom CSS**: Enhanced styling in `/public/styles.css`
- **Professional Theme**: Clean color palette with gradients
- **Interactive Elements**: Hover effects and smooth animations
- **Mobile-First**: Optimized for all device sizes
## Sample Data

The application includes sample book data for testing:

```sql
INSERT INTO books (title, author) VALUES
('1984', 'George Orwell'),
('To Kill a Mockingbird', 'Harper Lee'),
('The Great Gatsby', 'F. Scott Fitzgerald'),
('Pride and Prejudice', 'Jane Austen'),
('The Catcher in the Rye', 'J.D. Salinger'),
('One Hundred Years of Solitude', 'Gabriel García Márquez'),
('Brave New World', 'Aldous Huxley'),
('The Lord of the Rings', 'J.R.R. Tolkien');
```

## API Endpoints

### `GET /`
Serves the main application page with Bootstrap UI

### `GET /api/books`
Returns all books in JSON format:
```json
[
  {
    "id": 1,
    "title": "1984", 
    "author": "George Orwell"
  }
]
```

## Project Structure

This project follows a **3-Tier Architecture** for better maintainability and separation of concerns:

```
src/
├── app.ts                          # Main entry point
├── presentation/                   # 📱 Presentation Tier
│   ├── controllers/
│   │   ├── book.controller.ts     # API request handlers
│   │   └── view.controller.ts     # Page rendering
│   └── views/
│       └── public/                # Static files (HTML, CSS)
│           ├── index.html
│           └── styles.css
├── application/                    # 🔧 Application Tier (Business Logic)
│   ├── services/
│   │   └── book.service.ts        # Business rules & validation
│   └── models/
│       └── book.model.ts          # Data models & validation
└── data-access/                   # 💾 Data Access Tier
    ├── repositories/
    │   └── book.repository.ts     # Database operations
    ├── migrations/
    │   └── 001-create-first-table.sql
    └── database.connection.ts     # Database connection manager
dist/                              # Compiled JavaScript output
scripts/                          # Database utility scripts
ARCHITECTURE.md                   # Detailed architecture documentation
```

### Architecture Benefits
- **Separation of Concerns**: Each tier has a single responsibility
- **Maintainability**: Changes in one tier don't affect others  
- **Testability**: Each layer can be tested independently
- **Scalability**: Easier to scale individual components

## Contributing

1. Create a new branch for your feature
2. Make your changes following the existing code style
3. Run `npm run check` to format and lint your code
4. Test your changes locally with `npm run dev`
5. Submit a pull request

## License

This project is licensed under the ISC License.