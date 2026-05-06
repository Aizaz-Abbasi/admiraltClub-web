import {
  Location,
  Simulator,
  Reservation,
  PlayerScore,
  Member,
  Score
} from
  '../api';

export const mockLocations: Location[] = [
  {
    id: 1,
    name: 'Admiralty Club Downtown',
    address: '120 Broadway, New York, NY',
    image:
      'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 2,
    name: 'Admiralty Club West',
    address: '450 W 33rd St, New York, NY',
    image:
      'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&q=80&w=800'
  }];

export const mockSimulators: Simulator[] = [
  {
    id: 1,
    locationId: 'loc-1',
    name: 'Bay 1 - St. Andrews',
    status: 'active'
  },
  {
    id: 'sim-2',
    locationId: 'loc-1',
    name: 'Bay 2 - Pebble Beach',
    status: 'active'
  },
  {
    id: 'sim-3',
    locationId: 'loc-1',
    name: 'Bay 3 - Augusta',
    status: 'maintenance'
  },
  {
    id: 'sim-4',
    locationId: 'loc-2',
    name: 'Bay 1 - Sawgrass',
    status: 'active'
  },
  {
    id: 'sim-5',
    locationId: 'loc-2',
    name: 'Bay 2 - Pinehurst',
    status: 'active'
  },
  {
    id: 'sim-6',
    locationId: 'loc-2',
    name: 'Bay 3 - Bethpage',
    status: 'active'
  }];

export const mockReservations: Reservation[] = [
  {
    id: 'res-1',
    userId: 'user-1',
    userName: 'John Doe',
    simulatorId: 'sim-1',
    simulatorName: 'Bay 1 - St. Andrews',
    locationName: 'Admiralty Club Downtown',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '12:00',
    doorCode: '4729',
    status: 'booked'
  },
  {
    id: 'res-2',
    userId: 'user-2',
    userName: 'Sarah Smith',
    simulatorId: 'sim-2',
    simulatorName: 'Bay 2 - Pebble Beach',
    locationName: 'Admiralty Club Downtown',
    date: new Date().toISOString().split('T')[0],
    startTime: '16:00',
    endTime: '20:00',
    doorCode: '8192',
    status: 'booked'
  },
  {
    id: 'res-3',
    userId: 'user-1',
    userName: 'John Doe',
    simulatorId: 'sim-4',
    simulatorName: 'Bay 1 - Sawgrass',
    locationName: 'Admiralty Club West',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], // 2 days ago
    startTime: '12:00',
    endTime: '16:00',
    doorCode: '1029',
    status: 'completed'
  }];

export const mockLeaderboard: PlayerScore[] = [
  {
    id: 'p-1',
    rank: 1,
    name: 'Michael Chen',
    handicap: +2.1,
    recentScore: 68,
    course: 'St. Andrews'
  },
  {
    id: 'p-2',
    rank: 2,
    name: 'Sarah Smith',
    handicap: +1.5,
    recentScore: 70,
    course: 'Pebble Beach'
  },
  {
    id: 'p-3',
    rank: 3,
    name: 'James Wilson',
    handicap: 0.0,
    recentScore: 72,
    course: 'Augusta'
  },
  {
    id: 'p-4',
    rank: 4,
    name: 'David Brown',
    handicap: 2.4,
    recentScore: 74,
    course: 'Sawgrass'
  },
  {
    id: 'p-5',
    rank: 5,
    name: 'Emma Davis',
    handicap: 3.1,
    recentScore: 75,
    course: 'Pinehurst'
  },
  {
    id: 'p-6',
    rank: 6,
    name: 'John Doe',
    handicap: 4.5,
    recentScore: 77,
    course: 'Bethpage'
  },
  {
    id: 'p-7',
    rank: 7,
    name: 'Robert Taylor',
    handicap: 5.2,
    recentScore: 78,
    course: 'St. Andrews'
  },
  {
    id: 'p-8',
    rank: 8,
    name: 'William Anderson',
    handicap: 6.0,
    recentScore: 80,
    course: 'Pebble Beach'
  }];

