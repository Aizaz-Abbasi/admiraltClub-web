export interface AuthRequestPayload {
  name?: string;
  email: string;
  password: string;
}

export interface AuthApiResponse {
  token?: string;
  user?: {
    name?: string;
    email?: string;
    role?: string;
  };
  name?: string;
  email?: string;
  role?: string;
}


export interface LocationsResponse {
  success: boolean;
  locations: Location[];
}


export interface Location {
  id: number;
  name: string;
  address: string;
  createdAt: string;
}

export interface Simulator {
  id: number;
  location?: string
  locationId: number;
  name: string;
  status: 'ACTIVE' | 'MAINTENANCE';
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
  isAvailable: boolean;
  spotsTotal: number;
  spotsUsed: number;
  spotsAvailable: number;
  price?: number;
}

export interface Reservation {
  id: string;
  userId: string;
  userName: string;
  simulatorId: string;
  simulatorName: string;
  locationName: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  doorCode: string;
  status: 'booked' | 'cancelled' | 'completed';
}

export interface PlayerScore {
  id: string;
  rank: number;
  name: string;
  handicap: number;
  recentScore: number;
  course: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  membershipType: 'monthly' | 'yearly' | 'daypass';
  joinDate?: string;
  status: 'active' | 'suspended' | 'expired';
  totalRounds: number;
  avgScore: number;
}

export interface Score {
  id: string;
  playerId: string;
  playerName: string;
  course: string;
  score: number;
  date: string;
  simulator: string;
  notes?: string;
}