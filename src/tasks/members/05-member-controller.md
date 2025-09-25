# Step 5: MemberController Implementation

## Overview
Create a REST API controller to handle HTTP requests and responses for member operations, following RESTful conventions.

## Controller Class Structure
```typescript
import { Request, Response } from 'express';
import type { 
  CreateMemberRequest, 
  UpdateMemberRequest, 
  MemberSearchOptions 
} from '../../application/models/Member.js';
import { memberService } from '../../application/services/MemberService.js';

export class MemberController {
  // RESTful CRUD endpoints
  async getAllMembers(req: Request, res: Response): Promise<void>
  async getMemberById(req: Request, res: Response): Promise<void>
  async createMember(req: Request, res: Response): Promise<void>
  async updateMember(req: Request, res: Response): Promise<void>
  async deleteMember(req: Request, res: Response): Promise<void>
  
  // Search and filtering endpoints
  async searchMembers(req: Request, res: Response): Promise<void>
  async getMembersByStatus(req: Request, res: Response): Promise<void>
  
  // Analytics and statistics endpoints
  async getMemberStats(req: Request, res: Response): Promise<void>
  
  // Member status management endpoints
  async suspendMember(req: Request, res: Response): Promise<void>
  async reactivateMember(req: Request, res: Response): Promise<void>
}
```

## RESTful Endpoint Implementations

### Get All Members
```typescript
async getAllMembers(_req: Request, res: Response): Promise<void> {
  try {
    const members = await memberService.getAllMembers();
    res.status(200).json({
      success: true,
      data: members,
      count: members.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve members',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

### Get Member by ID
```typescript
async getMemberById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const memberId = Number.parseInt(id, 10);
    
    if (Number.isNaN(memberId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid member ID format'
      });
      return;
    }
    
    const member = await memberService.getMemberById(memberId);
    
    if (!member) {
      res.status(404).json({
        success: false,
        error: `Member with ID ${memberId} not found`
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve member',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

### Create Member
```typescript
async createMember(req: Request, res: Response): Promise<void> {
  try {
    const memberData: CreateMemberRequest = req.body;
    
    // Basic request validation
    if (!memberData.first_name || !memberData.last_name) {
      res.status(400).json({
        success: false,
        error: 'First name and last name are required'
      });
      return;
    }
    
    const newMember = await memberService.createMember(memberData);
    
    res.status(201).json({
      success: true,
      data: newMember,
      message: 'Member created successfully'
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('already registered')) {
      res.status(409).json({
        success: false,
        error: error.message
      });
    } else if (error instanceof Error && error.message.includes('Invalid')) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to create member',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
```

### Update Member
```typescript
async updateMember(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const memberId = Number.parseInt(id, 10);
    
    if (Number.isNaN(memberId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid member ID format'
      });
      return;
    }
    
    const updates: UpdateMemberRequest = req.body;
    
    // Check if request body is empty
    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        error: 'No update data provided'
      });
      return;
    }
    
    const updatedMember = await memberService.updateMember(memberId, updates);
    
    if (!updatedMember) {
      res.status(404).json({
        success: false,
        error: `Member with ID ${memberId} not found`
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: updatedMember,
      message: 'Member updated successfully'
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    } else if (error instanceof Error && error.message.includes('already registered')) {
      res.status(409).json({
        success: false,
        error: error.message
      });
    } else if (error instanceof Error && error.message.includes('Invalid')) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to update member',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
```

### Search Members
```typescript
async searchMembers(req: Request, res: Response): Promise<void> {
  try {
    const searchOptions: MemberSearchOptions = {
      query: req.query.q as string,
      status: req.query.status as MemberStatus,
      registrationDateFrom: req.query.regDateFrom as string,
      registrationDateTo: req.query.regDateTo as string,
      limit: req.query.limit ? Number.parseInt(req.query.limit as string, 10) : undefined,
      offset: req.query.offset ? Number.parseInt(req.query.offset as string, 10) : undefined
    };
    
    // Remove undefined values
    Object.keys(searchOptions).forEach(key => {
      if (searchOptions[key as keyof MemberSearchOptions] === undefined) {
        delete searchOptions[key as keyof MemberSearchOptions];
      }
    });
    
    const members = await memberService.searchMembers(searchOptions);
    
    res.status(200).json({
      success: true,
      data: members,
      count: members.length,
      searchCriteria: searchOptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to search members',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

## Route Definitions

### RESTful Routes
```typescript
// In app.ts or routes file
app.get('/api/members', memberController.getAllMembers.bind(memberController));
app.get('/api/members/:id', memberController.getMemberById.bind(memberController));
app.post('/api/members', memberController.createMember.bind(memberController));
app.put('/api/members/:id', memberController.updateMember.bind(memberController));
app.delete('/api/members/:id', memberController.deleteMember.bind(memberController));

// Search and filtering routes
app.get('/api/members/search', memberController.searchMembers.bind(memberController));
app.get('/api/members/status/:status', memberController.getMembersByStatus.bind(memberController));

// Statistics and analytics routes
app.get('/api/members/stats', memberController.getMemberStats.bind(memberController));

// Member status management routes
app.patch('/api/members/:id/suspend', memberController.suspendMember.bind(memberController));
app.patch('/api/members/:id/reactivate', memberController.reactivateMember.bind(memberController));
```

## Response Format Standards

### Success Response Format
```json
{
  "success": true,
  "data": { /* member object or array */ },
  "message": "Operation completed successfully", // optional
  "count": 1, // for arrays
  "pagination": { // for paginated responses
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "error": "Human-readable error message",
  "details": "Technical error details", // optional, for debugging
  "code": "MEMBER_NOT_FOUND" // optional, for client error handling
}
```

## Input Validation
- **Parameter validation**: Check ID format, required fields
- **Query parameter parsing**: Handle optional search parameters
- **Request body validation**: Validate JSON structure and required fields
- **Type coercion**: Convert string parameters to appropriate types

## Error Handling Strategy
- **400 Bad Request**: Invalid input data or parameters
- **404 Not Found**: Member not found by ID
- **409 Conflict**: Duplicate email or member ID
- **500 Internal Server Error**: Unexpected server errors

## File Location
- **Path**: `src/presentation/controllers/MemberController.ts`
- **Export**: Both class and singleton instance

## Integration Points
- Uses MemberService for all business logic operations
- Integrates with Express.js routing system
- Will be used by main app.ts for route configuration

## Next Steps
After implementing the controller:
- Add comprehensive integration tests for all endpoints
- Add API route configuration to main app.ts
- Implement request validation middleware
- Add API documentation (OpenAPI/Swagger)