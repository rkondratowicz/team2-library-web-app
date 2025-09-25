# Step 3: MemberRepository Implementation

## Overview
Create a repository class for database operations on the members table, following the existing BookRepository pattern.

## Repository Class Structure
```typescript
import type { 
  Member, 
  CreateMemberRequest, 
  UpdateMemberRequest, 
  MemberSearchOptions, 
  MemberStatus,
  MemberStats 
} from '../../application/models/Member.js';
import { databaseConnection } from '../DatabaseConnection.js';

export class MemberRepository {
  // Basic CRUD operations
  async getAllMembers(): Promise<Member[]>
  async getMemberById(id: number): Promise<Member | null>
  async getMemberByMemberId(memberId: string): Promise<Member | null>
  async createMember(memberData: CreateMemberRequest): Promise<Member>
  async updateMember(id: number, updates: UpdateMemberRequest): Promise<Member | null>
  async deleteMember(id: number): Promise<boolean>
  
  // Search and filtering
  async searchMembers(options: MemberSearchOptions): Promise<Member[]>
  async getMembersByStatus(status: MemberStatus): Promise<Member[]>
  async getMembersByRegistrationDateRange(from: string, to: string): Promise<Member[]>
  
  // Utility methods
  async countMembers(): Promise<number>
  async getMemberStats(): Promise<MemberStats>
  async generateNextMemberId(): Promise<string>
  async checkEmailExists(email: string, excludeId?: number): Promise<boolean>
}
```

## Key Implementation Details

### Member ID Generation
```typescript
async generateNextMemberId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const result = await databaseConnection.getOne(
    'SELECT COUNT(*) as count FROM members WHERE member_id LIKE ?',
    [`MEM-${currentYear}-%`]
  );
  const count = (result as { count: number }).count + 1;
  return `MEM-${currentYear}-${count.toString().padStart(3, '0')}`;
}
```

### Search Implementation
```typescript
async searchMembers(options: MemberSearchOptions): Promise<Member[]> {
  let sql = 'SELECT * FROM members WHERE 1=1';
  const params: unknown[] = [];
  
  if (options.query) {
    sql += ' AND (first_name LIKE ? OR last_name LIKE ? OR member_id LIKE ? OR email LIKE ?)';
    const searchTerm = `%${options.query}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }
  
  if (options.status) {
    sql += ' AND status = ?';
    params.push(options.status);
  }
  
  if (options.registrationDateFrom) {
    sql += ' AND registration_date >= ?';
    params.push(options.registrationDateFrom);
  }
  
  if (options.registrationDateTo) {
    sql += ' AND registration_date <= ?';
    params.push(options.registrationDateTo);
  }
  
  sql += ' ORDER BY created_at DESC';
  
  if (options.limit) {
    sql += ' LIMIT ?';
    params.push(options.limit);
    
    if (options.offset) {
      sql += ' OFFSET ?';
      params.push(options.offset);
    }
  }
  
  const rows = await databaseConnection.all(sql, params);
  return rows as Member[];
}
```

### Statistics Implementation
```typescript
async getMemberStats(): Promise<MemberStats> {
  const [total, active, inactive, suspended, newThisMonth, newThisYear] = await Promise.all([
    this.countMembers(),
    this.countByStatus(MemberStatus.ACTIVE),
    this.countByStatus(MemberStatus.INACTIVE),
    this.countByStatus(MemberStatus.SUSPENDED),
    this.countByDateRange("date('now', 'start of month')", 'CURRENT_DATE'),
    this.countByDateRange("date('now', 'start of year')", 'CURRENT_DATE')
  ]);
  
  return {
    total,
    active,
    inactive,
    suspended,
    newThisMonth,
    newThisYear
  };
}
```

## Error Handling
- Throw descriptive errors for duplicate email addresses
- Handle member ID generation conflicts
- Validate required fields before database operations
- Return null for not-found cases instead of throwing

## File Location
- **Path**: `src/data-access/repositories/MemberRepository.ts`
- **Export**: Both class and singleton instance like BookRepository

## Database Operations Patterns
1. **Use parameterized queries**: Prevent SQL injection
2. **Return typed results**: Cast database results to Member interfaces
3. **Handle nullable fields**: Properly handle optional database columns
4. **Consistent error messages**: Clear, actionable error descriptions

## Integration Points
- Uses DatabaseConnection class for all database operations
- Imports Member interfaces for type safety
- Will be used by MemberService for business logic operations

## Next Steps
After implementing the repository:
- Create comprehensive unit tests
- Implement MemberService using this repository
- Add repository to dependency injection/service container