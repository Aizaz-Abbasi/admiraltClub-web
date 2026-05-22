import { API_ENDPOINTS, apiGet, apiPatch, apiPost, Simulator, TimeSlot } from "../api";

interface SlotsApiResponse {
    success?: boolean;
    date: string
    simulator: Simulator
    slots?: TimeSlot[];
}

export type ReservationStatus = 'BOOKED' | 'CANCELLED' | 'COMPLETED'; // extend if needed

export interface Reservation {
    id: number;
    startTime: string; // ISO string
    endTime: string;
    doorCode: string;
    status: ReservationStatus;
    createdAt: string;
    simulator: Simulator;
    user?: User
}

export interface User {
    id: number,
    name: string,
    email: string
}

export interface ReservationsResponse {
    success: boolean;
    total: number;
    page: number;
    limit: number;
    reservations: Reservation[];
}

// In services/slots.ts — normalize to match your TimeSlot interface
export async function fetchSlots(date: string, simulatorId: number) {
    let url = `${API_ENDPOINTS.booking.slots}?date=${date}&simulatorId=${simulatorId}`
    const response = await apiGet<SlotsApiResponse>(url);
    //const simulator = response.simulator || [];
    const slots = response.slots || [];

    return slots.map((s: any) => ({
        ...s,
        id: s.slotIndex,
        isAvailable: s.status === 'AVAILABLE',
        spotsTotal: s.spotsTotal ?? 4,
        spotsUsed: s.spotsUsed ?? 0,
        spotsAvailable: s.spotsAvailable ?? 4,
    }));
}

export const bookSlot = async (
    simulatorId: number,
    date: string,
    slotIndex: string
) => {
    let params = { simulatorId, date, slotIndex }
    console.log("params", params);

    const data = await apiPost<{ success: boolean; message: string; reservation: any }>(
        'reservations/book',
        params
    );

    return data.reservation;
};


// In services/slots.ts — normalize to match your TimeSlot interface
export async function fetchMyBookings(status: string) {
    let url = `${API_ENDPOINTS.booking.myBooking}?status=${status}&page=1&limit=100`
    const response = await apiGet<ReservationsResponse>(url);

    return response.reservations || [];
}

export const cancelBooking = async (reservationId: number) => {
    const data = await apiPatch<{
        success: boolean;
        message: string;
        reservation: Reservation;
    }>(
        `${API_ENDPOINTS.booking.cancel}/${reservationId}/cancel`
    );

    return data.reservation;
};

export async function fetchAllBookings(status: string, search?: string) {
    let url = `${API_ENDPOINTS.booking.allBookings}?status=${status}&userName=${search}&page=1&limit=100`
    const response = await apiGet<ReservationsResponse>(url);

    return response.reservations || [];
}
