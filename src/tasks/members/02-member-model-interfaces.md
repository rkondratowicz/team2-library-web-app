# Step 2: Member Model and TypeScript Interfaces

## Overview
Define TypeScript interfaces and types for the Member entity, following the existing Book model pattern.

## Core Member Interface
```typescript
export interface Member {
  id: number;
  member_id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status: MemberStatus;
  registration_date: string; // ISO date string (YYYY-MM-DD)
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}
```

## Member Status Enum
```typescript
export enum MemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}
```

## CRUD Request/Response Types
```typescript
export interface CreateMemberRequest {
  member_id?: string; // Optional - will be auto-generated if not provided
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: MemberStatus; // Optional - defaults to 'active'
}

export interface UpdateMemberRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: MemberStatus;
}

export interface MemberSearchOptions {
  query?: string; // Search by name or member ID
  status?: MemberStatus;
  registrationDateFrom?: string;
  registrationDateTo?: string;
  limit?: number;
  offset?: number;
}
```

## Additional Utility Interfaces
```typescript
// For paginated responses
export interface PaginatedMembersResponse {
  members: Member[];
  total: number;
  page: number;
  totalPages: number;
}

// Member statistics for dashboard/reporting
export interface MemberStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  newThisMonth: number;
  newThisYear: number;
}

// Member with computed full name
export interface MemberWithFullName extends Member {
  full_name: string; // Computed: first_name + ' ' + last_name
}
```

## File Location
- **Path**: `src/application/models/Member.ts`
- **Export pattern**: Follow existing Book.ts structure

## Key Design Principles
1. **Nullable fields**: email, phone, address are optional
2. **Status validation**: Use enum to ensure type safety
3. **Date handling**: Use ISO string format for consistency
4. **Request types**: Separate interfaces for create/update operations
5. **Search flexibility**: Comprehensive search options interface

## Integration Points
- Repository layer will use these interfaces for type safety
- Service layer will validate against these types
- Controller layer will serialize/deserialize using these interfaces

## Next Steps
After defining these interfaces:
- Import and use in MemberRepository implementation
- Add validation logic in MemberService
- Use for API request/response typing in controllers