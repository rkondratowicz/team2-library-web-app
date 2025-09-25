// Member data model and type definitions

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

export enum MemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

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

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

// Member statistics for reporting
export interface MemberStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  newThisMonth: number;
  newThisYear: number;
}

// Member with full name computed
export interface MemberWithFullName extends Member {
  full_name: string; // Computed: first_name + ' ' + last_name
}

// For member borrowing history (future use with borrowing system)
export interface MemberWithBorrowingInfo extends Member {
  active_borrows: number;
  total_borrows: number;
  overdue_items: number;
}