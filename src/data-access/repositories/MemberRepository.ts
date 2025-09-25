import type {
  CreateMemberRequest,
  Member,
  MemberSearchOptions,
  MemberStatus,
  UpdateMemberRequest,
} from '../../application/models/Member.js';
import { databaseConnection } from '../DatabaseConnection.js';

export class MemberRepository {
  /**
   * Retrieve all members ordered by registration date (newest first)
   */
  async getAllMembers(): Promise<Member[]> {
    const rows = await databaseConnection.all(
      'SELECT * FROM members ORDER BY created_at DESC'
    );
    return rows as Member[];
  }

  /**
   * Get a member by their database ID
   */
  async getMemberById(id: number): Promise<Member | null> {
    const row = await databaseConnection.getOne(
      'SELECT * FROM members WHERE id = ?',
      [id]
    );
    return (row as Member) || null;
  }

  /**
   * Get a member by their unique member ID (e.g., MEM-2024-001)
   */
  async getMemberByMemberId(memberId: string): Promise<Member | null> {
    const row = await databaseConnection.getOne(
      'SELECT * FROM members WHERE member_id = ?',
      [memberId]
    );
    return (row as Member) || null;
  }

  /**
   * Search members with flexible criteria
   */
  async searchMembers(options: MemberSearchOptions): Promise<Member[]> {
    let sql = 'SELECT * FROM members WHERE 1=1';
    const params: unknown[] = [];

    // Add search term filter (search in names, email, member_id)
    if (options.search_term?.trim()) {
      sql += ` AND (
        first_name LIKE ? OR 
        last_name LIKE ? OR 
        email LIKE ? OR 
        member_id LIKE ?
      )`;
      const searchPattern = `%${options.search_term.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Add status filter
    if (options.status) {
      sql += ' AND status = ?';
      params.push(options.status);
    }

    // Add ordering
    sql += ' ORDER BY created_at DESC';

    // Add pagination
    if (options.limit) {
      sql += ' LIMIT ?';
      params.push(options.limit);
    }
    if (options.offset) {
      sql += ' OFFSET ?';
      params.push(options.offset);
    }

    const rows = await databaseConnection.all(sql, params);
    return rows as Member[];
  }

  /**
   * Create a new member with auto-generated member ID
   */
  async createMember(memberData: CreateMemberRequest): Promise<Member> {
    // Generate unique member ID (MEM-YYYY-XXX format)
    const memberId = await this.generateMemberId();

    const currentDate = new Date().toISOString();
    const registrationDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    const result = await databaseConnection.run(
      `INSERT INTO members (
        member_id, first_name, last_name, email, phone, address, status, 
        registration_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        memberId,
        memberData.first_name,
        memberData.last_name,
        memberData.email || null,
        memberData.phone || null,
        memberData.address || null,
        memberData.status || 'active',
        registrationDate,
        currentDate,
        currentDate,
      ]
    );

    const createdMember = await this.getMemberById(result.lastID);
    if (!createdMember) {
      throw new Error('Failed to retrieve created member');
    }
    return createdMember;
  }

  /**
   * Update an existing member by database ID
   */
  async updateMember(
    id: number,
    memberData: UpdateMemberRequest
  ): Promise<Member> {
    const updateFields: string[] = [];
    const params: unknown[] = [];

    // Build dynamic UPDATE query based on provided fields
    if (memberData.first_name !== undefined) {
      updateFields.push('first_name = ?');
      params.push(memberData.first_name);
    }
    if (memberData.last_name !== undefined) {
      updateFields.push('last_name = ?');
      params.push(memberData.last_name);
    }
    if (memberData.email !== undefined) {
      updateFields.push('email = ?');
      params.push(memberData.email || null);
    }
    if (memberData.phone !== undefined) {
      updateFields.push('phone = ?');
      params.push(memberData.phone || null);
    }
    if (memberData.address !== undefined) {
      updateFields.push('address = ?');
      params.push(memberData.address || null);
    }
    if (memberData.status !== undefined) {
      updateFields.push('status = ?');
      params.push(memberData.status);
    }

    // Always update the updated_at timestamp
    updateFields.push('updated_at = ?');
    params.push(new Date().toISOString());

    // Add the ID for WHERE clause
    params.push(id);

    const result = await databaseConnection.run(
      `UPDATE members SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    if (result.changes === 0) {
      throw new Error('Member not found or no changes made');
    }

    const updatedMember = await this.getMemberById(id);
    if (!updatedMember) {
      throw new Error('Failed to retrieve updated member');
    }
    return updatedMember;
  }

  /**
   * Delete a member by database ID
   */
  async deleteMember(id: number): Promise<boolean> {
    const result = await databaseConnection.run(
      'DELETE FROM members WHERE id = ?',
      [id]
    );

    // Check if any rows were affected (member was actually deleted)
    return result.changes > 0;
  }

  /**
   * Get members by status
   */
  async getMembersByStatus(status: MemberStatus): Promise<Member[]> {
    const rows = await databaseConnection.all(
      'SELECT * FROM members WHERE status = ? ORDER BY created_at DESC',
      [status]
    );
    return rows as Member[];
  }

  /**
   * Count total members
   */
  async getTotalMembersCount(): Promise<number> {
    const result = await databaseConnection.get(
      'SELECT COUNT(*) as count FROM members'
    );
    return result.count;
  }

  /**
   * Count members by status
   */
  async getMemberCountByStatus(status: MemberStatus): Promise<number> {
    const result = await databaseConnection.getOne(
      'SELECT COUNT(*) as count FROM members WHERE status = ?',
      [status]
    );
    return (result as { count: number }).count;
  }

  /**
   * Check if email already exists (for uniqueness validation)
   */
  async isEmailTaken(email: string, excludeId?: number): Promise<boolean> {
    let sql = 'SELECT COUNT(*) as count FROM members WHERE email = ?';
    const params: unknown[] = [email];

    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }

    const result = await databaseConnection.getOne(sql, params);
    return ((result as { count: number })?.count || 0) > 0;
  }

  /**
   * Generate a unique member ID in format MEM-YYYY-XXX
   */
  private async generateMemberId(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `MEM-${currentYear}-`;

    // Get the highest existing member ID for this year
    const result = await databaseConnection.getOne(
      `SELECT member_id FROM members 
       WHERE member_id LIKE ? 
       ORDER BY member_id DESC 
       LIMIT 1`,
      [`${prefix}%`]
    );

    let nextNumber = 1;
    if (result && (result as { member_id: string }).member_id) {
      // Extract the number from the existing ID (e.g., MEM-2024-005 -> 5)
      const lastId = (result as { member_id: string }).member_id;
      const lastNumber = parseInt(lastId.split('-')[2], 10);
      nextNumber = lastNumber + 1;
    }

    // Format with leading zeros (e.g., 001, 002, etc.)
    const formattedNumber = nextNumber.toString().padStart(3, '0');
    return `${prefix}${formattedNumber}`;
  }
}

export const memberRepository = new MemberRepository();
