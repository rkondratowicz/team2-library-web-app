# Step 4: MemberService Implementation

## Overview
Create a service class that implements business logic for member management, validation, and operations that span multiple repositories.

## Service Class Structure
```typescript
import type { 
  Member, 
  CreateMemberRequest, 
  UpdateMemberRequest, 
  MemberSearchOptions, 
  MemberStatus,
  MemberStats 
} from '../models/Member.js';
import { memberRepository } from '../../data-access/repositories/MemberRepository.js';

export class MemberService {
  // Core business operations
  async getAllMembers(): Promise<Member[]>
  async getMemberById(id: number): Promise<Member | null>
  async getMemberByMemberId(memberId: string): Promise<Member | null>
  async createMember(memberData: CreateMemberRequest): Promise<Member>
  async updateMember(id: number, updates: UpdateMemberRequest): Promise<Member | null>
  async deleteMember(id: number): Promise<boolean>
  
  // Search and analytics
  async searchMembers(options: MemberSearchOptions): Promise<Member[]>
  async getMemberStats(): Promise<MemberStats>
  
  // Business logic operations
  async suspendMember(id: number, reason?: string): Promise<Member | null>
  async reactivateMember(id: number): Promise<Member | null>
  async validateMemberData(memberData: CreateMemberRequest | UpdateMemberRequest): Promise<void>
}
```

## Business Logic Implementation

### Member Data Validation
```typescript
async validateMemberData(memberData: CreateMemberRequest | UpdateMemberRequest): Promise<void> {
  // Email validation
  if (memberData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(memberData.email)) {
      throw new Error('Invalid email format');
    }
  }
  
  // Phone validation (basic format check)
  if (memberData.phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(memberData.phone.replace(/\s|-|\(|\)/g, ''))) {
      throw new Error('Invalid phone number format');
    }
  }
  
  // Name validation
  if ('first_name' in memberData && memberData.first_name) {
    if (memberData.first_name.trim().length < 2) {
      throw new Error('First name must be at least 2 characters long');
    }
  }
  
  if ('last_name' in memberData && memberData.last_name) {
    if (memberData.last_name.trim().length < 2) {
      throw new Error('Last name must be at least 2 characters long');
    }
  }
}
```

### Create Member with Business Rules
```typescript
async createMember(memberData: CreateMemberRequest): Promise<Member> {
  // Validate input data
  await this.validateMemberData(memberData);
  
  // Check for duplicate email
  if (memberData.email) {
    const existingMemberWithEmail = await memberRepository.getMemberByEmail(memberData.email);
    if (existingMemberWithEmail) {
      throw new Error(`Email ${memberData.email} is already registered`);
    }
  }
  
  // Generate member ID if not provided
  if (!memberData.member_id) {
    memberData.member_id = await memberRepository.generateNextMemberId();
  } else {
    // Validate custom member ID format
    const memberIdRegex = /^MEM-\d{4}-\d{3}$/;
    if (!memberIdRegex.test(memberData.member_id)) {
      throw new Error('Member ID must follow format: MEM-YYYY-XXX');
    }
  }
  
  // Set default status if not provided
  if (!memberData.status) {
    memberData.status = MemberStatus.ACTIVE;
  }
  
  return await memberRepository.createMember(memberData);
}
```

### Update Member with Business Rules
```typescript
async updateMember(id: number, updates: UpdateMemberRequest): Promise<Member | null> {
  // Validate ID format
  if (!id || id <= 0) {
    throw new Error('Invalid member ID');
  }
  
  // Check if member exists
  const existingMember = await memberRepository.getMemberById(id);
  if (!existingMember) {
    throw new Error(`Member with ID ${id} not found`);
  }
  
  // Validate update data
  await this.validateMemberData(updates);
  
  // Check for duplicate email (excluding current member)
  if (updates.email && updates.email !== existingMember.email) {
    const memberWithEmail = await memberRepository.getMemberByEmail(updates.email);
    if (memberWithEmail && memberWithEmail.id !== id) {
      throw new Error(`Email ${updates.email} is already registered`);
    }
  }
  
  return await memberRepository.updateMember(id, updates);
}
```

### Member Status Management
```typescript
async suspendMember(id: number, reason?: string): Promise<Member | null> {
  const updates: UpdateMemberRequest = { 
    status: MemberStatus.SUSPENDED 
  };
  
  // Log suspension reason if provided
  if (reason) {
    // In a real application, you might store this in a member_actions table
    console.log(`Member ${id} suspended: ${reason}`);
  }
  
  return await this.updateMember(id, updates);
}

async reactivateMember(id: number): Promise<Member | null> {
  const updates: UpdateMemberRequest = { 
    status: MemberStatus.ACTIVE 
  };
  
  return await this.updateMember(id, updates);
}
```

## Advanced Business Operations

### Search with Business Logic
```typescript
async searchMembers(options: MemberSearchOptions): Promise<Member[]> {
  // Apply business rules to search options
  if (options.limit && options.limit > 100) {
    options.limit = 100; // Prevent excessive database load
  }
  
  if (options.offset && options.offset < 0) {
    options.offset = 0;
  }
  
  return await memberRepository.searchMembers(options);
}
```

### Member Analytics
```typescript
async getMemberGrowthTrend(months: number = 6): Promise<{ month: string; newMembers: number }[]> {
  const trend = [];
  for (let i = months - 1; i >= 0; i--) {
    const startOfMonth = new Date();
    startOfMonth.setMonth(startOfMonth.getMonth() - i, 1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    const count = await memberRepository.countByDateRange(
      startOfMonth.toISOString().split('T')[0],
      endOfMonth.toISOString().split('T')[0]
    );
    
    trend.push({
      month: startOfMonth.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      newMembers: count
    });
  }
  
  return trend;
}
```

## Error Handling Strategy
- **Validation errors**: Throw descriptive errors with field-specific messages
- **Not found errors**: Return null instead of throwing for optional operations
- **Conflict errors**: Clear messages for duplicate emails, member IDs
- **Business rule violations**: Specific error messages for each rule

## File Location
- **Path**: `src/application/services/MemberService.ts`
- **Export**: Both class and singleton instance

## Integration Points
- Uses MemberRepository for all data operations
- Will be used by MemberController for API endpoints
- Can integrate with other services (e.g., NotificationService, AuditService)

## Next Steps
After implementing the service:
- Create comprehensive unit tests with mocked repository
- Implement MemberController using this service
- Add integration tests for business logic scenarios