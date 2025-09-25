/**
 * Member Status Enumeration
 * Represents the different states a library member can be in
 */
export enum MemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

/**
 * Core Member Interface
 * Represents a library member with all database fields
 */
export interface Member {
  id: number;
  member_id: string; // Format: MEM-YYYY-XXX (e.g., MEM-2024-001)
  first_name: string;
  last_name: string;
  email?: string; // Optional, must be unique if provided
  phone?: string; // Optional UK phone number
  address?: string; // Optional UK address
  status: MemberStatus; // active | inactive | suspended
  registration_date: string; // Date format: YYYY-MM-DD
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  active_borrows?: number; // Count of currently borrowed books
}

/**
 * Create Member Request
 * Data required to create a new library member
 */
export interface CreateMemberRequest {
  first_name: string; // Required: Member's first name
  last_name: string; // Required: Member's last name
  email?: string; // Optional: Valid email address
  phone?: string; // Optional: UK phone number format
  address?: string; // Optional: UK postal address
  status?: MemberStatus; // Optional: Defaults to 'active'
}

/**
 * Update Member Request
 * Data that can be updated for an existing member
 */
export interface UpdateMemberRequest {
  first_name?: string; // Optional: Update first name
  last_name?: string; // Optional: Update last name
  email?: string; // Optional: Update email (must be unique)
  phone?: string; // Optional: Update phone number
  address?: string; // Optional: Update address
  status?: MemberStatus; // Optional: Update member status
}

/**
 * Member Search Options
 * Parameters for searching/filtering members
 */
export interface MemberSearchOptions {
  search_term?: string; // Search in name, email, member_id
  status?: MemberStatus; // Filter by specific status
  limit?: number; // Limit number of results (default: 50)
  offset?: number; // Offset for pagination (default: 0)
}

/**
 * Member Response
 * Member data returned by API endpoints
 */
export interface MemberResponse extends Member {
  full_name: string; // Computed: first_name + ' ' + last_name
  display_id: string; // Formatted member ID for display
  is_active: boolean; // Computed: status === 'active'
}

/**
 * Member Statistics
 * Summary statistics for member management
 */
export interface MemberStatistics {
  total_members: number;
  active_members: number;
  inactive_members: number;
  suspended_members: number;
  new_registrations_this_month: number;
}

/**
 * Member Validation Errors
 * Specific error types for member operations
 */
export interface MemberValidationError {
  field: string;
  message: string;
  code: 'REQUIRED' | 'INVALID_FORMAT' | 'DUPLICATE' | 'TOO_LONG' | 'TOO_SHORT';
}
