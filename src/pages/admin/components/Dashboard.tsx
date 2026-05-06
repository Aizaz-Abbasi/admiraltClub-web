import { CalendarIcon, UsersIcon, DollarSignIcon, ActivityIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { StatsCard } from '../../../components/StatsCard';
import { apiGet } from '../../../api';
import { getApiErrorMessage } from '../../../api/client';

interface DashboardStats {
  todayBookings: number;
  activeMembers: number;
  revenueMonthToDate: number;
  simulatorsOnline: number;
  simulatorsTotal: number;
}

interface RecentBooking {
  id: number;
  userName: string;
  simulatorName: string;
  startTime: string;
  status: string;
}

interface SimulatorStatus {
  id: number;
  name: string;
  status: 'ACTIVE' | 'MAINTENANCE';
  locationId: number;
}

interface LocationWithSimulators {
  id: number;
  name: string;
  simulators: SimulatorStatus[];
}

interface DashboardResponse {
  success: boolean;
  stats: DashboardStats;
  recentBookings: RecentBooking[];
  locations: LocationWithSimulators[];
}

export function DashboardTab() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => apiGet<DashboardResponse>('admin/dashboard'),
    refetchInterval: 60_000, // auto-refresh every minute
  });

  const stats = data?.stats;
  const recentBookings = data?.recentBookings ?? [];
  const locations = data?.locations ?? [];

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'BOOKED':
        return 'bg-green-900/30 text-green-400 border-green-900/50';
      case 'CANCELLED':
        return 'bg-red-900/30 text-red-400 border-red-900/50';
      default:
        return 'bg-slate-900/30 text-slate-400 border-slate-700';
    }
  };

  if (isError) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-300">
        <p>{getApiErrorMessage(error)}</p>
        <button
          onClick={() => void refetch()}
          className="mt-3 rounded-md bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/30"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Today's Bookings"
          value={isLoading ? '—' : String(stats?.todayBookings ?? 0)}
          icon={CalendarIcon}
        />
        <StatsCard
          title="Active Members"
          value={isLoading ? '—' : String(stats?.activeMembers ?? 0)}
          icon={UsersIcon}
        />
        <StatsCard
          title="Revenue (MTD)"
          value={isLoading ? '—' : `$${(stats?.revenueMonthToDate ?? 0).toLocaleString()}`}
          icon={DollarSignIcon}
        />
        <StatsCard
          title="Simulators Online"
          value={isLoading ? '—' : `${stats?.simulatorsOnline ?? 0}/${stats?.simulatorsTotal ?? 0}`}
          icon={ActivityIcon}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Bookings */}
        <div className="bg-navy-800 rounded-xl border border-navy-700 shadow-lg p-6">
          <h3 className="text-lg font-serif font-bold text-white mb-4">Recent Bookings</h3>

          {isLoading && (
            <div className="text-center text-slate-400 text-sm py-6">Loading...</div>
          )}

          {!isLoading && recentBookings.length === 0 && (
            <div className="text-center text-slate-500 text-sm py-6">No recent bookings.</div>
          )}

          <div className="space-y-4">
            {recentBookings.map((res) => (
              <div
                key={res.id}
                className="flex items-center justify-between p-3 hover:bg-navy-700/50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy-900 border border-navy-600 flex items-center justify-center text-slate-300 font-medium shrink-0">
                    {res.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{res.userName}</p>
                    <p className="text-xs text-slate-400">
                      {res.simulatorName} • {new Date(res.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full border ${statusBadgeClass(res.status)}`}>
                  {res.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-navy-800 rounded-xl border border-navy-700 shadow-lg p-6">
          <h3 className="text-lg font-serif font-bold text-white mb-4">System Status</h3>

          {isLoading && (
            <div className="text-center text-slate-400 text-sm py-6">Loading...</div>
          )}

          {!isLoading && locations.length === 0 && (
            <div className="text-center text-slate-500 text-sm py-6">No locations found.</div>
          )}

          <div className="space-y-4">
            {locations.map((loc) => (
              <div key={loc.id} className="border border-navy-700 bg-navy-900/30 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3">{loc.name}</h4>
                <div className="grid grid-cols-3 gap-2">
                  {loc.simulators.map((sim) => (
                    <div
                      key={sim.id}
                      className={`p-2 rounded text-center text-xs font-medium border ${sim.status === 'ACTIVE'
                        ? 'bg-green-900/20 border-green-900/50 text-green-400'
                        : 'bg-red-900/20 border-red-900/50 text-red-400'
                        }`}
                    >
                      {sim.name.split(' - ')[0]}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}