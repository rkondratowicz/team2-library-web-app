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
   * Validates UK phone number format - Completely robust validation
   * Supports all valid UK phone number formats including:
   * - Mobile: 07xxx xxxxxx (11 digits total)
   * - London: 020 xxxx xxxx (11 digits total)
   * - Geographic: 01xxx xxxxxx (11 digits total)
   * - Non-geographic: 03xx xxx xxxx (11 digits total)
   * - International format: +44 xxxx xxxxxx (removes leading 0)
   */
  private validateUkPhoneNumber(phone: string): boolean {
    // Remove all whitespace, hyphens, brackets, dots and plus signs for validation
    const cleanPhone = phone.replace(/[\s\-().+]/g, '');

    // Handle international format - convert +44 to 0
    let normalizedPhone = cleanPhone;
    if (cleanPhone.startsWith('44') && cleanPhone.length === 12) {
      normalizedPhone = '0' + cleanPhone.substring(2);
    } else if (cleanPhone.startsWith('0044') && cleanPhone.length === 14) {
      normalizedPhone = '0' + cleanPhone.substring(4);
    }

    // Must be exactly 11 digits and start with 0
    if (!/^0\d{10}$/.test(normalizedPhone)) {
      return false;
    }

    // Extract area code (first 2-5 digits after 0)
    const areaCode = normalizedPhone.substring(0, 4); // First 4 digits for most specific checks
    const threeDigit = normalizedPhone.substring(0, 3); // First 3 digits
    const twoDigit = normalizedPhone.substring(0, 2); // First 2 digits

    // Mobile numbers: 07xxx xxxxxx
    if (twoDigit === '07') {
      // Valid mobile prefixes: 070x-075x, 077x-079x
      const mobilePrefix = normalizedPhone.substring(0, 3);
      return /^07[0-5789]/.test(mobilePrefix);
    }

    // London numbers: 020 xxxx xxxx
    if (threeDigit === '020') {
      return true;
    }

    // Geographic area codes: 01xxx xxxxxx
    if (twoDigit === '01') {
      // Common UK area codes (01xx)
      const validAreaCodes = [
        '0113',
        '0114',
        '0115',
        '0116',
        '0117',
        '0118',
        '0121',
        '0131',
        '0141',
        '0151',
        '0161',
        '0191',
        '01204',
        '01205',
        '01206',
        '01223',
        '01224',
        '01225',
        '01226',
        '01227',
        '01228',
        '01229',
        '01233',
        '01234',
        '01235',
        '01236',
        '01237',
        '01239',
        '01241',
        '01242',
        '01243',
        '01244',
        '01245',
        '01246',
        '01248',
        '01249',
        '01250',
        '01252',
        '01253',
        '01254',
        '01255',
        '01256',
        '01257',
        '01258',
        '01259',
        '01260',
        '01261',
        '01262',
        '01263',
        '01264',
        '01267',
        '01268',
        '01269',
        '01270',
        '01271',
        '01272',
        '01273',
        '01274',
        '01275',
        '01276',
        '01277',
        '01278',
        '01279',
        '01280',
        '01281',
        '01282',
        '01283',
        '01284',
        '01285',
        '01286',
        '01287',
        '01288',
        '01289',
        '01290',
        '01291',
        '01292',
        '01293',
        '01294',
        '01295',
        '01296',
        '01297',
        '01298',
        '01299',
        '01300',
        '01301',
        '01302',
        '01303',
        '01304',
        '01305',
        '01306',
        '01307',
        '01308',
        '01309',
        '01320',
        '01322',
        '01323',
        '01324',
        '01325',
        '01326',
        '01327',
        '01328',
        '01329',
        '01330',
        '01332',
        '01333',
        '01334',
        '01335',
        '01336',
        '01337',
        '01339',
        '01340',
        '01341',
        '01342',
        '01343',
        '01344',
        '01346',
        '01347',
        '01348',
        '01349',
        '01350',
        '01351',
        '01352',
        '01353',
        '01354',
        '01355',
        '01356',
        '01357',
        '01358',
        '01359',
        '01360',
        '01361',
        '01362',
        '01363',
        '01364',
        '01365',
        '01366',
        '01367',
        '01368',
        '01369',
        '01371',
        '01372',
        '01373',
        '01374',
        '01375',
        '01376',
        '01377',
        '01378',
        '01379',
        '01380',
        '01381',
        '01382',
        '01383',
        '01384',
        '01386',
        '01387',
        '01388',
        '01389',
        '01392',
        '01394',
        '01395',
        '01396',
        '01397',
        '01398',
        '01400',
        '01403',
        '01404',
        '01405',
        '01406',
        '01407',
        '01408',
        '01409',
        '01420',
        '01422',
        '01423',
        '01424',
        '01425',
        '01427',
        '01428',
        '01429',
        '01430',
        '01431',
        '01432',
        '01433',
        '01434',
        '01435',
        '01436',
        '01437',
        '01438',
        '01439',
        '01440',
        '01442',
        '01443',
        '01444',
        '01445',
        '01446',
        '01449',
        '01450',
        '01451',
        '01452',
        '01453',
        '01454',
        '01455',
        '01456',
        '01457',
        '01458',
        '01460',
        '01461',
        '01462',
        '01463',
        '01464',
        '01465',
        '01466',
        '01467',
        '01469',
        '01470',
        '01471',
        '01472',
        '01473',
        '01474',
        '01475',
        '01476',
        '01477',
        '01478',
        '01479',
        '01480',
        '01481',
        '01482',
        '01483',
        '01484',
        '01485',
        '01487',
        '01488',
        '01489',
        '01490',
        '01491',
        '01492',
        '01493',
        '01494',
        '01495',
        '01496',
        '01497',
        '01499',
        '01501',
        '01502',
        '01503',
        '01505',
        '01506',
        '01507',
        '01508',
        '01509',
        '01520',
        '01522',
        '01524',
        '01525',
        '01526',
        '01527',
        '01528',
        '01529',
        '01530',
        '01531',
        '01534',
        '01535',
        '01536',
        '01538',
        '01539',
        '01540',
        '01542',
        '01543',
        '01544',
        '01545',
        '01546',
        '01547',
        '01548',
        '01549',
        '01550',
        '01553',
        '01554',
        '01555',
        '01556',
        '01557',
        '01558',
        '01559',
        '01560',
        '01561',
        '01562',
        '01563',
        '01564',
        '01565',
        '01566',
        '01567',
        '01568',
        '01569',
        '01570',
        '01571',
        '01572',
        '01573',
        '01575',
        '01576',
        '01577',
        '01578',
        '01579',
        '01580',
        '01581',
        '01582',
        '01583',
        '01584',
        '01586',
        '01588',
        '01590',
        '01591',
        '01592',
        '01593',
        '01594',
        '01595',
        '01597',
        '01598',
        '01599',
        '01600',
        '01603',
        '01604',
        '01606',
        '01608',
        '01609',
        '01620',
        '01621',
        '01622',
        '01623',
        '01624',
        '01625',
        '01626',
        '01628',
        '01629',
        '01630',
        '01631',
        '01633',
        '01634',
        '01635',
        '01636',
        '01637',
        '01638',
        '01639',
        '01641',
        '01642',
        '01643',
        '01644',
        '01646',
        '01647',
        '01648',
        '01650',
        '01651',
        '01652',
        '01653',
        '01654',
        '01655',
        '01656',
        '01659',
        '01661',
        '01663',
        '01664',
        '01665',
        '01666',
        '01667',
        '01668',
        '01669',
        '01670',
        '01671',
        '01672',
        '01673',
        '01674',
        '01675',
        '01676',
        '01677',
        '01678',
        '01680',
        '01681',
        '01683',
        '01684',
        '01685',
        '01686',
        '01687',
        '01688',
        '01689',
        '01690',
        '01691',
        '01692',
        '01694',
        '01695',
        '01697',
        '01698',
        '01700',
        '01701',
        '01702',
        '01704',
        '01706',
        '01707',
        '01708',
        '01709',
        '01720',
        '01721',
        '01722',
        '01723',
        '01724',
        '01725',
        '01726',
        '01727',
        '01728',
        '01729',
        '01730',
        '01732',
        '01733',
        '01734',
        '01736',
        '01737',
        '01738',
        '01740',
        '01743',
        '01744',
        '01745',
        '01746',
        '01747',
        '01748',
        '01749',
        '01750',
        '01751',
        '01752',
        '01753',
        '01754',
        '01756',
        '01757',
        '01758',
        '01759',
        '01760',
        '01761',
        '01763',
        '01764',
        '01765',
        '01766',
        '01767',
        '01768',
        '01769',
        '01770',
        '01771',
        '01772',
        '01773',
        '01774',
        '01775',
        '01776',
        '01777',
        '01778',
        '01779',
        '01780',
        '01782',
        '01784',
        '01785',
        '01786',
        '01787',
        '01788',
        '01789',
        '01790',
        '01792',
        '01793',
        '01794',
        '01795',
        '01796',
        '01797',
        '01798',
        '01799',
        '01803',
        '01805',
        '01806',
        '01807',
        '01808',
        '01809',
        '01821',
        '01822',
        '01823',
        '01824',
        '01825',
        '01827',
        '01828',
        '01829',
        '01830',
        '01832',
        '01833',
        '01834',
        '01835',
        '01837',
        '01838',
        '01840',
        '01841',
        '01842',
        '01843',
        '01844',
        '01845',
        '01847',
        '01848',
        '01851',
        '01852',
        '01854',
        '01855',
        '01856',
        '01857',
        '01858',
        '01859',
        '01862',
        '01863',
        '01864',
        '01865',
        '01866',
        '01869',
        '01870',
        '01871',
        '01872',
        '01873',
        '01874',
        '01875',
        '01876',
        '01877',
        '01878',
        '01879',
        '01880',
        '01882',
        '01883',
        '01884',
        '01885',
        '01886',
        '01887',
        '01888',
        '01889',
        '01890',
        '01892',
        '01895',
        '01896',
        '01899',
        '01900',
        '01902',
        '01903',
        '01904',
        '01905',
        '01906',
        '01908',
        '01909',
        '01913',
        '01914',
        '01915',
        '01916',
        '01917',
        '01918',
        '01919',
        '01920',
        '01922',
        '01923',
        '01924',
        '01925',
        '01926',
        '01928',
        '01929',
        '01930',
        '01931',
        '01932',
        '01933',
        '01934',
        '01935',
        '01937',
        '01938',
        '01939',
        '01942',
        '01943',
        '01944',
        '01945',
        '01946',
        '01947',
        '01948',
        '01949',
        '01950',
        '01951',
        '01952',
        '01953',
        '01954',
        '01955',
        '01957',
        '01959',
        '01961',
        '01962',
        '01963',
        '01964',
        '01965',
        '01967',
        '01968',
        '01969',
        '01970',
        '01971',
        '01972',
        '01973',
        '01974',
        '01975',
        '01977',
        '01978',
        '01980',
        '01981',
        '01982',
        '01983',
        '01984',
        '01985',
        '01986',
        '01987',
        '01988',
        '01989',
      ];

      // Check against known area codes (3-5 digit codes)
      for (let i = 5; i >= 3; i--) {
        const code = normalizedPhone.substring(0, i + 1);
        if (validAreaCodes.includes(code)) {
          return true;
        }
      }

      // Fallback for any 01 number that follows basic pattern
      return /^01\d{9}$/.test(normalizedPhone);
    }

    // Non-geographic numbers: 03xx xxx xxxx
    if (twoDigit === '03') {
      return /^03\d{9}$/.test(normalizedPhone);
    }

    // Special services (08xx, 09xx) - typically not personal numbers but valid UK numbers
    if (twoDigit === '08' || twoDigit === '09') {
      return /^0[89]\d{9}$/.test(normalizedPhone);
    }

    return false;
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

  /**
   * Get count of members with active borrows
   */
  async getMembersWithActiveBorrowsCount(): Promise<number> {
    return await this.memberRepository.getMembersWithActiveBorrowsCount();
  }

  /**
   * Get count of members with overdue borrows
   */
  async getMembersWithOverdueCount(): Promise<number> {
    return await this.memberRepository.getMembersWithOverdueCount();
  }
}

// Create and export member service instance
import { memberRepository } from '../../data-access/repositories/MemberRepository.js';
export const memberService = new MemberService(memberRepository);
