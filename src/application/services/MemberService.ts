import type { MemberRepository } from '../../data-access/repositories/MemberRepository.js';
import {
  type CreateMemberRequest,
  type Member,
  type MemberSearchOptions,
  MemberStatus,
  type UpdateMemberRequest,
} from '../models/Member.js';

export class MemberService {
  constructor(private memberRepository: MemberRepository) {}

  /**
   * Validates UK email format
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Validates UK phone number format
   * Accepts various UK formats: +44, 0044, 01234 567890, 07123 456789, etc.
   */
  private validateUkPhoneNumber(phone: string): boolean {
    // Remove all spaces, hyphens, and brackets for validation
    const cleanPhone = phone.replace(/[\s\-()]/g, '');

    // UK phone number patterns
    const patterns = [
      /^(\+44|0044)([0-9]{10})$/, // +44 or 0044 followed by 10 digits
      /^0([1-9][0-9]{8,9})$/, // Starts with 0, second digit 1-9, then 8-9 more digits
    ];

    return patterns.some((pattern) => pattern.test(cleanPhone));
  }

  /**
   * Validates member data before creation/update
   */
  private validateMemberData(
    memberData: CreateMemberRequest | UpdateMemberRequest,
    isUpdate: boolean = false
  ): void {
    // Required fields for creation
    if (!isUpdate) {
      const createData = memberData as CreateMemberRequest;
      if (!createData.first_name?.trim()) {
        throw new Error('First name is required');
      }
      if (!createData.last_name?.trim()) {
        throw new Error('Last name is required');
      }
    }

    // Email validation
    if (memberData.email && !this.validateEmail(memberData.email)) {
      throw new Error('Invalid email format');
    }

    // Phone validation
    if (memberData.phone && !this.validateUkPhoneNumber(memberData.phone)) {
      throw new Error('Invalid UK phone number format');
    }

    // Name length validation
    if (memberData.first_name !== undefined) {
      if (memberData.first_name && memberData.first_name.trim().length < 2) {
        throw new Error('First name must be at least 2 characters long');
      }
      if (memberData.first_name && memberData.first_name.length > 50) {
        throw new Error('First name must be no more than 50 characters long');
      }
    }

    if (memberData.last_name !== undefined) {
      if (memberData.last_name && memberData.last_name.trim().length < 2) {
        throw new Error('Last name must be at least 2 characters long');
      }
      if (memberData.last_name && memberData.last_name.length > 50) {
        throw new Error('Last name must be no more than 50 characters long');
      }
    }

    // Address validation
    if (memberData.address && memberData.address.trim().length < 5) {
      throw new Error('Address must be at least 5 characters long');
    }
  }

  /**
   * Create a new member
   */
  async createMember(memberData: CreateMemberRequest): Promise<Member> {
    // Validate input data
    this.validateMemberData(memberData);

    // Check if email already exists
    if (memberData.email) {
      const existingMembers = await this.memberRepository.searchMembers({
        search_term: memberData.email,
      });
      const emailExists = existingMembers.some(
        (member) =>
          member.email?.toLowerCase() === memberData.email?.toLowerCase()
      );
      if (emailExists) {
        throw new Error('A member with this email address already exists');
      }
    }

    return await this.memberRepository.createMember(memberData);
  }

  /**
   * Get all members
   */
  async getAllMembers(): Promise<Member[]> {
    return await this.memberRepository.getAllMembers();
  }

  /**
   * Get member by ID
   */
  async getMemberById(id: number): Promise<Member | null> {
    return await this.memberRepository.getMemberById(id);
  }

  /**
   * Get member by member ID (MEM-YYYY-XXX format)
   */
  async getMemberByMemberId(memberId: string): Promise<Member | null> {
    // Validate member ID format
    const memberIdRegex = /^MEM-\d{4}-\d{3}$/;
    if (!memberIdRegex.test(memberId)) {
      throw new Error(
        'Invalid member ID format. Expected format: MEM-YYYY-XXX'
      );
    }

    return await this.memberRepository.getMemberByMemberId(memberId);
  }

  /**
   * Update member information
   */
  async updateMember(
    id: number,
    updateData: UpdateMemberRequest
  ): Promise<Member> {
    // Validate input data
    this.validateMemberData(updateData, true);

    // Check if member exists
    const existingMember = await this.memberRepository.getMemberById(id);
    if (!existingMember) {
      throw new Error('Member not found');
    }

    // Check for email conflicts (if email is being updated)
    if (updateData.email && updateData.email !== existingMember.email) {
      const existingMembers = await this.memberRepository.searchMembers({
        search_term: updateData.email,
      });
      const emailExists = existingMembers.some(
        (member) =>
          member.email?.toLowerCase() === updateData.email?.toLowerCase() &&
          member.id !== id
      );
      if (emailExists) {
        throw new Error('A member with this email address already exists');
      }
    }

    // Update the member
    const updatedMember = await this.memberRepository.updateMember(
      id,
      updateData
    );

    if (!updatedMember) {
      throw new Error('Failed to update member');
    }

    return updatedMember;
  }

  /**
   * Change member status (activate, suspend, deactivate)
   */
  async updateMemberStatus(id: number, status: MemberStatus): Promise<Member> {
    // Check if member exists
    const existingMember = await this.memberRepository.getMemberById(id);
    if (!existingMember) {
      throw new Error('Member not found');
    }

    // Update status
    const updatedMember = await this.memberRepository.updateMember(id, {
      status,
    });

    if (!updatedMember) {
      throw new Error('Failed to update member status');
    }

    return updatedMember;
  }

  /**
   * Delete a member (soft delete - sets status to inactive)
   */
  async deleteMember(id: number): Promise<boolean> {
    // Check if member exists
    const existingMember = await this.memberRepository.getMemberById(id);
    if (!existingMember) {
      throw new Error('Member not found');
    }

    // Delete the member
    return await this.memberRepository.deleteMember(id);
  }

  /**
   * Search members with various criteria
   */
  async searchMembers(searchOptions: MemberSearchOptions): Promise<Member[]> {
    return await this.memberRepository.searchMembers(searchOptions);
  }

  /**
   * Get members by status
   */
  async getMembersByStatus(status: MemberStatus): Promise<Member[]> {
    return await this.memberRepository.searchMembers({ status });
  }

  /**
   * Check if member ID is valid and exists
   */
  async validateMemberExists(memberId: string): Promise<boolean> {
    try {
      const member = await this.memberRepository.getMemberByMemberId(memberId);
      return member !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get member count by status
   */
  async getMemberCountByStatus(): Promise<Record<MemberStatus, number>> {
    const allMembers = await this.memberRepository.getAllMembers();

    const counts: Record<MemberStatus, number> = {
      [MemberStatus.ACTIVE]: 0,
      [MemberStatus.INACTIVE]: 0,
      [MemberStatus.SUSPENDED]: 0,
    };

    allMembers.forEach((member) => {
      counts[member.status]++;
    });

    return counts;
  }

  /**
   * Get total member count
   */
  async getTotalMemberCount(): Promise<number> {
    const members = await this.memberRepository.getAllMembers();
    return members.length;
  }
}

// Create and export member service instance
import { memberRepository } from '../../data-access/repositories/MemberRepository.js';
export const memberService = new MemberService(memberRepository);
