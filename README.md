# Library Web App

A modern web-based library management system built with Express.js, TypeScript, and Bootstrap. Features a clean, responsive interface for browsing and managing book collections.

## Features

- **Book Display**: View books in a responsive Bootstrap table format
- **Real-time Updates**: Auto-refresh book list every 30 seconds
- **Responsive Design**: Bootstrap 5.3.2 with custom styling
- **Modern UI**: Clean cards, gradients, and smooth animations
- **TypeScript**: Enhanced code reliability and developer experience
- **SQLite Database**: Lightweight database for book storage

## Tech Stack

- **Backend**: Express.js with TypeScript ES modules
- **Frontend**: Bootstrap 5.3.2 with custom CSS
- **Database**: SQLite3
- **Code Quality**: Biome 2.2.4 for formatting and linting

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

Available commands:

```bash
# Format all files
npm run format

# Run linting checks
npm run lint

# Run both format and lint checks with auto-fix (recommended)
npm run check
```

### Biome Configuration

The project includes a `biome.json` configuration file with:
- TypeScript support
- Automatic import organization with `node:` protocol for built-ins
- Code style rules (2 spaces, single quotes)
- ES5 trailing commas
- Recommended linting rules
- Maximum line width of 80 characters

## UI and Styling

The application uses **Bootstrap 5.3.2** for responsive design with custom CSS enhancements:

- **External CSS**: Custom styles in `/public/styles.css`
- **Responsive Design**: Mobile-first approach with Bootstrap grid
- **Modern UI**: Cards, gradients, hover effects, and smooth animations
- **Professional Theme**: Clean color palette and typography
- **Custom Components**: Enhanced table styling and loading states
## Sample Data

The application includes sample book data. You can populate the database using:

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

## Project Structure

```
team2-library-web-app/
├── app.ts               # Express application entry point
├── database.ts          # SQLite database service
├── library.db          # SQLite database file
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── biome.json          # Biome formatter/linter config
├── public/             # Static web assets
│   ├── index.html      # Main HTML page
│   └── styles.css      # Custom CSS styles
├── dist/               # Compiled JavaScript (generated)
├── database/
│   └── migrations/     # Database migration files
└── scripts/            # Database utility scripts
    └── populate-sample-books.sql
```

## API Endpoints

### GET `/`
Serves the main application page

### GET `/api/books`
Returns all books in JSON format
```json
[
  {
    "id": 1,
    "title": "1984",
    "author": "George Orwell"
  }
]
```

## Contributing

1. Create a new branch for your feature
2. Make your changes following the existing code style
3. Run `npm run check` to format and lint your code
4. Test your changes locally
5. Submit a pull request

## License

This project is licensed under the ISC License.