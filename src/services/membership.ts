import { apiGet, apiPost } from '../api';

export type MembershipType = 'MONTHLY' | 'MONTHLY_PREMIUM' | 'YEARLY' | 'DAY_PASS';

export interface Membership {
    id: number;
    userId: number;
    type: MembershipType;
    status: string;
    startDate: string;
    endDate: string | null;
    createdAt: string;
}

export interface DayPass {
    id: number;
    userId: number;
    status: 'unused' | 'used';
    bookingId: number | null;
    guestUserId: number | null;
    stripeId: string | null;
    createdAt: string;
    booking?: {
        id: number;
        startTime: string;
        endTime: string;
        simulator: { name: string; location: { name: string } };
    };
    guestUser?: {
        id: number;
        name: string;
        email: string;
    } | null;
}

export interface GuestUser {
    id: number;
    name: string;
    email: string;
}

export interface VerifySessionResult {
    purchaseType: string;
    membership?: Membership | null;
    dayPass?: DayPass | null;
}

export interface Plan {
    label: string;
    amount: number | null;
    currency: string;
}

export interface PlansResponse {
    MONTHLY: Plan;
    MONTHLY_PREMIUM: Plan;
    YEARLY: Plan;
    DAY_PASS: Plan;
}

export async function fetchPlans(): Promise<PlansResponse> {
    const res = await apiGet<{ success: boolean; plans: PlansResponse }>('membership/plans');
    return res.plans;
}

export async function fetchMyMembership() {
    const res = await apiGet<{ success: boolean; membership: Membership | null }>('membership/my');
    return res.membership;
}

export async function fetchMyDayPasses(): Promise<DayPass[]> {
    const res = await apiGet<{ success: boolean; dayPasses: DayPass[] }>('membership/day-passes');
    return res.dayPasses;
}

export async function createCheckoutSession(type: MembershipType): Promise<string> {
    const res = await apiPost<{ success: boolean; url: string }>('membership/checkout', { type });
    return res.url;
}

export async function verifyCheckoutSession(sessionId: string): Promise<VerifySessionResult> {
    const res = await apiPost<{ success: boolean } & VerifySessionResult>(
        'membership/verify-session',
        { sessionId }
    );
    return { purchaseType: res.purchaseType, membership: res.membership, dayPass: res.dayPass };
}

export async function createGuestUser(
    dayPassId: number,
    bookingId: number,
    name: string,
    email: string,
): Promise<GuestUser> {
    const res = await apiPost<{ success: boolean; message: string; guest: GuestUser }>(
        'membership/create-guest',
        { dayPassId, bookingId, name, email }
    );
    return res.guest;
}

export async function cancelMembership() {
    return apiPost<{ success: boolean; message: string }>('membership/cancel', {});
}
