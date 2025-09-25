import {
  type CreateMemberRequest,
  type Member,
  type MemberSearchOptions,
  type MemberStats,
  MemberStatus,
  type PaginationOptions,
  type UpdateMemberRequest,
} from '../../application/models/Member.js';
import { databaseConnection } from '../DatabaseConnection.js';

export class MemberRepository {
  // Create a new member
  async create(memberData: CreateMemberRequest): Promise<Member> {
    const memberId =
      memberData.member_id || (await this.generateNextMemberId());

    const sql = `
      INSERT INTO members (member_id, first_name, last_name, email, phone, address, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      memberId,
      memberData.first_name,
      memberData.last_name,
      memberData.email || null,
      memberData.phone || null,
      memberData.address || null,
      memberData.status || MemberStatus.ACTIVE,
    ];

    try {
      await databaseConnection.run(sql, params);

      const newMember = await this.findByMemberId(memberId);
      if (!newMember) {
        throw new Error('Failed to retrieve created member');
      }

      return newMember;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes('UNIQUE constraint failed: members.member_id')
      ) {
        throw new Error(`Member ID ${memberId} already exists`);
      }
      if (errorMessage.includes('UNIQUE constraint failed: members.email')) {
        throw new Error(`Email ${memberData.email} is already registered`);
      }
      throw error;
    }
  }

  // Find member by internal ID
  async findById(id: number): Promise<Member | null> {
    const sql = 'SELECT * FROM members WHERE id = ?';
    const result = await databaseConnection.getOne(sql, [id]);
    return result as Member | null;
  }

  // Find member by member_id (external identifier)
  async findByMemberId(memberId: string): Promise<Member | null> {
    const sql = 'SELECT * FROM members WHERE member_id = ?';
    const result = await databaseConnection.getOne(sql, [memberId]);
    return result as Member | null;
  }

  // Find member by email
  async findByEmail(email: string): Promise<Member | null> {
    const sql = 'SELECT * FROM members WHERE email = ?';
    const result = await databaseConnection.getOne(sql, [email]);
    return result as Member | null;
  }

  // Find all members with pagination
  async findAll(options: PaginationOptions = {}): Promise<Member[]> {
    const { limit = 50, offset = 0 } = options;

    const sql = `
      SELECT * FROM members 
      ORDER BY last_name, first_name 
      LIMIT ? OFFSET ?
    `;

    const results = await databaseConnection.all(sql, [limit, offset]);
    return results as Member[];
  }

  // Search members by name or member ID
  async search(
    query: string,
    options: PaginationOptions = {}
  ): Promise<Member[]> {
    const { limit = 50, offset = 0 } = options;
    const searchPattern = `%${query}%`;

    const sql = `
      SELECT * FROM members 
      WHERE member_id LIKE ? 
         OR first_name LIKE ? 
         OR last_name LIKE ?
         OR (first_name || ' ' || last_name) LIKE ?
      ORDER BY last_name, first_name
      LIMIT ? OFFSET ?
    `;

    const results = await databaseConnection.all(sql, [
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      limit,
      offset,
    ]);
    return results as Member[];
  }

  // Find members by status
  async findByStatus(
    status: MemberStatus,
    options: PaginationOptions = {}
  ): Promise<Member[]> {
    const { limit = 50, offset = 0 } = options;

    const sql = `
      SELECT * FROM members 
      WHERE status = ?
      ORDER BY last_name, first_name
      LIMIT ? OFFSET ?
    `;

    const results = await databaseConnection.all(sql, [status, limit, offset]);
    return results as Member[];
  }

  // Find active members
  async findActiveMembers(options: PaginationOptions = {}): Promise<Member[]> {
    return this.findByStatus(MemberStatus.ACTIVE, options);
  }

  // Find new members within specified number of days
  async findNewMembers(days: number): Promise<Member[]> {
    const sql = `
      SELECT * FROM members 
      WHERE registration_date >= date('now', '-${days} days')
      ORDER BY registration_date DESC, last_name, first_name
    `;

    const results = await databaseConnection.all(sql, []);
    return results as Member[];
  }

  // Find members by registration date range
  async findMembersByRegistrationDateRange(
    start: Date,
    end: Date
  ): Promise<Member[]> {
    const startDate = start.toISOString().split('T')[0];
    const endDate = end.toISOString().split('T')[0];

    const sql = `
      SELECT * FROM members 
      WHERE registration_date BETWEEN ? AND ?
      ORDER BY registration_date DESC, last_name, first_name
    `;

    const results = await databaseConnection.all(sql, [startDate, endDate]);
    return results as Member[];
  }

  // Update member
  async update(
    id: number,
    updates: UpdateMemberRequest
  ): Promise<Member | null> {
    const fields = [];
    const values = [];

    if (updates.first_name !== undefined) {
      fields.push('first_name = ?');
      values.push(updates.first_name);
    }
    if (updates.last_name !== undefined) {
      fields.push('last_name = ?');
      values.push(updates.last_name);
    }
    if (updates.email !== undefined) {
      fields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.phone !== undefined) {
      fields.push('phone = ?');
      values.push(updates.phone);
    }
    if (updates.address !== undefined) {
      fields.push('address = ?');
      values.push(updates.address);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }

    if (fields.length === 0) {
      // No updates provided
      return this.findById(id);
    }

    // Add updated_at timestamp
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const sql = `UPDATE members SET ${fields.join(', ')} WHERE id = ?`;

    try {
      await databaseConnection.run(sql, values);
      return this.findById(id);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('UNIQUE constraint failed: members.email')) {
        throw new Error(`Email ${updates.email} is already registered`);
      }
      throw error;
    }
  }

  // Delete member (soft delete by setting status to inactive)
  async delete(id: number): Promise<boolean> {
    const sql =
      'UPDATE members SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';

    try {
      await databaseConnection.run(sql, [MemberStatus.INACTIVE, id]);
      return true;
    } catch (_error) {
      return false;
    }
  }

  // Hard delete member (permanently remove from database)
  async hardDelete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM members WHERE id = ?';

    try {
      await databaseConnection.run(sql, [id]);
      return true;
    } catch (_error) {
      return false;
    }
  }

  // Count total members
  async count(): Promise<number> {
    const result = await databaseConnection.get(
      'SELECT COUNT(*) as count FROM members'
    );
    return result.count as number;
  }

  // Count members by status
  async countByStatus(status: MemberStatus): Promise<number> {
    const result = (await databaseConnection.getOne(
      'SELECT COUNT(*) as count FROM members WHERE status = ?',
      [status]
    )) as { count: number };
    return result.count;
  }

  // Generate next member ID
  async generateNextMemberId(): Promise<string> {
    const result = await databaseConnection.get(
      'SELECT COUNT(*) as count FROM members'
    );
    const count = result.count as number;
    const nextNumber = count + 1;
    return `M${nextNumber.toString().padStart(3, '0')}`;
  }

  // Check if member ID exists
  async checkMemberIdExists(memberId: string): Promise<boolean> {
    const result = (await databaseConnection.getOne(
      'SELECT COUNT(*) as count FROM members WHERE member_id = ?',
      [memberId]
    )) as { count: number };
    return result.count > 0;
  }

  // Get member statistics
  async getMemberStatistics(): Promise<MemberStats> {
    const totalResult = await databaseConnection.get(
      'SELECT COUNT(*) as count FROM members'
    );
    const activeResult = await databaseConnection.getOne(
      'SELECT COUNT(*) as count FROM members WHERE status = ?',
      [MemberStatus.ACTIVE]
    );
    const inactiveResult = await databaseConnection.getOne(
      'SELECT COUNT(*) as count FROM members WHERE status = ?',
      [MemberStatus.INACTIVE]
    );
    const suspendedResult = await databaseConnection.getOne(
      'SELECT COUNT(*) as count FROM members WHERE status = ?',
      [MemberStatus.SUSPENDED]
    );
    const newThisMonthResult = await databaseConnection.get(
      "SELECT COUNT(*) as count FROM members WHERE registration_date >= date('now', 'start of month')"
    );
    const newThisYearResult = await databaseConnection.get(
      "SELECT COUNT(*) as count FROM members WHERE registration_date >= date('now', 'start of year')"
    );

    return {
      total: totalResult.count as number,
      active: (activeResult as { count: number }).count,
      inactive: (inactiveResult as { count: number }).count,
      suspended: (suspendedResult as { count: number }).count,
      newThisMonth: newThisMonthResult.count as number,
      newThisYear: newThisYearResult.count as number,
    };
  }

  // Advanced search with multiple filters
  async advancedSearch(options: MemberSearchOptions): Promise<Member[]> {
    const conditions = [];
    const params = [];

    if (options.query) {
      conditions.push(`(
        member_id LIKE ? OR 
        first_name LIKE ? OR 
        last_name LIKE ? OR 
        (first_name || ' ' || last_name) LIKE ?
      )`);
      const searchPattern = `%${options.query}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (options.status) {
      conditions.push('status = ?');
      params.push(options.status);
    }

    if (options.registrationDateFrom) {
      conditions.push('registration_date >= ?');
      params.push(options.registrationDateFrom);
    }

    if (options.registrationDateTo) {
      conditions.push('registration_date <= ?');
      params.push(options.registrationDateTo);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = options.limit || 50;
    const offset = options.offset || 0;

    const sql = `
      SELECT * FROM members 
      ${whereClause}
      ORDER BY last_name, first_name
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const results = await databaseConnection.all(sql, params);
    return results as Member[];
  }
}
