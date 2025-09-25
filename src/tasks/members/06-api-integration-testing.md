# Step 6: API Routes Integration and Testing

## Overview
Integrate member API endpoints into the main Express application and create comprehensive testing strategy for the complete member management system.

## App.ts Integration

### Import Member Components
```typescript
// Add to existing imports in app.ts
import { memberController } from './src/presentation/controllers/MemberController.js';
```

### Member API Routes Configuration
```typescript
// Member CRUD routes
app.get('/api/members', memberController.getAllMembers.bind(memberController));
app.get('/api/members/search', memberController.searchMembers.bind(memberController));
app.get('/api/members/stats', memberController.getMemberStats.bind(memberController));
app.get('/api/members/status/:status', memberController.getMembersByStatus.bind(memberController));
app.get('/api/members/:id', memberController.getMemberById.bind(memberController));
app.post('/api/members', memberController.createMember.bind(memberController));
app.put('/api/members/:id', memberController.updateMember.bind(memberController));
app.delete('/api/members/:id', memberController.deleteMember.bind(memberController));

// Member status management
app.patch('/api/members/:id/suspend', memberController.suspendMember.bind(memberController));
app.patch('/api/members/:id/reactivate', memberController.reactivateMember.bind(memberController));
```

### Middleware Configuration
```typescript
// Ensure JSON parsing middleware is configured before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Optional: Add request logging middleware for member routes
app.use('/api/members', (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

## Database Migration Execution

### Update DatabaseConnection.ts
```typescript
// Add method to run migrations
async runMigrations(): Promise<void> {
  const migrationsPath = path.join(__dirname, '..', 'src', 'data-access', 'migrations');
  const migrationFiles = fs.readdirSync(migrationsPath)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Ensure migrations run in order

  for (const file of migrationFiles) {
    const migrationSQL = fs.readFileSync(path.join(migrationsPath, file), 'utf-8');
    await this.run(migrationSQL);
    console.log(`Executed migration: ${file}`);
  }
}
```

### Initialize Database with Migrations
```typescript
// In app.ts startup sequence
async function initializeDatabase() {
  try {
    await databaseConnection.runMigrations();
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Database migration failed:', error);
    process.exit(1);
  }
}

// Call before starting server
initializeDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
```

## Sample Data Population

### Create Members Sample Data Script
```sql
-- File: scripts/populate-sample-members.sql
INSERT INTO members (member_id, first_name, last_name, email, phone, address, status, registration_date) VALUES
('MEM-2024-001', 'John', 'Smith', 'john.smith@email.com', '+44-20-7946-0958', '123 High Street, London, SW1A 1AA', 'active', '2024-01-15'),
('MEM-2024-002', 'Sarah', 'Johnson', 'sarah.j@email.com', '+44-161-123-4567', '456 Oak Avenue, Manchester, M1 4BT', 'active', '2024-02-20'),
('MEM-2024-003', 'Michael', 'Brown', 'mike.brown@email.com', '+44-121-765-4321', '789 Victoria Road, Birmingham, B1 1BB', 'inactive', '2024-03-10'),
('MEM-2024-004', 'Emma', 'Wilson', 'emma.wilson@email.com', '+44-131-555-0123', '321 Royal Mile, Edinburgh, EH1 1YZ', 'active', '2024-03-25'),
('MEM-2024-005', 'James', 'Taylor', 'james.taylor@email.com', '+44-29-2034-5678', '654 Castle Street, Cardiff, CF10 1BH', 'suspended', '2024-04-05');
```

## API Testing Strategy

### Manual Testing with curl
```bash
# Test member creation
curl -X POST http://localhost:3000/api/members \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "phone": "+44-20-1234-5678",
    "address": "123 Test Street, London, SW1A 1AA"
  }'

# Test member retrieval
curl http://localhost:3000/api/members

# Test member search
curl "http://localhost:3000/api/members/search?q=John&status=active"

# Test member statistics
curl http://localhost:3000/api/members/stats

# Test member update
curl -X PUT http://localhost:3000/api/members/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "suspended"}'

# Test member deletion
curl -X DELETE http://localhost:3000/api/members/1
```

### Frontend Integration Testing
```html
<!-- Add to public/index.html for testing -->
<div id="member-testing">
  <h3>Member API Testing</h3>
  <button onclick="testMemberAPI()">Test Member Endpoints</button>
  <div id="member-results"></div>
</div>

<script>
async function testMemberAPI() {
  const results = document.getElementById('member-results');
  results.innerHTML = '<p>Testing member endpoints...</p>';
  
  try {
    // Test get all members
    const response = await fetch('/api/members');
    const data = await response.json();
    
    results.innerHTML = `
      <h4>Members API Test Results:</h4>
      <pre>${JSON.stringify(data, null, 2)}</pre>
    `;
  } catch (error) {
    results.innerHTML = `<p>Error: ${error.message}</p>`;
  }
}
</script>
```

## Error Handling and Logging

### Global Error Handler for Member Routes
```typescript
// Add error handling middleware after member routes
app.use('/api/members', (error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Member API Error:', error);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error in member management',
    timestamp: new Date().toISOString(),
    path: req.path
  });
});
```

### Request Validation Middleware
```typescript
// Create validation middleware for member requests
export const validateMemberCreation = (req: Request, res: Response, next: NextFunction) => {
  const { first_name, last_name } = req.body;
  
  if (!first_name || !last_name) {
    return res.status(400).json({
      success: false,
      error: 'First name and last name are required'
    });
  }
  
  if (typeof first_name !== 'string' || typeof last_name !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'First name and last name must be strings'
    });
  }
  
  next();
};

// Use in routes
app.post('/api/members', validateMemberCreation, memberController.createMember.bind(memberController));
```

## Performance Considerations

### Database Indexing
```sql
-- Ensure these indexes exist for optimal performance
CREATE INDEX IF NOT EXISTS idx_members_member_id ON members(member_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_registration_date ON members(registration_date);
CREATE INDEX IF NOT EXISTS idx_members_name_search ON members(first_name, last_name);
```

### API Rate Limiting (Optional)
```typescript
// Add rate limiting for member endpoints
import rateLimit from 'express-rate-limit';

const memberApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many member API requests from this IP'
});

app.use('/api/members', memberApiLimiter);
```

## Deployment Checklist

### Pre-deployment Verification
1. ✅ Database migrations execute successfully
2. ✅ All member API endpoints respond correctly
3. ✅ Error handling works for edge cases
4. ✅ Sample data loads without conflicts
5. ✅ Frontend can interact with member endpoints
6. ✅ No TypeScript compilation errors
7. ✅ All linting checks pass

### Production Considerations
- **Environment variables**: Configure database path, API keys
- **CORS settings**: Configure allowed origins for frontend
- **Security headers**: Add helmet.js for security headers
- **Request logging**: Implement proper logging for production
- **Error monitoring**: Set up error tracking (e.g., Sentry)

## File Locations
- **Migration**: `src/data-access/migrations/002-create-members-table.sql`
- **Sample data**: `scripts/populate-sample-members.sql`
- **App integration**: Update `app.ts` with member routes

## Success Criteria
- All member CRUD operations work via API
- Search functionality returns correct results
- Member statistics endpoint provides accurate data
- Error responses follow consistent format
- Database maintains data integrity with constraints
- Frontend can successfully interact with all endpoints

## Next Steps After Integration
1. Add comprehensive API documentation
2. Implement automated testing suite
3. Add member management UI to the frontend
4. Consider adding member photo uploads
5. Implement member activity logging
6. Add email notifications for member status changes