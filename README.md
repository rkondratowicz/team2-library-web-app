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

4. Run database migrations:
```bash
npm run migrate
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

## API Endpoints

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get a specific book
- `POST /api/books` - Add a new book
- `PUT /api/books/:id` - Update a book
- `DELETE /api/books/:id` - Delete a book

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a specific user
- `POST /api/users` - Add a new user
- `PUT /api/users/:id` - Update a user

### Loans
- `GET /api/loans` - Get all loans
- `POST /api/loans` - Create a new loan
- `PUT /api/loans/:id/return` - Return a book
- `GET /api/loans/user/:userId` - Get user's loans

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

## Testing

Run the test suite:
```bash
npm test
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License.