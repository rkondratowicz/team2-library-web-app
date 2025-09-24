# 2-Day Sprint: Core Frontend Features MVP

## 🎯 Sprint Goal
Build a working library management system with essential features in 2 days with 3 team members working in parallel.

## 🚀 Core Features Only - No Fluff

### Day 1 Morning (4 hours): Foundation + Core Views

#### **Frontend Developer - Core Feature Set**

### F1 - Book Catalog View (Day 1 AM - 2 hours)
**Must Have**: Basic book display that works immediately
- **Simple Components**:
  - Basic HTML table showing books (title, author, ID)
  - CSS styling for readability
  - Static "loading..." and "error" states
- **Mock Data**: Simple JSON array in JavaScript file
- **Success**: Books display in table format
- **Integration**: Replace mock data with `/api/books` call

### F2 - Add New Book Form (Day 1 AM - 2 hours) 
**Must Have**: Basic book creation workflow
- **Simple Components**:
  - HTML form with title, author inputs
  - Basic client-side validation (required fields)
  - Success/error message display
- **Mock Data**: Form submission logs to console
- **Success**: Form validates and shows feedback
- **Integration**: POST to `/api/books` endpoint

---

### Day 1 Afternoon (4 hours): Essential Operations

### F3 - Book Search (Day 1 PM - 2 hours)
**Must Have**: Find books quickly
- **Simple Components**:
  - Search input field
  - Filter books by title/author (client-side initially)
  - Results update in real-time
- **Mock Data**: Filter existing book array
- **Success**: Search works on displayed books
- **Integration**: Use backend search API when ready

### F4 - Edit/Delete Book (Day 1 PM - 2 hours)
**Must Have**: Modify existing books
- **Simple Components**:
  - Edit button on each book row
  - Inline editing OR simple edit form
  - Delete button with basic confirmation
- **Mock Data**: Update local array, show changes
- **Success**: Can modify and remove books from list
- **Integration**: PUT/DELETE to `/api/books/:id`

---

### Day 2 Morning (4 hours): Member & Borrowing Basics

### F5 - Member List & Add Member (Day 2 AM - 2 hours)
**Must Have**: Basic member management
- **Simple Components**:
  - Members table (name, ID, current borrows count)
  - Add member form (name, ID only)
  - Basic validation
- **Mock Data**: Simple member array
- **Success**: Can view and add members
- **Integration**: Connect to `/api/members` endpoints

### F6 - Simple Checkout Process (Day 2 AM - 2 hours)
**Must Have**: Basic borrowing workflow
- **Simple Components**:
  - Select member (dropdown)
  - Select available book (dropdown) 
  - "Checkout" button
  - Show current borrows per member
- **Mock Data**: Track borrows in local state
- **Success**: Can assign books to members
- **Integration**: POST to `/api/borrows`

---

### Day 2 Afternoon (4 hours): Essential Polish + Integration

### F7 - Return Books (Day 2 PM - 1.5 hours)
**Must Have**: Complete the borrowing cycle
- **Simple Components**:
  - List of currently borrowed books
  - "Return" button per book
  - Update member's current borrow count
- **Mock Data**: Mark books as returned locally
- **Success**: Books can be returned and become available
- **Integration**: PUT to `/api/borrows/:id/return`

### F8 - Basic Dashboard (Day 2 PM - 1 hour)
**Must Have**: Overview of system status
- **Simple Components**:
  - Total books count
  - Total members count  
  - Currently borrowed books count
  - Simple navigation between sections
- **Mock Data**: Count from local arrays
- **Success**: Shows key metrics at a glance
- **Integration**: GET from `/api/dashboard/stats`

### F9 - Navigation & Layout (Day 2 PM - 1.5 hours)
**Must Have**: Connect all features together
- **Simple Components**:
  - Header with navigation links
  - Simple page routing (or sections)
  - Basic responsive layout
  - Footer with basic info
- **Success**: Can navigate between all features smoothly

---

## 🔧 Technical Implementation Strategy

### **Day 1 Focus**: Individual Feature Isolation
- Each feature works standalone with mock data
- Use simple HTML/CSS/JavaScript (or minimal framework)
- Focus on functionality over design
- Test each feature independently

### **Day 2 Focus**: Integration & Polish  
- Connect features to backend APIs (when ready)
- Link features together (navigation)
- Add error handling and loading states
- Basic styling and responsiveness

## 📋 Success Criteria (End of Day 2)

### **Core User Journeys Must Work**:
1. ✅ **View all books** in the system
2. ✅ **Add a new book** to the catalog  
3. ✅ **Search for books** by title/author
4. ✅ **Edit/delete books** from catalog
5. ✅ **Add new members** to the system
6. ✅ **Check out books** to members
7. ✅ **Return books** from members
8. ✅ **See basic statistics** and navigate between sections

### **Technical Requirements**:
- All features work with mock data (Day 1 end)
- All features integrate with real APIs (Day 2 end)
- Basic responsive design (works on mobile)
- No major bugs in core workflows
- Clean, readable code for future development

## 🎯 What We're NOT Building (Save for Later)

❌ **Advanced Search/Filtering** - Basic search only  
❌ **User Authentication** - No login system yet  
❌ **Advanced Analytics** - Basic counts only  
❌ **Image Uploads** - Text-only book data  
❌ **Barcode Scanning** - Manual ID entry  
❌ **Email Notifications** - No notification system  
❌ **Advanced UI/Animations** - Functional but simple  
❌ **Copy Management** - One copy per book for now  
❌ **Overdue Tracking** - Simple borrow/return only  
❌ **Member Profiles** - Basic member info only  

## 🤝 Coordination with Backend Team

### **APIs Needed by End of Day 1**:
```
GET /api/books - List all books
POST /api/books - Create new book  
GET /api/members - List all members
POST /api/members - Create new member
```

### **APIs Needed by End of Day 2**:
```
PUT /api/books/:id - Update book
DELETE /api/books/:id - Delete book
POST /api/borrows - Checkout book
PUT /api/borrows/:id/return - Return book
GET /api/dashboard/stats - Basic counts
```
This focused approach ensures we have a working library system in 2 days with all core functionality operational!
