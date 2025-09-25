# Step 1: Database Migration for Members Table

## Overview
Create a SQL migration file to add the members table to the library database with all necessary fields and constraints.

## Database Schema Design

### Members Table Structure
```sql
CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
    registration_date DATE DEFAULT CURRENT_DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Key Design Decisions
- **id**: Auto-incrementing integer primary key for internal use
- **member_id**: Human-readable unique identifier (e.g., "MEM-2024-001")
- **status**: Enum-like constraint with CHECK to enforce valid values
- **registration_date**: Date member joined (separate from created_at)
- **Timestamps**: Standard created_at and updated_at for auditing

### Indexes for Performance
```sql
CREATE INDEX IF NOT EXISTS idx_members_member_id ON members(member_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_registration_date ON members(registration_date);
```

## Migration File Location
- **Path**: `src/data-access/migrations/002-create-members-table.sql`
- **Follows existing pattern**: Similar to `001-create-first-table.sql`

## Implementation Tasks
1. Create migration SQL file with table schema
2. Add indexes for common query patterns
3. Include sample data insert statements (optional)
4. Update database connection to run migrations

## Next Steps
After this migration:
- Define TypeScript Member model interfaces
- Create MemberRepository for database operations
- Implement MemberService for business logic