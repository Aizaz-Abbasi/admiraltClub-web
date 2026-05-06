import { API_ENDPOINTS, apiGet, Member } from '../api';

interface MemberApiItem {
  userId: number | string;
  name: string;
  email: string;
  type: string | null;
  status: string | null;
  rounds: number | null;
  avgScore: number | null;
}

interface MembersApiResponse {
  success?: boolean;
  members?: MemberApiItem[];
}

const mapMembershipType = (type: string | null): Member['membershipType'] => {
  if (type === 'yearly' || type === 'monthly' || type === 'daypass') return type;
  return 'monthly';
};

const mapStatus = (status: string | null): Member['status'] => {
  if (!status) return 'expired';
  const normalized = status.toLowerCase();
  if (normalized === 'active' || normalized === 'suspended' || normalized === 'expired') {
    return normalized;
  }
  return 'expired';
};

export async function fetchMembers(): Promise<Member[]> {
  const response = await apiGet<MembersApiResponse>(API_ENDPOINTS.admin.members);
  const members = response.members || [];

  return members.map((member) => ({
    id: String(member.userId),
    name: member.name || '',
    email: member.email || '',
    membershipType: mapMembershipType(member.type),
    status: mapStatus(member.status),
    totalRounds: member.rounds ?? 0,
    avgScore: member.avgScore ?? 0,
  }));
}


