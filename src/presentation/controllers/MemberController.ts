import type { Request, Response } from 'express';
import { MemberStatus } from '../../application/models/Member.js';
import { memberService } from '../../application/services/MemberService.js';

export class MemberController {
  /**
   * GET /api/members - Get all members
   */
  async getAllMembers(_req: Request, res: Response): Promise<void> {
    try {
      const members = await memberService.getAllMembers();
      res.json(members);
    } catch (error) {
      console.error('Error fetching members:', error);
      res.status(500).json({ error: 'Failed to fetch members' });
    }
  }

  /**
   * GET /api/members/:id - Get member by ID
   */
  async getMemberById(req: Request, res: Response): Promise<void> {
    try {
      const memberId = Number.parseInt(req.params.id, 10);
      if (Number.isNaN(memberId)) {
        res.status(400).json({ error: 'Invalid member ID format' });
        return;
      }

      const member = await memberService.getMemberById(memberId);
      if (member) {
        res.json(member);
      } else {
        res.status(404).json({ error: 'Member not found' });
      }
    } catch (error) {
      console.error('Error fetching member:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch member' });
      }
    }
  }

  /**
   * GET /api/members/member-id/:memberId - Get member by member ID (MEM-YYYY-XXX)
   */
  async getMemberByMemberId(req: Request, res: Response): Promise<void> {
    try {
      const memberId = req.params.memberId;
      const member = await memberService.getMemberByMemberId(memberId);
      if (member) {
        res.json(member);
      } else {
        res.status(404).json({ error: 'Member not found' });
      }
    } catch (error) {
      console.error('Error fetching member by member ID:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch member' });
      }
    }
  }

  /**
   * GET /api/members/search - Search members
   */
  async searchMembers(req: Request, res: Response): Promise<void> {
    try {
      const searchOptions = {
        search_term: req.query.q as string,
        status: req.query.status as MemberStatus,
        limit: req.query.limit
          ? Number.parseInt(req.query.limit as string, 10)
          : undefined,
        offset: req.query.offset
          ? Number.parseInt(req.query.offset as string, 10)
          : undefined,
      };

      // Remove undefined values
      const cleanSearchOptions = Object.fromEntries(
        Object.entries(searchOptions).filter(([, value]) => value !== undefined)
      );

      const members = await memberService.searchMembers(cleanSearchOptions);
      res.json(members);
    } catch (error) {
      console.error('Error searching members:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to search members' });
      }
    }
  }

  /**
   * POST /api/members - Create new member
   */
  async createMember(req: Request, res: Response): Promise<void> {
    try {
      const memberData = req.body;

      // Validate required fields
      if (!memberData.first_name || !memberData.last_name) {
        res
          .status(400)
          .json({ error: 'First name and last name are required' });
        return;
      }

      const newMember = await memberService.createMember(memberData);
      res.status(201).json(newMember);
    } catch (error) {
      console.error('Error creating member:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create member' });
      }
    }
  }

  /**
   * PUT /api/members/:id - Update member
   */
  async updateMember(req: Request, res: Response): Promise<void> {
    try {
      const memberId = Number.parseInt(req.params.id, 10);
      if (Number.isNaN(memberId)) {
        res.status(400).json({ error: 'Invalid member ID format' });
        return;
      }

      const memberData = req.body;
      const updatedMember = await memberService.updateMember(
        memberId,
        memberData
      );
      res.json(updatedMember);
    } catch (error) {
      console.error('Error updating member:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update member' });
      }
    }
  }

  /**
   * PUT /api/members/:id/status - Update member status
   */
  async updateMemberStatus(req: Request, res: Response): Promise<void> {
    try {
      const memberId = Number.parseInt(req.params.id, 10);
      if (Number.isNaN(memberId)) {
        res.status(400).json({ error: 'Invalid member ID format' });
        return;
      }

      const { status } = req.body;
      if (!status || !Object.values(MemberStatus).includes(status)) {
        res.status(400).json({
          error: `Invalid status. Must be one of: ${Object.values(MemberStatus).join(', ')}`,
        });
        return;
      }

      const updatedMember = await memberService.updateMemberStatus(
        memberId,
        status
      );
      res.json(updatedMember);
    } catch (error) {
      console.error('Error updating member status:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update member status' });
      }
    }
  }

  /**
   * DELETE /api/members/:id - Delete member (soft delete)
   */
  async deleteMember(req: Request, res: Response): Promise<void> {
    try {
      const memberId = Number.parseInt(req.params.id, 10);
      if (Number.isNaN(memberId)) {
        res.status(400).json({ error: 'Invalid member ID format' });
        return;
      }

      const success = await memberService.deleteMember(memberId);
      if (success) {
        res.status(204).send(); // No content
      } else {
        res.status(404).json({ error: 'Member not found' });
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete member' });
      }
    }
  }

  /**
   * GET /api/members/status/:status - Get members by status
   */
  async getMembersByStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = req.params.status as MemberStatus;
      if (!Object.values(MemberStatus).includes(status)) {
        res.status(400).json({
          error: `Invalid status. Must be one of: ${Object.values(MemberStatus).join(', ')}`,
        });
        return;
      }

      const members = await memberService.getMembersByStatus(status);
      res.json(members);
    } catch (error) {
      console.error('Error fetching members by status:', error);
      res.status(500).json({ error: 'Failed to fetch members by status' });
    }
  }

  /**
   * GET /api/members/statistics - Get member statistics
   */
  async getMemberStatistics(_req: Request, res: Response): Promise<void> {
    try {
      const totalCount = await memberService.getTotalMemberCount();
      const statusCounts = await memberService.getMemberCountByStatus();

      const statistics = {
        total_members: totalCount,
        active_members: statusCounts[MemberStatus.ACTIVE],
        inactive_members: statusCounts[MemberStatus.INACTIVE],
        suspended_members: statusCounts[MemberStatus.SUSPENDED],
      };

      res.json(statistics);
    } catch (error) {
      console.error('Error fetching member statistics:', error);
      res.status(500).json({ error: 'Failed to fetch member statistics' });
    }
  }
}

// Create and export member controller instance
export const memberController = new MemberController();