export const mockMembers: Member[] = [
  {
    id: 'm-1',
    name: 'Michael Chen',
    email: 'michael@example.com',
    membershipType: 'yearly',
    joinDate: '2023-01-15',
    status: 'active',
    totalRounds: 45,
    avgScore: 71.2
  },
  {
    id: 'm-2',
    name: 'Sarah Smith',
    email: 'sarah@example.com',
    membershipType: 'monthly',
    joinDate: '2023-03-22',
    status: 'active',
    totalRounds: 32,
    avgScore: 73.5
  },
  {
    id: 'm-3',
    name: 'James Wilson',
    email: 'james@example.com',
    membershipType: 'yearly',
    joinDate: '2022-11-10',
    status: 'active',
    totalRounds: 88,
    avgScore: 72.0
  },
  {
    id: 'm-4',
    name: 'David Brown',
    email: 'david@example.com',
    membershipType: 'monthly',
    joinDate: '2023-06-05',
    status: 'active',
    totalRounds: 18,
    avgScore: 76.4
  },
  {
    id: 'm-5',
    name: 'Emma Davis',
    email: 'emma@example.com',
    membershipType: 'daypass',
    joinDate: '2023-08-12',
    status: 'expired',
    totalRounds: 3,
    avgScore: 82.1
  },
  {
    id: 'm-6',
    name: 'John Doe',
    email: 'john@example.com',
    membershipType: 'monthly',
    joinDate: '2023-02-28',
    status: 'active',
    totalRounds: 24,
    avgScore: 77.0
  },
  {
    id: 'm-7',
    name: 'Robert Taylor',
    email: 'robert@example.com',
    membershipType: 'yearly',
    joinDate: '2022-09-15',
    status: 'suspended',
    totalRounds: 56,
    avgScore: 79.8
  },
  {
    id: 'm-8',
    name: 'William Anderson',
    email: 'william@example.com',
    membershipType: 'monthly',
    joinDate: '2023-05-20',
    status: 'active',
    totalRounds: 12,
    avgScore: 81.5
  }];

export const mockScores: Score[] = [
  {
    id: 's-1',
    playerId: 'm-6',
    playerName: 'John Doe',
    course: 'St. Andrews',
    score: 72,
    date: '2023-10-15',
    simulator: 'Bay 1 - St. Andrews',
    notes: 'Great round, putting was solid.'
  },
  {
    id: 's-2',
    playerId: 'm-6',
    playerName: 'John Doe',
    course: 'Pebble Beach',
    score: 78,
    date: '2023-10-08',
    simulator: 'Bay 2 - Pebble Beach'
  },
  {
    id: 's-3',
    playerId: 'm-6',
    playerName: 'John Doe',
    course: 'Augusta',
    score: 75,
    date: '2023-10-01',
    simulator: 'Bay 3 - Augusta',
    notes: 'Struggled on the back nine.'
  },
  {
    id: 's-4',
    playerId: 'm-6',
    playerName: 'John Doe',
    course: 'Sawgrass',
    score: 80,
    date: '2023-09-24',
    simulator: 'Bay 1 - Sawgrass'
  },
  {
    id: 's-5',
    playerId: 'm-6',
    playerName: 'John Doe',
    course: 'Pinehurst',
    score: 77,
    date: '2023-09-17',
    simulator: 'Bay 2 - Pinehurst'
  },
  {
    id: 's-6',
    playerId: 'm-6',
    playerName: 'John Doe',
    course: 'Bethpage',
    score: 79,
    date: '2023-09-10',
    simulator: 'Bay 3 - Bethpage'
  },
  {
    id: 's-7',
    playerId: 'm-1',
    playerName: 'Michael Chen',
    course: 'St. Andrews',
    score: 68,
    date: '2023-10-14',
    simulator: 'Bay 1 - St. Andrews'
  },
  {
    id: 's-8',
    playerId: 'm-1',
    playerName: 'Michael Chen',
    course: 'Augusta',
    score: 70,
    date: '2023-10-07',
    simulator: 'Bay 3 - Augusta'
  },
  {
    id: 's-9',
    playerId: 'm-2',
    playerName: 'Sarah Smith',
    course: 'Pebble Beach',
    score: 70,
    date: '2023-10-12',
    simulator: 'Bay 2 - Pebble Beach'
  },
  {
    id: 's-10',
    playerId: 'm-3',
    playerName: 'James Wilson',
    course: 'Augusta',
    score: 72,
    date: '2023-10-10',
    simulator: 'Bay 3 - Augusta'
  },
  {
    id: 's-11',
    playerId: 'm-4',
    playerName: 'David Brown',
    course: 'Sawgrass',
    score: 74,
    date: '2023-10-05',
    simulator: 'Bay 1 - Sawgrass'
  },
  {
    id: 's-12',
    playerId: 'm-5',
    playerName: 'Emma Davis',
    course: 'Pinehurst',
    score: 85,
    date: '2023-09-28',
    simulator: 'Bay 2 - Pinehurst'
  }];

export const generateTimeSlots = (date: string, simulatorId: string) => {
  // Deterministic mock availability based on date and simulator
  const seed =
    date.charCodeAt(date.length - 1) +
    simulatorId.charCodeAt(simulatorId.length - 1);

  return [
    {
      id: 'ts-1',
      startTime: '08:00',
      endTime: '12:00',
      label: '8:00 AM - 12:00 PM',
      isAvailable: seed % 2 === 0
    },
    {
      id: 'ts-2',
      startTime: '12:00',
      endTime: '16:00',
      label: '12:00 PM - 4:00 PM',
      isAvailable: seed % 3 !== 0
    },
    {
      id: 'ts-3',
      startTime: '16:00',
      endTime: '20:00',
      label: '4:00 PM - 8:00 PM',
      isAvailable: seed % 4 !== 0
    },
    {
      id: 'ts-4',
      startTime: '20:00',
      endTime: '24:00',
      label: '8:00 PM - 12:00 AM',
      isAvailable: true
    }];

};