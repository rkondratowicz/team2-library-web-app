# Book Rental Tracking System - Task Plan

## Overview
This plan outlines the tasks needed to implement comprehensive book rental tracking features that show which members have borrowed specific books, rental patterns, and detailed analytics.

## Project Goals
- Track which members have borrowed which books (current and historical)
- Provide detailed rental history and analytics
- Monitor overdue books and member borrowing patterns
- Generate reports on popular books and member activity
- Enhance the existing transaction system with advanced querying

## Task Breakdown

### Phase 1: Enhanced Rental Queries (Tasks 1-3)
**Goal**: Extend existing transaction system to provide detailed member-book associations

#### Task 1: Member-Book Association Queries
- **File**: `src/application/services/RentalAnalyticsService.ts`
- **Description**: Create service to query which members have borrowed specific books
- **Features**:
  - Get all members who have ever borrowed a specific book
  - Get all books currently borrowed by a specific member
  - Get all books ever borrowed by a specific member (history)
  - Cross-reference member-book relationships

#### Task 2: Current Borrowers Tracking
- **File**: `src/presentation/controllers/RentalController.ts`
- **Description**: Create API endpoints for active rental tracking
- **Features**:
  - `/api/rentals/books/:bookId/current-borrowers` - Who currently has this book
  - `/api/rentals/members/:memberId/current-books` - What books this member currently has
  - `/api/rentals/active-summary` - Overview of all active rentals
  - Real-time availability status

#### Task 3: Historical Rental Queries
- **File**: `src/data-access/repositories/RentalHistoryRepository.ts`
- **Description**: Database queries for comprehensive rental history
- **Features**:
  - Complete borrowing history for any book
  - Complete borrowing history for any member
  - Date range queries for rental periods
  - Filtering by book genre, member status, etc.

### Phase 2: Advanced Analytics (Tasks 4-6)
**Goal**: Provide insights into borrowing patterns and popular books

#### Task 4: Popular Books Analytics
- **File**: `src/application/services/BookPopularityService.ts`
- **Description**: Analyze which books are most/least popular
- **Features**:
  - Most borrowed books (all time)
  - Most borrowed books (by time period)
  - Books never borrowed
  - Average borrowing frequency per book
  - Genre popularity statistics

#### Task 5: Member Borrowing Patterns
- **File**: `src/application/services/MemberBehaviorService.ts`
- **Description**: Analyze member borrowing behavior
- **Features**:
  - Most active members (by borrow count)
  - Average books per member
  - Member reading preferences by genre
  - Frequent overdue members
  - Member loyalty scoring

#### Task 6: Overdue and Late Return Tracking
- **File**: `src/application/services/OverdueAnalyticsService.ts`
- **Description**: Enhanced overdue book management
- **Features**:
  - Books overdue by member
  - Chronic late returners identification
  - Overdue trends and patterns
  - Automatic overdue notifications (preparation)
  - Late fee calculation system

### Phase 3: Reporting and Dashboard (Tasks 7-9)
**Goal**: Create comprehensive reporting system for librarians

#### Task 7: Rental Reports Generator
- **File**: `src/application/services/RentalReportsService.ts`
- **Description**: Generate various rental reports
- **Features**:
  - Monthly/quarterly rental summaries
  - Member activity reports
  - Book circulation reports
  - Overdue reports with member details
  - Export functionality (JSON/CSV ready)

#### Task 8: Dashboard Data Aggregation
- **File**: `src/presentation/controllers/DashboardController.ts`
- **Description**: API endpoints for dashboard widgets
- **Features**:
  - Key metrics summary (active rentals, overdue count, etc.)
  - Recent rental activity feed
  - Top borrowed books widget
  - Member activity summary
  - Real-time statistics

#### Task 9: Search and Filter Enhancement
- **File**: `src/presentation/controllers/RentalSearchController.ts`
- **Description**: Advanced search capabilities for rental data
- **Features**:
  - Search rentals by multiple criteria
  - Filter by date ranges, member status, book genre
  - Combined member-book search queries
  - Export filtered results
  - Pagination for large result sets

### Phase 4: Integration and Testing (Tasks 10-12)
**Goal**: Integrate all rental features with existing system

#### Task 10: API Integration
- **File**: `src/app.ts` (routes integration)
- **Description**: Integrate all rental endpoints into main application
- **Features**:
  - Add all rental routes to Express app
  - Ensure proper middleware integration
  - Error handling for rental operations
  - Rate limiting for heavy queries

#### Task 11: Database Performance Optimization
- **File**: `src/data-access/migrations/005-rental-indexes.sql`
- **Description**: Optimize database for rental queries
- **Features**:
  - Add indexes for common rental queries
  - Optimize member-book relationship queries
  - Performance improvements for date-based searches
  - Query optimization for analytics

#### Task 12: Testing and Documentation
- **Files**: Various test files and documentation
- **Description**: Comprehensive testing of rental features
- **Features**:
  - Unit tests for all rental services
  - Integration tests for API endpoints
  - Performance testing for analytics queries
  - Documentation updates for new features

## Expected Outcomes
After completing this plan:
- ✅ Know which members have borrowed any specific book (current and historical)
- ✅ Track all books borrowed by any member (with date ranges)
- ✅ Identify popular books and reading trends
- ✅ Monitor overdue books and member patterns
- ✅ Generate comprehensive rental reports
- ✅ Provide dashboard insights for librarians
- ✅ Enhanced search and filtering capabilities
- ✅ Optimized performance for large datasets

## Technical Dependencies
- Existing Transaction/Borrowing system (✅ Complete)
- Member management system (✅ Complete)
- Book management system (✅ Complete)
- SQLite database with borrowing_transactions table (✅ Complete)

## Estimated Timeline
- **Phase 1**: 3-4 tasks (Enhanced queries and basic analytics)
- **Phase 2**: 3-4 tasks (Advanced analytics and insights)
- **Phase 3**: 3-4 tasks (Reporting and dashboard features)
- **Phase 4**: 3-4 tasks (Integration, optimization, testing)

**Total**: 12 tasks covering comprehensive book rental tracking and analytics system.