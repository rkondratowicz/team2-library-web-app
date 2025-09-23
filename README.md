# Library Management System

A web-based library management system built with Express.js and TypeScript, designed to help manage books, patrons, and lending operations efficiently.

## Features

- Book management (add, update, delete, search)
- User management (librarians and patrons)
- Loan management (check-out, check-in, reservations)
- Search functionality
- TypeScript for enhanced code reliability

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database

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

3. Configure environment variables:
Create a `.env` file in the root directory and add:
```
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/library_db
```


## Development

Start the development server:
```bash
npm run dev
```

Build the project:
```bash
npm run build
```
## DummyData

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
├── src/
│   ├── controllers/    # Route controllers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── utils/          # Utility functions
│   └── app.ts          # Application entry point
├── migrations/         # Database migrations
├── tests/             # Test files
└── tsconfig.json      # TypeScript configuration
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License.