# Book Copies Feature Implementation Tasks

## Overview
Complete implementation of the book copies feature for tracking individual physical copies of books. This feature manages inventory at the copy level and tracks availability status for borrowing, supporting the PRD requirement for "multiple physical copies of the same book with unique copy IDs".

## Task Dependencies
**Prerequisites**: Books table must exist (foreign key dependency)  
**Blocks**: Borrowing Transactions feature (needs book_copies table)

---

## Task 1: Book Copies Database Schema
**Priority**: High  
**Status**: 🔴 **NOT STARTED**  
**Estimated Time**: 1-2 hours

### Description
Create the book_copies table schema to track individual physical copies of books, supporting the PRD requirement for copy management and availability tracking.

### PRD Requirements Reference
From PRD Section 2.1.2 Copy Management:
- Add copies: Register multiple physical copies with unique copy IDs
- Track copy status: Monitor availability (Available, Borrowed)
- Copy history: View borrowing history for individual copies

### Database Schema Requirements
- [ ] Create `book_copies` table with inventory tracking:
  - [ ] `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - internal database ID
  - [ ] `book_id` (INTEGER NOT NULL) - foreign key to books.id
  - [ ] `copy_id` (VARCHAR(20) UNIQUE NOT NULL) - physical copy identifier (e.g., "B001-C001")
  - [ ] `status` (ENUM: 'available', 'borrowed', 'maintenance', 'lost', 'damaged')
  - [ ] `condition` (ENUM: 'new', 'good', 'fair', 'poor') - physical condition
  - [ ] `location` (VARCHAR(50)) - shelf location in library (e.g., "A-3-2", "Fiction-01")
  - [ ] `acquisition_date` (DATE) - when copy was acquired by library
  - [ ] `notes` (TEXT) - maintenance notes, condition details, history
  - [ ] `created_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)
  - [ ] `updated_at` (DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

- [ ] Add database constraints:
  - [ ] Foreign key to books table: `FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE`
  - [ ] `copy_id` must be unique across all copies in library
  - [ ] Status must be valid enum value with CHECK constraint
  - [ ] Condition must be valid enum value with CHECK constraint
  - [ ] Acquisition date cannot be in the future

- [ ] Add performance indexes:
  - [ ] Index on `book_id` (for finding copies of a specific book)
  - [ ] Unique index on `copy_id` (for fast unique copy lookups)
  - [ ] Index on `status` (for availability queries - "available" copies)
  - [ ] Composite index on `book_id, status` (for available copies of specific book)
  - [ ] Index on `location` (for physical inventory management)

### Implementation Steps
1. Create migration file `004-create-book-copies-table.sql`
2. Add table creation with all constraints and foreign keys
3. Add indexes for performance optimization
4. Add status and condition enum validation
5. Test migration with existing books data
6. Verify foreign key relationships work correctly

### Acceptance Criteria
- Book copies table created successfully with all required fields
- Foreign key relationship with books table works correctly
- All constraints and enums function properly
- Indexes improve copy lookup and availability query performance
- Can create multiple copies for the same book
- Copy IDs are enforced as unique across entire system

---

## Task 2: Book Copies Repository Implementation
**Priority**: High  
**Status**: 🔴 **NOT STARTED**  
**Estimated Time**: 2-3 hours

### Description
Implement repository layer for book copies CRUD operations and inventory management queries.

### Repository Requirements
- [ ] Create `BookCopyRepository` class in `src/data-access/repositories/`:
  - [ ] `create(copyData: CreateBookCopyRequest): Promise<BookCopy>`
  - [ ] `findById(id: number): Promise<BookCopy | null>`
  - [ ] `findByCopyId(copyId: string): Promise<BookCopy | null>`
  - [ ] `findByBookId(bookId: number): Promise<BookCopy[]>`
  - [ ] `findAvailableByBookId(bookId: number): Promise<BookCopy[]>`
  - [ ] `findByStatus(status: BookCopyStatus): Promise<BookCopy[]>`
  - [ ] `findByLocation(location: string): Promise<BookCopy[]>`
  - [ ] `update(id: number, updates: UpdateBookCopyRequest): Promise<BookCopy | null>`
  - [ ] `updateStatus(copyId: string, status: BookCopyStatus): Promise<BookCopy | null>`
  - [ ] `delete(id: number): Promise<boolean>`
  - [ ] `count(): Promise<number>`
  - [ ] `countByStatus(status: BookCopyStatus): Promise<number>`

- [ ] Inventory management methods:
  - [ ] `getInventorySummary(bookId?: number): Promise<InventorySummary>`
  - [ ] `findAvailableCopies(): Promise<BookCopyWithBook[]>` - all available copies with book info
  - [ ] `findCopiesNeedingMaintenance(): Promise<BookCopy[]>` - damaged/poor condition copies
  - [ ] `findCopiesByCondition(condition: BookCopyCondition): Promise<BookCopy[]>`
  - [ ] `generateNextCopyId(bookId: number): Promise<string>` - auto-generate copy ID
  - [ ] `checkCopyIdExists(copyId: string): Promise<boolean>`
  - [ ] `getCopyWithBookDetails(copyId: string): Promise<BookCopyWithBook | null>`

- [ ] Reporting and analytics methods:
  - [ ] `getMostBorrowedCopies(limit: number): Promise<CopyBorrowStats[]>` - future use
  - [ ] `getCopyUtilizationStats(): Promise<CopyUtilizationStats>` - usage analytics
  - [ ] `findCopiesAcquiredInDateRange(start: Date, end: Date): Promise<BookCopy[]>`

- [ ] Error handling:
  - [ ] Handle duplicate copy_id errors with clear messages
  - [ ] Handle invalid book_id foreign key errors
  - [ ] Handle invalid status transitions gracefully
  - [ ] Handle not found scenarios appropriately
  - [ ] Handle constraint violations with descriptive errors

### Implementation Steps
1. Create `src/data-access/repositories/BookCopyRepository.ts`
2. Implement all basic CRUD methods with proper SQL queries
3. Add inventory-specific query methods
4. Implement copy ID generation logic (e.g., "B001-C001", "B001-C002")
5. Add comprehensive error handling and logging
6. Add database connection management and transactions

### Acceptance Criteria
- All CRUD operations work correctly with book_copies table
- Inventory queries return accurate availability and status data
- Copy ID generation creates unique, well-formatted identifiers
- Status updates work reliably for copy lifecycle management
- Errors are handled gracefully with helpful messages
- Foreign key relationships maintain data integrity

---

## Task 3: Book Copies Business Logic & Validation
**Priority**: High  
**Status**: 🔴 **NOT STARTED**  
**Estimated Time**: 1-2 hours

### Description
Implement business logic and validation for book copies inventory management according to PRD requirements.

### PRD Business Rules
From PRD Section 4.2 Book Management Rules:
- Copy IDs must be unique across entire collection
- Cannot delete books with active borrows (applies to copies too)
- Proper inventory tracking and status management

### Service Requirements
- [ ] Create `BookCopyService` class in `src/application/services/`:
  - [ ] Handle complete copy acquisition workflow
  - [ ] Validate copy data before database operations
  - [ ] Implement PRD business rules for copy management
  - [ ] Handle copy status transitions and availability logic

- [ ] **Input validation**:
  - [ ] Copy ID format validation (library-specific format like "B001-C001")
  - [ ] Status transition validation (valid state changes only)
  - [ ] Condition assessment validation (realistic condition progression)
  - [ ] Location format validation (shelf location standards)
  - [ ] Acquisition date validation (not in future, reasonable range)

- [ ] **Business logic methods**:
  - [ ] `acquireNewCopy(bookId: number, copyData: AcquisitionRequest): Promise<BookCopy>` - complete acquisition workflow
  - [ ] `updateCopyCondition(copyId: string, condition: BookCopyCondition, notes?: string): Promise<BookCopy>`
  - [ ] `markCopyForMaintenance(copyId: string, reason: string): Promise<BookCopy>`
  - [ ] `returnCopyFromMaintenance(copyId: string): Promise<BookCopy>`
  - [ ] `retireCopy(copyId: string, reason: string): Promise<boolean>` - remove from circulation
  - [ ] `checkCopyAvailability(copyId: string): Promise<AvailabilityStatus>`

- [ ] **Copy ID generation and management**:
  - [ ] Auto-generate copy IDs with format: `B{bookId}-C{sequentialNumber}` (e.g., "B001-C001", "B001-C002")
  - [ ] Handle copy ID conflicts and regeneration
  - [ ] Validate copy ID format and uniqueness
  - [ ] Support custom copy ID formats for different book types

- [ ] **Status transition management**:
  - [ ] Validate status changes (available → borrowed → available)
  - [ ] Handle maintenance workflow (available → maintenance → available)
  - [ ] Manage lost/damaged copy reporting
  - [ ] Prevent invalid status transitions

- [ ] **Availability management**:
  - [ ] Check copy availability before borrowing operations
  - [ ] Reserve copies for borrowing transactions
  - [ ] Release reservations when transactions complete/fail
  - [ ] Handle simultaneous availability requests

### Implementation Steps
1. Create `src/application/services/BookCopyService.ts`
2. Add comprehensive validation rules for all copy fields
3. Implement copy ID generation algorithm with collision handling
4. Add status transition logic with validation
5. Add inventory management methods (acquisition, maintenance, retirement)
6. Add availability checking and reservation logic

### Acceptance Criteria
- Invalid copy data is rejected with clear, helpful messages
- Copy IDs are generated consistently and uniquely
- Status transitions follow logical business rules
- Availability is accurately tracked and managed
- Inventory operations work smoothly across copy lifecycle
- Business rules align with PRD requirements

---

## Task 4: Book Copies Data Model & Types
**Priority**: Medium  
**Status**: 🔴 **NOT STARTED**  
**Estimated Time**: 30 minutes

### Description
Define TypeScript interfaces and types for book copies and inventory management.

### Type Definitions Required
- [ ] Create `src/application/models/BookCopy.ts` with:
  - [ ] `BookCopy` interface matching database schema exactly
  - [ ] All database fields properly typed
  - [ ] Optional fields marked correctly (`location?`, `notes?`)
  - [ ] Date fields as Date objects
  - [ ] Status and condition enum types

- [ ] Core enum types:
  - [ ] `BookCopyStatus` enum ('available', 'borrowed', 'maintenance', 'lost', 'damaged')
  - [ ] `BookCopyCondition` enum ('new', 'good', 'fair', 'poor')

- [ ] Request/response types:
  - [ ] `CreateBookCopyRequest` - fields needed for copy creation/acquisition
  - [ ] `UpdateBookCopyRequest` - partial copy data for updates
  - [ ] `AcquisitionRequest` - data needed for acquiring new copies
  - [ ] `CopySearchOptions` - search and filter parameters
  - [ ] `CopyStatusUpdate` - status change request with notes

- [ ] Business logic types:
  - [ ] `InventorySummary` - counts by status and condition for a book or entire collection
  - [ ] `BookCopyWithBook` - copy information with associated book details
  - [ ] `AvailabilityStatus` - copy availability check result
  - [ ] `CopyBorrowStats` - borrowing statistics for individual copies
  - [ ] `CopyUtilizationStats` - usage analytics across copy collection

- [ ] Utility types:
  - [ ] `CopyLocationInfo` - shelf location and organization data
  - [ ] `MaintenanceRecord` - copy maintenance history entry
  - [ ] `CopyAcquisitionData` - complete data for new copy acquisition

### Implementation Steps
1. Create `src/application/models/BookCopy.ts`
2. Define core BookCopy interface matching database schema
3. Define status and condition enums with all valid values
4. Create request/response types for API operations
5. Add business logic types for service layer operations
6. Export all types for use across application layers

### Acceptance Criteria
- All book copy-related types are properly defined and documented
- Types match database schema exactly
- Enums cover all valid status and condition values
- Types support all use cases in repository, service, and API layers
- Request/response types support complete copy management workflows

---

## Task 5: Enhanced Books Repository Integration
**Priority**: Medium  
**Status**: 🔴 **NOT STARTED**  
**Estimated Time**: 1 hour

### Description
Update the existing BookRepository to include copy information and availability data.

### Integration Requirements
- [ ] Update `BookRepository` methods to include copy information:
  - [ ] `findWithCopies(id: number): Promise<BookWithCopies | null>` - book with all its copies
  - [ ] `findAvailableBooks(): Promise<BookWithAvailability[]>` - books with available copies
  - [ ] `getBookAvailability(bookId: number): Promise<BookAvailabilityInfo>` - copy counts by status
  - [ ] Update existing search methods to include availability information

- [ ] Add copy-aware query methods:
  - [ ] Include available copy count in book listings
  - [ ] Filter books by copy availability (has available copies vs. all borrowed)
  - [ ] Sort books by availability (most available copies first)
  - [ ] Include copy location information in book details

- [ ] Add aggregate data methods:
  - [ ] `getBooksWithLowInventory(threshold: number): Promise<BookWithCopyCount[]>` - books with few available copies
  - [ ] `getBooksNeedingMoreCopies(): Promise<BookDemandAnalysis[]>` - high-demand books
  - [ ] `getCollectionOverview(): Promise<CollectionSummary>` - total books, copies, availability

### Implementation Steps
1. Update existing `src/data-access/repositories/BookRepository.ts`
2. Add JOIN queries with book_copies table for availability information
3. Add aggregate queries for inventory management
4. Update existing methods to optionally include copy data
5. Test performance of JOIN queries with indexes

### Acceptance Criteria
- Books can be retrieved with complete copy information
- Availability status is accurately calculated from copy data
- Search results include meaningful availability information
- Performance remains acceptable with JOIN operations
- Integration doesn't break existing book functionality

---

## Task 6: Book Copies API Controller
**Priority**: Medium  
**Status**: 🔴 **NOT STARTED**  
**Estimated Time**: 2-3 hours

### Description
Implement REST API endpoints for book copies management according to PRD requirements.

### PRD API Requirements
From PRD Section 2.1.2 Copy Management:
- Add copies: Register multiple physical copies with unique copy IDs
- Track copy status: Monitor availability
- Copy history: View borrowing history for individual copies

### API Endpoints Required
- [ ] Create `BookCopyController` class in `src/presentation/controllers/`:
  - [ ] `GET /api/books/:bookId/copies` - list all copies of a specific book
  - [ ] `GET /api/copies` - list all copies with pagination and filtering
  - [ ] `GET /api/copies/available` - list all available copies
  - [ ] `GET /api/copies/status/:status` - filter copies by status
  - [ ] `GET /api/copies/:copyId` - get copy details by copy_id
  - [ ] `POST /api/books/:bookId/copies` - add new copy to a book
  - [ ] `PUT /api/copies/:copyId` - update copy details (condition, location, notes)
  - [ ] `PUT /api/copies/:copyId/status` - change copy status
  - [ ] `DELETE /api/copies/:copyId` - remove copy from collection
  - [ ] `GET /api/inventory/summary` - inventory summary report
  - [ ] `GET /api/inventory/maintenance` - copies needing maintenance

- [ ] **Request/response handling**:
  - [ ] Proper HTTP status codes for all scenarios
  - [ ] Request validation for copy data and status changes
  - [ ] Error response formatting with helpful messages
  - [ ] Pagination support for copy listings
  - [ ] Include book details in copy responses when relevant
  - [ ] Support for bulk operations (add multiple copies at once)

- [ ] **Copy acquisition workflow**:
  - [ ] Validate book exists before adding copies
  - [ ] Auto-generate copy IDs if not provided
  - [ ] Set default status (available) and condition (new) for new copies
  - [ ] Return complete copy information after creation

- [ ] **Status management endpoints**:
  - [ ] Validate status transitions before updates
  - [ ] Log status change history
  - [ ] Handle maintenance workflow through API
  - [ ] Prevent invalid operations (e.g., delete borrowed copy)

### Implementation Steps
1. Create `src/presentation/controllers/BookCopyController.ts`
2. Implement all API endpoints with proper routing and middleware
3. Add comprehensive request validation for all endpoints
4. Add proper error handling and HTTP status codes
5. Implement inventory reporting endpoints
6. Add bulk operations for efficient copy management
7. Test all endpoints with various input scenarios

### Acceptance Criteria
- All endpoints work correctly and follow RESTful principles
- Proper HTTP status codes returned for all scenarios
- Copy-book relationships handled properly in responses
- Inventory operations work efficiently through API
- Error responses are consistent, helpful, and informative
- Bulk operations handle multiple copies efficiently

---

## Task 7: Book Copies Unit Tests
**Priority**: High  
**Status**: 🔴 **NOT STARTED**  
**Estimated Time**: 3-4 hours

### Description
Create comprehensive unit tests for book copies feature.

### Testing Requirements
- [ ] **Repository tests** (`tests/repositories/BookCopyRepository.test.ts`):
  - [ ] Test all CRUD operations with various copy data scenarios
  - [ ] Test inventory management queries (availability, status filtering)
  - [ ] Test foreign key relationships with books table
  - [ ] Test copy ID generation and uniqueness enforcement
  - [ ] Test status transitions and validation
  - [ ] Test constraint violations and error handling

- [ ] **Service tests** (`tests/services/BookCopyService.test.ts`):
  - [ ] Test copy acquisition workflow end-to-end
  - [ ] Test copy ID generation algorithm with collision handling
  - [ ] Test validation logic for all copy fields
  - [ ] Test status transition business rules
  - [ ] Test inventory management operations
  - [ ] Test availability checking and reservation logic

- [ ] **Controller tests** (`tests/controllers/BookCopyController.test.ts`):
  - [ ] Test all API endpoints with various inputs
  - [ ] Test request validation and error responses
  - [ ] Test inventory operations through API
  - [ ] Test bulk copy operations
  - [ ] Test status management endpoints
  - [ ] Test HTTP status codes and response formats

- [ ] **Integration tests** (`tests/integration/BookCopy.test.ts`):
  - [ ] Test book-copy relationships across all layers
  - [ ] Test availability calculations with real database
  - [ ] Test inventory workflows from API to database
  - [ ] Test copy lifecycle (acquisition → borrowing → return → maintenance)

### Test Data and Utilities
- [ ] Create book copy test data factories
- [ ] Create test utilities for copy operations
- [ ] Set up test database with copies schema
- [ ] Create mock data generators for various copy scenarios
- [ ] Create test helpers for status transitions and validations

### Implementation Steps
1. Set up Jest testing environment for book copies feature
2. Create test data factories and utilities
3. Write comprehensive repository tests covering all methods
4. Write service layer tests including business logic and validation
5. Write controller tests for all API endpoints
6. Write integration tests for complete copy management workflows
7. Ensure 95%+ code coverage for book copies feature

### Acceptance Criteria
- 95%+ code coverage for all book copies feature components
- All business rules and validation logic thoroughly tested
- Foreign key relationships and constraints tested
- Status transition logic verified with edge cases
- Error conditions and edge cases covered comprehensively
- Tests run reliably and quickly (under 45 seconds total)
- Integration tests verify complete copy management workflows

---

## Task 8: Book Copies Seed Data
**Priority**: Low  
**Status**: 🔴 **NOT STARTED**  
**Estimated Time**: 30 minutes

### Description
Create realistic seed data for book copies testing and development.

### Seed Data Requirements
- [ ] Create copy data for existing books (`scripts/seed-book-copies.sql`):
  - [ ] Multiple copies for popular books (2-5 copies each for ~10 books)
  - [ ] Single copies for specialized/rare books (~10 books)
  - [ ] Various status distributions (80% available, 15% borrowed, 5% maintenance/damaged)
  - [ ] Realistic copy IDs following established format ("B001-C001", "B001-C002", etc.)

- [ ] Copy variety for testing:
  - [ ] Different physical conditions (60% good, 25% new, 10% fair, 5% poor)
  - [ ] Various acquisition dates (spread over past 3 years)
  - [ ] Mix of maintenance statuses for testing workflows
  - [ ] Different shelf locations ("A-1-1", "Fiction-02", "Science-B3", etc.)

- [ ] Test scenario coverage:
  - [ ] Books with all copies available (for testing availability)
  - [ ] Books with all copies borrowed (for testing out-of-stock scenarios)
  - [ ] Copies in maintenance (for testing maintenance workflows)
  - [ ] Copies with detailed notes (for testing note functionality)

### Implementation Steps
1. Create `scripts/seed-book-copies.sql` script
2. Generate realistic copy data for existing seed books
3. Ensure copy IDs follow consistent format and are unique
4. Include variety in all fields (status, condition, location, dates)
5. Test seed script execution with existing books data
6. Verify foreign key relationships work correctly

### Acceptance Criteria
- Seed data creates realistic copy distribution across books
- All copy data passes validation rules and constraints
- Copy IDs are unique and follow consistent format
- Provides good test scenarios for inventory management and availability
- Includes various copy conditions and statuses for comprehensive testing
- Works seamlessly with existing book seed data

---

## Feature Completion Checklist

### Database Layer ✓
- [ ] Book copies table created with proper schema matching PRD requirements
- [ ] Foreign key relationship with books table established and working
- [ ] Indexes added for performance (availability queries, copy lookups)
- [ ] Constraints ensure data integrity (unique copy IDs, valid status/condition)

### Repository Layer ✓
- [ ] All CRUD operations implemented and tested
- [ ] Inventory management queries working (availability, status filtering)
- [ ] Copy ID generation working correctly with collision handling
- [ ] Error handling comprehensive and user-friendly

### Business Layer ✓
- [ ] Copy acquisition workflow implemented per PRD requirements
- [ ] Validation rules implemented for all copy fields
- [ ] Status transition logic working (available ↔ borrowed ↔ maintenance)
- [ ] Inventory management complete (acquisition, maintenance, retirement)

### API Layer ✓
- [ ] All endpoints implemented following RESTful principles
- [ ] Request/response handling correct and consistent
- [ ] Inventory operations available via API
- [ ] Error responses consistent and helpful

### Integration ✓
- [ ] Book repository updated with copy-aware methods
- [ ] Availability calculations working correctly
- [ ] Book-copy relationships solid across all layers

### Testing ✓
- [ ] Unit tests comprehensive with 95%+ coverage
- [ ] Integration tests verify relationships and workflows
- [ ] All error conditions and edge cases covered
- [ ] Performance tested with realistic data volumes

### Data ✓
- [ ] Seed data available with realistic copy distribution
- [ ] Test data factories created for automated testing
- [ ] Development data covers various inventory scenarios

---

## Success Criteria

### PRD Compliance ✓
- [ ] **Add Copies**: Register multiple physical copies with unique copy IDs
- [ ] **Track Copy Status**: Monitor each copy's availability (Available, Borrowed)
- [ ] **Copy Management**: Complete inventory management system
- [ ] **Data Structure**: Proper copy tracking per PRD requirements

### Technical Requirements ✓
- [ ] **Performance**: Fast availability queries with proper indexing
- [ ] **Validation**: Copy ID uniqueness and status transition rules enforced
- [ ] **API**: RESTful endpoints supporting all copy operations
- [ ] **Integration**: Seamless integration with books feature

### Business Rules ✓
- [ ] **Unique Copy IDs**: Each copy has unique identifier across entire collection
- [ ] **Status Management**: Proper copy lifecycle management
- [ ] **Inventory Tracking**: Accurate availability and condition tracking

**Total Estimated Time: 10-15 hours**

---

## Integration Points

### Dependencies for Other Features
Once Book Copies feature is complete, it enables:
1. **Borrowing System**: Individual copies can be borrowed (foreign key relationship)
2. **Advanced Reporting**: Copy utilization analytics per PRD
3. **Inventory Management**: Physical copy tracking and maintenance workflows

### Database Relationships
- **Current**: `book_copies.book_id` references `books.id`
- **Future**: `borrowing_transactions` will reference `book_copies.id`
- **Integration**: Copy availability affects book search and display

---

## Next Steps After Completion

1. **Validate Integration**: Test book copies with enhanced books feature
2. **Prepare for Borrowing**: Members + Book Copies will enable core borrowing system
3. **Consider Advanced Features**: Copy history, utilization analytics, maintenance scheduling
4. **Performance Optimization**: Test copy operations under expected load
5. **User Interface**: May want to add copy management UI for librarians