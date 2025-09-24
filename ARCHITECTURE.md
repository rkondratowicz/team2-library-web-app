# 3-Tier Architecture Documentation

This project follows a **3-Tier Architecture** pattern for better separation of concerns and maintainability.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION TIER                        │
│  📱 User Interactions: rendering views, redirects,         │
│     handling user input, calls methods from services       │
├─────────────────────────────────────────────────────────────┤
│  Controllers/     Views/                                    │
│  ├── book.controller.ts    ├── public/                     │
│  └── view.controller.ts    │   ├── index.html              │
│                            │   └── styles.css              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION TIER                         │
│  🔧 Business Logic: enforce business rules,                │
│     uses data access layer to read/store data              │
├─────────────────────────────────────────────────────────────┤
│  Services/              Models/                             │
│  └── book.service.ts    └── book.model.ts                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    DATA ACCESS TIER                         │
│  💾 Interactions with DB: CRUD operations,                 │
│     migration files                                         │
├─────────────────────────────────────────────────────────────┤
│  Repositories/           Migrations/                        │
│  └── book.repository.ts  └── 001-create-first-table.sql    │
│                                                             │
│  database.connection.ts                                     │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
src/
├── app.ts                          # Main entry point
├── presentation/                   # Presentation Tier
│   ├── controllers/
│   │   ├── book.controller.ts     # Handles book API requests
│   │   └── view.controller.ts     # Handles page rendering
│   └── views/
│       └── public/                # Static files (HTML, CSS, JS)
│           ├── index.html
│           └── styles.css
├── application/                    # Application Tier (Business Logic)
│   ├── services/
│   │   └── book.service.ts        # Business rules & validation
│   └── models/
│       └── book.model.ts          # Data models & validation
└── data-access/                   # Data Access Tier
    ├── repositories/
    │   └── book.repository.ts     # Database operations
    ├── migrations/
    │   └── 001-create-first-table.sql
    └── database.connection.ts     # Database connection manager
```

## Tier Responsibilities

### 🎨 Presentation Tier
- **Controllers**: Handle HTTP requests/responses
- **Views**: Render UI and manage user interactions
- **No business logic** - delegates to Application Tier

### 🧠 Application Tier
- **Services**: Contain business logic and rules
- **Models**: Define data structure and validation
- **Orchestrates** data flow between Presentation and Data Access

### 💾 Data Access Tier
- **Repositories**: Handle database operations (CRUD)
- **Database Connection**: Manage database connectivity
- **Migrations**: Database schema management
- **No business logic** - pure data operations

## Benefits

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Maintainability**: Changes in one tier don't affect others
3. **Testability**: Each layer can be tested independently
4. **Scalability**: Easier to scale individual components
5. **Code Reusability**: Services can be reused across controllers