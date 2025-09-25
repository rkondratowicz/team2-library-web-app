# Members Feature Implementation Tasks

## Overview
Complete implementation of the members feature for library member management according to PRD requirements. This is a standalone feature with no dependencies on other tables.

## Task Dependencies
**Prerequisites**: None (independent table)  
**Blocks**: Borrowing Transactions feature (needs members table to exist)

---

## Task 1: Members Database Schema
**Priority**: High  
**Status**: 🔴 **NOT STARTED**  
**Estimated Time**: 1-2 hours

### Description
Create the members table schema based on PRD requirements for library member management.

### PRD Requirements Reference
From PRD Section 2.2 Member Management:
- Member registration with name, contact information, address, member ID
- Member profiles with borrowing history and limits
- Search members by name or ID

### Database Schema Requirements
- [ ] Create `members` table with PRD-specified fields:
  - [ ] `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - internal database ID
  - [ ] `member_id` (VARCHAR(20) UNIQUE NOT NULL) - external member identifier (e.g., "M001", "MEM2023001")
  - [ ] `first_name` (VARCHAR(50) NOT NULL)
  - [ ] `last_name` (VARCHAR(50) NOT NULL)
  - [ ] `email` (VARCHAR(100) UNIQUE) - optional, unique when provided
  - [ ] `phone` (VARCHAR(20)) - optional, formatted phone number
  - [ ] `address` (TEXT) - complete address information
  - [ ] `status` (ENUM: 'active', 'inactive', 'suspended') - membership status
  - [ ] `registration_date` (DATE NOT NULL DEFAULT CURRENT_DATE)
  - [ ] `created_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)
  - [ ] `updated_at` (DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

- [ ] Add database constraints:
  - [ ] `member_id` must be unique across all members
  - [ ] `email` must be unique when not null
  - [ ] Email format validation using CHECK constraint
  - [ ] Phone number format validation (optional)
  - [ ] First name and last name cannot be empty strings
  - [ ] Status must be one of the valid enum values

- [ ] Add performance indexes:
  - [ ] Unique index on `member_id` (for external ID lookups)
  - [ ] Index on `last_name, first_name` (for name searches)
  - [ ] Index on `email` (for email lookups and uniqueness)
  - [ ] Index on `status` (for filtering active/inactive members)
  - [ ] Index on `registration_date` (for member registration analytics)

### Implementation Steps
1. Create migration file `003-create-members-table.sql`
2. Add table creation with all constraints and indexes
3. Add member status enum validation
4. Create member ID generation strategy
5. Test migration on development database

### Acceptance Criteria
- Members table created successfully with all required fields
- All constraints work correctly (test with sample data)
- Indexes improve member search performance
- Invalid data is rejected by database constraints
- Member ID uniqueness is enforced

---

## Task 2: Members Repository Implementation
**Priority**: High  
**Status**: 🔴 **NOT STARTED**  
**Estimated Time**: 2-3 hours

### Description
Implement repository layer for members CRUD operations and member-specific queries.

### Repository Requirements
- [ ] Create `MemberRepository` class in `src/data-access/repositories/`:
  - [ ] `create(member: CreateMemberRequest): Promise<Member>`
  - [ ] `findById(id: number): Promise<Member | null>` - find by internal ID
  - [ ] `findByMemberId(memberId: string): Promise<Member | null>` - find by member_id
  - [ ] `findByEmail(email: string): Promise<Member | null>`
  - [ ] `findAll(options?: PaginationOptions): Promise<Member[]>`
  - [ ] `search(query: string): Promise<Member[]>` - search by name or member ID
  - [ ] `findByStatus(status: MemberStatus): Promise<Member[]>`
  - [ ] `update(id: number, updates: UpdateMemberRequest): Promise<Member | null>`
  - [ ] `delete(id: number): Promise<boolean>`
  - [ ] `count(): Promise<number>`
  - [ ] `countByStatus(status: MemberStatus): Promise<number>`

- [ ] Member-specific query methods:
  - [ ] `findActiveMembers(): Promise<Member[]>`
  - [ ] `findNewMembers(days: number): Promise<Member[]>` - registered within X days
  - [ ] `findMembersByRegistrationDateRange(start: Date, end: Date): Promise<Member[]>`
  - [ ] `generateNextMemberId(): Promise<string>` - auto-generate unique member IDs
  - [ ] `checkMemberIdExists(memberId: string): Promise<boolean>`
  - [ ] `getMemberStatistics(): Promise<MemberStats>`

- [ ] Error handling:
  - [ ] Handle duplicate member_id errors with clear messages
  - [ ] Handle duplicate email errors appropriately
  - [ ] Handle not found scenarios gracefully
  - [ ] Handle constraint violations with descriptive errors
  - [ ] Handle database connection issues

### Implementation Steps
1. Create `src/data-access/repositories/MemberRepository.ts`
2. Implement all CRUD methods with proper SQL queries
3. Add member-specific query methods
4. Implement member ID generation logic
5. Add comprehensive error handling
6. Add database connection management

### Acceptance Criteria
- All CRUD operations work correctly with members table
- Search functionality returns relevant results (by name, member ID)
- Member-specific queries return accurate data
- Member ID generation creates unique, formatted IDs
- Errors are handled gracefully with helpful messages

---

## Task 3: Members Business Logic & Validation
**Priority**: High  
**Status**: 🔴 **NOT STARTED**  
**Estimated Time**: 1-2 hours

### Description
Implement business logic and validation for members management according to PRD requirements.

### PRD Business Rules
From PRD Section 4.3 Member Management Rules:
- Each member must have unique member ID
- Cannot delete members with active borrows
- Member registration workflow requirements

### Service Requirements
- [ ] Create `MemberService` class in `src/application/services/`:
  - [ ] Handle complete member registration workflow
  - [ ] Validate member data before database operations
  - [ ] Implement PRD business rules
  - [ ] Integrate with repository layer

- [ ] **Input validation**:
  - [ ] Member ID format validation (library-specific format like "M001", "MEM2023001")
  - [ ] Email format validation with proper regex
  - [ ] Phone number format validation (various formats acceptable)
  - [ ] Name validation (length limits, allowed characters)
  - [ ] Address validation (reasonable length limits)
  - [ ] Status validation (must be valid enum value)

- [ ] **Business logic methods**:
  - [ ] `registerNewMember(memberData: CreateMemberRequest): Promise<Member>` - complete registration workflow
  - [ ] `updateMemberProfile(id: number, updates: UpdateMemberRequest): Promise<Member>`
  - [ ] `deactivateMember(id: number): Promise<Member>` - change status to inactive
  - [ ] `reactivateMember(id: number): Promise<Member>` - reactivate inactive member
  - [ ] `suspendMember(id: number, reason: string): Promise<Member>` - suspend for policy violations
  - [ ] `validateMemberEligibility(memberId: string): Promise<EligibilityStatus>` - check borrowing eligibility

- [ ] **Data processing**:
  - [ ] Auto-generate unique member IDs with library-specific format
  - [ ] Data sanitization (trim whitespace, normalize case)
  - [ ] Email and phone number normalization
  - [ ] Duplicate detection (by email or similar member info)
  - [ ] Member status management with business rule enforcement

### Implementation Steps
1. Create `src/application/services/MemberService.ts`
2. Add comprehensive validation rules for all fields
3. Implement member registration workflow
4. Add member ID generation algorithm
5. Add status management logic with business rules
6. Add data sanitization and normalization methods

### Acceptance Criteria
- Invalid member data is rejected with clear, helpful messages
- Member registration workflow follows PRD requirements
- Business rules are enforced consistently
- Data is properly sanitized before storage
- Member ID generation creates unique, well-formatted IDs
- Status changes follow proper business logic

---

## Task 4: Members Data Model & Types
**Priority**: Medium  
**Status**: 🔴 **NOT STARTED**  
**Estimated Time**: 30 minutes

### Description
Define TypeScript interfaces and types for members management.

### Type Definitions Required
- [ ] Create `src/application/models/Member.ts` with:
  - [ ] `Member` interface matching database schema exactly
  - [ ] All database fields properly typed
  - [ ] Optional fields marked correctly (`email?`, `phone?`, `address?`)
  - [ ] Date fields as Date objects
  - [ ] Status enum type

- [ ] Supporting request/response types:
  - [ ] `CreateMemberRequest` - fields needed for member registration
  - [ ] `UpdateMemberRequest` - partial member data for updates
  - [ ] `MemberSearchOptions` - search and filter parameters
  - [ ] `MemberSearchResult` - search results with metadata
  - [ ] `PaginationOptions` - pagination parameters for member listings

- [ ] Business logic types:
  - [ ] `MemberStatus` enum ('active', 'inactive', 'suspended')
  - [ ] `MemberStats` - statistics for reporting (active count, new registrations, etc.)
  - [ ] `EligibilityStatus` - borrowing eligibility check result
  - [ ] `MemberProfile` - complete member info for profile display

- [ ] Utility types:
  - [ ] `MemberListItem` - summary info for member listings
  - [ ] `MemberRegistrationData` - data needed for registration process

### Implementation Steps
1. Create `src/application/models/Member.ts`
2. Define core Member interface matching database schema
3. Define MemberStatus enum with all valid values
4. Create request/response types for API operations
5. Add business logic types for service layer
6. Export all types for use across application layers

### Acceptance Criteria
- All member-related types are properly defined and documented
- Types match database schema exactly
- Types support all use cases in repository, service, and API layers
- Status enum covers all valid member states
- Request/response types support complete member management workflows

---

## Task 5: Members API Controller
**Priority**: Medium  
**Status**: 🔴 **NOT STARTED**  
**Estimated Time**: 2-3 hours

### Description
Implement REST API endpoints for members management according to PRD requirements.

### PRD API Requirements
From PRD Section 2.2 Member Management:
- Add members (registration)
- Edit member information
- Search members by name or ID
- Member profile with borrowing history and current borrows

### API Endpoints Required
- [ ] Create `MemberController` class in `src/presentation/controllers/`:
  - [ ] `GET /api/members` - list all members with pagination and filtering
  - [ ] `GET /api/members/search?q=query` - search members by name or member ID
  - [ ] `GET /api/members/:id` - get member by internal database ID
  - [ ] `GET /api/members/member-id/:memberId` - get member by member_id
  - [ ] `GET /api/members/email/:email` - find member by email (for verification)
  - [ ] `POST /api/members` - create new member (registration)
  - [ ] `PUT /api/members/:id` - update member profile
  - [ ] `PUT /api/members/:id/status` - change member status (activate/deactivate/suspend)
  - [ ] `DELETE /api/members/:id` - delete member (with validation for active borrows)
  - [ ] `GET /api/members/stats` - member statistics (active count, new registrations, etc.)

- [ ] **Request/response handling**:
  - [ ] Proper HTTP status codes for all scenarios
  - [ ] Request validation with detailed error messages
  - [ ] Consistent error response formatting
  - [ ] Pagination support for member listings
  - [ ] Support for filtering by status, registration date, etc.
  - [ ] Rich member information in responses

- [ ] **Member registration flow**:
  - [ ] Validate all required fields before creation
  - [ ] Check for duplicate email/member_id
  - [ ] Auto-generate member_id if not provided
  - [ ] Return complete member profile after successful registration

- [ ] **Search and filtering**:
  - [ ] Search by member name (first, last, or full name)
  - [ ] Search by member_id (exact or partial match)
  - [ ] Filter by member status
  - [ ] Filter by registration date range
  - [ ] Combine multiple search criteria

### Implementation Steps
1. Create `src/presentation/controllers/MemberController.ts`
2. Implement all API endpoints with proper routing
3. Add comprehensive request validation
4. Add proper error handling and HTTP status codes
5. Implement pagination and filtering logic
6. Add member registration workflow endpoints
7. Test all endpoints with various input scenarios

### Acceptance Criteria
- All endpoints work correctly and follow RESTful principles
- Proper HTTP status codes returned for all scenarios
- Request validation prevents invalid member data
- Error responses are consistent, helpful, and follow established format
- Member registration flow is smooth and user-friendly
- Search and filtering functionality works as expected
- Pagination handles large member datasets efficiently

---

## Task 6: Frontend Members Interface
**Priority**: Low  
**Status**: 🔴 **NOT STARTED**  
**Estimated Time**: 2-3 hours

### Description
Create frontend interface for members management (optional for database-focused implementation).

### Frontend Requirements (Optional)
- [ ] **Members listing page**:
  - [ ] Display members in table format with all key information
  - [ ] Search and filter controls
  - [ ] Pagination for large member lists
  - [ ] Member status indicators (active/inactive/suspended)

- [ ] **Member registration form**:
  - [ ] Form for adding new members
  - [ ] Client-side validation
  - [ ] Success/error handling

- [ ] **Member profile page**:
  - [ ] Display complete member information
  - [ ] Edit member details functionality
  - [ ] Member status management controls

### Implementation Steps
1. Add members section to existing frontend
2. Create member listing table with search/filter
3. Add member registration form
4. Add member profile display and editing
5. Test frontend integration with member API

### Acceptance Criteria
- Members interface is user-friendly and intuitive
- All member management functions work through UI
- Form validation prevents invalid data entry
- Integration with backend API works seamlessly

---

## Task 7: Members Unit Tests
**Priority**: High  
**Status**: 🔴 **NOT STARTED**  
**Estimated Time**: 3-4 hours

### Description
Create comprehensive unit tests for members feature.

### Testing Requirements
- [ ] **Repository tests** (`tests/repositories/MemberRepository.test.ts`):
  - [ ] Test all CRUD operations with various data scenarios
  - [ ] Test member search functionality (by name, member_id, email)
  - [ ] Test member-specific queries (active members, new registrations, etc.)
  - [ ] Test error conditions (duplicate member_id, duplicate email, not found)
  - [ ] Test constraint violations and proper error handling
  - [ ] Test member ID generation and uniqueness

- [ ] **Service tests** (`tests/services/MemberService.test.ts`):
  - [ ] Test member registration workflow end-to-end
  - [ ] Test validation logic for all member fields
  - [ ] Test business rules (status changes, eligibility checks)
  - [ ] Test data sanitization and normalization
  - [ ] Test error handling and validation messages
  - [ ] Test member ID generation algorithm

- [ ] **Controller tests** (`tests/controllers/MemberController.test.ts`):
  - [ ] Test all API endpoints with various inputs
  - [ ] Test request validation and error responses
  - [ ] Test member registration flow through API
  - [ ] Test search and filtering functionality
  - [ ] Test pagination and member listing
  - [ ] Test HTTP status codes and response formats

- [ ] **Integration tests** (`tests/integration/Member.test.ts`):
  - [ ] Test complete member management workflows
  - [ ] Test database operations with actual database
  - [ ] Test member registration from API to database
  - [ ] Test error scenarios across all layers

### Test Data and Utilities
- [ ] Create member test data factories
- [ ] Create test utilities for member operations
- [ ] Set up test database with member schema
- [ ] Create mock data generators for various test scenarios

### Implementation Steps
1. Set up Jest testing environment for members feature
2. Create test data factories and utilities
3. Write comprehensive repository tests
4. Write service layer tests including business logic
5. Write controller tests for all API endpoints
6. Write integration tests for complete workflows
7. Ensure 95%+ code coverage for members feature

### Acceptance Criteria
- 95%+ code coverage for all members feature components
- All business rules and validation logic thoroughly tested
- Error conditions and edge cases covered comprehensively
- Tests run reliably and quickly (under 30 seconds total)
- Test data is isolated and doesn't interfere between tests
- Integration tests verify complete member management workflows

---

## Task 8: Members Seed Data
**Priority**: Low  
**Status**: 🔴 **NOT STARTED**  
**Estimated Time**: 30 minutes

### Description
Create realistic seed data for members testing and development.

### Seed Data Requirements
- [ ] Create diverse member dataset (`scripts/seed-members.sql`):
  - [ ] 50+ members with varied, realistic profiles
  - [ ] Mix of member statuses (mostly active, some inactive/suspended)
  - [ ] Realistic names, emails, and contact information
  - [ ] Various registration dates (spread over past 2 years)
  - [ ] Different address types (local, out-of-state, etc.)

- [ ] Member variety for testing:
  - [ ] Different age groups and demographics (varied names)
  - [ ] Mix of complete and partial contact information (some missing phone/email)
  - [ ] Different member ID formats to test formatting flexibility
  - [ ] Various registration patterns (seasonal, steady, etc.)

- [ ] Test scenario coverage:
  - [ ] Members with similar names (test search disambiguation)
  - [ ] Members with same email domain (test uniqueness)
  - [ ] Long-time members vs. recent registrations
  - [ ] Members with special characters in names/addresses

### Implementation Steps
1. Create `scripts/seed-members.sql` script
2. Generate realistic member data using tools or manual creation
3. Ensure data variety covers all test scenarios needed
4. Include proper member_id generation following established format
5. Test seed script execution and data quality

### Acceptance Criteria
- Seed data creates realistic member distribution
- All member data passes validation rules and constraints
- Data provides good test scenarios for search, filtering, and business logic
- Includes various contact information and status scenarios
- Easy to reset and regenerate for development/testing
- Member IDs follow consistent format and are unique

---

## Feature Completion Checklist

### Database Layer ✓
- [ ] Members table created with proper schema matching PRD requirements
- [ ] Indexes added for performance (search, uniqueness, filtering)
- [ ] Constraints ensure data integrity and business rules
- [ ] Member ID uniqueness and format enforced at database level

### Repository Layer ✓
- [ ] All CRUD operations implemented and tested
- [ ] Member-specific queries working (search by name, member_id, email)
- [ ] Member ID generation working correctly
- [ ] Error handling comprehensive and user-friendly

### Business Layer ✓
- [ ] Member registration workflow implemented per PRD requirements
- [ ] Validation rules implemented for all member fields
- [ ] Status management working (active/inactive/suspended)
- [ ] Business logic handles all PRD use cases correctly

### API Layer ✓
- [ ] All endpoints implemented following RESTful principles
- [ ] Request/response handling correct and consistent
- [ ] Member registration flow smooth through API
- [ ] Search and filtering functionality working as specified
- [ ] Error responses consistent and helpful

### Testing ✓
- [ ] Unit tests comprehensive with 95%+ coverage
- [ ] All business rules and validation thoroughly tested
- [ ] Error conditions and edge cases covered
- [ ] Integration tests verify complete workflows

### Data ✓
- [ ] Seed data available with realistic member profiles
- [ ] Test data factories created for automated testing
- [ ] Development data covers various member scenarios

---

## Success Criteria

### PRD Compliance ✓
- [ ] **Member Registration**: Add members with name, contact, address, member ID
- [ ] **Edit Member Information**: Update member details and contact information
- [ ] **Search Members**: Find members by name or ID
- [ ] **Member Profile**: Complete record with borrowing info placeholder
- [ ] **Data Management**: Proper member data structure per PRD

### Technical Requirements ✓
- [ ] **Performance**: Fast member search with proper indexing
- [ ] **Validation**: Proper constraints and business rules enforced
- [ ] **API**: RESTful endpoints supporting all member operations
- [ ] **Security**: Email uniqueness and member ID integrity maintained

### Business Rules ✓
- [ ] **Unique Member IDs**: Each member has unique identifier
- [ ] **Data Integrity**: Cannot delete members with constraints (future: active borrows)
- [ ] **Status Management**: Proper member lifecycle management

**Total Estimated Time: 11-16 hours**

---

## Integration Points

### Dependencies for Other Features
Once Members feature is complete, it enables:
1. **Borrowing System**: Members can borrow books (foreign key relationship)
2. **Member Profile Enhancement**: Can add borrowing history and current loans
3. **Statistics and Reporting**: Member activity analytics per PRD

### Database Relationships
- **Future Integration**: `borrowing_transactions` table will reference `members.id`
- **Foreign Key Constraints**: Will prevent member deletion with active borrows
- **Analytics Integration**: Member data will be used in reporting features

---

## Next Steps After Completion

1. **Validate Integration**: Test members feature with existing books feature
2. **Prepare for Book Copies**: Members + Books will enable book copies inventory
3. **Plan Borrowing System**: Core functionality requires both members and book copies
4. **Consider Frontend**: May want to add member management UI
5. **Performance Testing**: Test member operations under expected load