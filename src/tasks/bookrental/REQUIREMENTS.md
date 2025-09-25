# Book Rental Analytics Requirements

## Core Features Needed

### 1. Member-Book Association Tracking
**Primary Question**: "Which members have borrowed Book X?"

**Requirements**:
- List all members who have ever borrowed a specific book
- Show current borrower(s) of a book
- Display borrowing history with dates
- Include member details (name, ID, contact info)
- Show return dates and overdue status

**API Endpoints Needed**:
```
GET /api/books/{bookId}/borrowers/current
GET /api/books/{bookId}/borrowers/history
GET /api/books/{bookId}/borrowers/all
```

### 2. Book-Member Association Tracking
**Primary Question**: "What books has Member Y borrowed?"

**Requirements**:
- List all books currently borrowed by a member
- Show complete borrowing history for a member
- Include book details (title, author, ISBN)
- Show borrowing and due dates
- Highlight overdue items

**API Endpoints Needed**:
```
GET /api/members/{memberId}/books/current
GET /api/members/{memberId}/books/history
GET /api/members/{memberId}/books/overdue
```

### 3. Popular Books Analytics
**Primary Question**: "Which books are most popular?"

**Requirements**:
- Rank books by total borrow count
- Show borrowing trends over time
- Identify books never borrowed
- Calculate average time between borrows
- Genre popularity analysis

**API Endpoints Needed**:
```
GET /api/analytics/books/popular
GET /api/analytics/books/trending
GET /api/analytics/books/unused
GET /api/analytics/genres/popularity
```

### 4. Member Behavior Analytics  
**Primary Question**: "How do members interact with the library?"

**Requirements**:
- Most active borrowers ranking
- Average books per member
- Identify frequent overdue returners
- Member reading preferences
- Loyalty/engagement scoring

**API Endpoints Needed**:
```
GET /api/analytics/members/active
GET /api/analytics/members/patterns
GET /api/analytics/members/overdue-patterns
GET /api/analytics/members/preferences
```

### 5. Real-time Availability Status
**Primary Question**: "Is Book X available right now?"

**Requirements**:
- Show if book is currently available
- Display who has it if borrowed
- Show expected return date
- Queue/reservation system (future)
- Multiple copies tracking

**API Endpoints Needed**:
```
GET /api/books/{bookId}/availability
GET /api/books/{bookId}/copies/status
GET /api/availability/summary
```

### 6. Advanced Search & Filtering
**Primary Question**: "Find specific rental patterns"

**Requirements**:
- Search by member name, book title, date ranges
- Filter by overdue status, genre, member type
- Combined queries (e.g., "overdue books by active members")
- Export search results
- Pagination for large datasets

**API Endpoints Needed**:
```
GET /api/rentals/search?query={params}
GET /api/rentals/filter?criteria={params}
POST /api/rentals/advanced-search
```

## Data Relationships Required

### Database Queries Needed:
1. **Current Rentals**: `borrowing_transactions` WHERE `return_date` IS NULL
2. **Historical Rentals**: All records in `borrowing_transactions`
3. **Member-Book Cross-Reference**: JOIN operations across all three main tables
4. **Popular Books**: COUNT and GROUP BY operations on book_id
5. **Overdue Tracking**: Date comparisons with `due_date`

### Performance Considerations:
- Index on `book_id`, `member_id`, `borrow_date`, `due_date`
- Optimize for frequent date range queries
- Consider materialized views for analytics
- Caching for popular queries

## User Interface Needs

### For Librarians:
- Quick lookup: "Who has this book?"
- Member profile with borrowing history
- Overdue management dashboard
- Popular books report
- Monthly/quarterly statistics

### For System Integration:
- REST API endpoints for all queries
- JSON response format
- Error handling for invalid requests
- Rate limiting for heavy analytics queries

## Sample Use Cases

1. **Scenario**: Patron asks "Who currently has 'Pride and Prejudice'?"
   - **Solution**: Query current borrowers for that book ID
   - **Response**: Member name, contact info, due date

2. **Scenario**: Member asks "What books do I currently have?"
   - **Solution**: Query current books for that member ID  
   - **Response**: List of books with due dates

3. **Scenario**: Librarian needs monthly report
   - **Solution**: Analytics service generates comprehensive stats
   - **Response**: PDF/JSON report with key metrics

4. **Scenario**: Book goes missing
   - **Solution**: Check borrowing history to find last borrower
   - **Response**: Complete audit trail with dates and members

## Success Metrics
- ✅ Can answer "Who has Book X?" in < 1 second
- ✅ Complete borrowing history available for any book/member
- ✅ Real-time availability status for all books
- ✅ Comprehensive analytics and reporting
- ✅ Easy-to-use search and filtering
- ✅ Scalable to thousands of books and members