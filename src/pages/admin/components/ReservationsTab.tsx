import { SearchIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { fetchAllBookings } from '../../../services/bookig';

export function ReservationsTab() {
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('ALL');

  const { data: reservations = [], isFetching } = useQuery({
    queryKey: ['allBookings', status, search],
    queryFn: () => fetchAllBookings(status, search),
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="bg-navy-800 rounded-xl border border-navy-700 shadow-lg overflow-hidden">
      <div className="p-6 border-b border-navy-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-navy-900/50">
        <h3 className="text-lg font-serif font-bold text-white">All Reservations</h3>
        <div className="flex gap-2">
          <div className="relative">
            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by user name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-navy-900 border border-navy-600 text-white placeholder-slate-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 w-full sm:w-64"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 bg-navy-900 border border-navy-600 text-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="ALL">All</option>
            <option value="BOOKED">Booked</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-800 text-slate-400 border-b border-navy-700">
            <tr>
              <th className="px-6 py-3 font-medium">User</th>
              <th className="px-6 py-3 font-medium">Simulator</th>
              <th className="px-6 py-3 font-medium">Date & Time</th>
              <th className="px-6 py-3 font-medium">Door Code</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-700/50">
            {isFetching ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : reservations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  No reservations found.
                </td>
              </tr>
            ) : (
              reservations.map((res) => (
                <tr key={res.id} className="hover:bg-navy-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">{res.user?.name}</p>
                    <p className="text-xs text-slate-500">{res.user?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {res.simulator.name}
                    <div className="text-xs text-slate-500">{res.simulator.location}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {new Date(res.startTime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      timeZone: 'UTC',
                    })}
                    <div className="text-xs text-slate-500">
                      {formatTime(res.startTime)} - {formatTime(res.endTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-gold-500">{res.doorCode}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${res.status === 'BOOKED'
                      ? 'bg-blue-900/30 text-blue-400 border-blue-900/50'
                      : res.status === 'COMPLETED'
                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                        : 'bg-red-900/30 text-red-400 border-red-900/50'
                      }`}>
                      {res.status.charAt(0).toUpperCase() + res.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// import { mockReservations } from '../../../data/mockData';
// import { SearchIcon, FilterIcon } from 'lucide-react';

// export function ReservationsTab() {
//   return (
//     <div className="bg-navy-800 rounded-xl border border-navy-700 shadow-lg overflow-hidden">
//       <div className="p-6 border-b border-navy-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-navy-900/50">
//         <h3 className="text-lg font-serif font-bold text-white">All Reservations</h3>
//         <div className="flex gap-2">
//           <div className="relative">
//             <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
//             <input
//               type="text"
//               placeholder="Search user or code..."
//               className="pl-9 pr-4 py-2 bg-navy-900 border border-navy-600 text-white placeholder-slate-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 w-full sm:w-64"
//             />
//           </div>
//           <button className="p-2 border border-navy-600 rounded-lg text-slate-400 hover:bg-navy-700 hover:text-white transition-colors">
//             <FilterIcon className="w-4 h-4" />
//           </button>
//         </div>
//       </div>
//       <div className="overflow-x-auto">
//         <table className="w-full text-left text-sm">
//           <thead className="bg-navy-800 text-slate-400 border-b border-navy-700">
//             <tr>
//               <th className="px-6 py-3 font-medium">User</th>
//               <th className="px-6 py-3 font-medium">Simulator</th>
//               <th className="px-6 py-3 font-medium">Date & Time</th>
//               <th className="px-6 py-3 font-medium">Door Code</th>
//               <th className="px-6 py-3 font-medium">Status</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-navy-700/50">
//             {mockReservations.map((res) => (
//               <tr key={res.id} className="hover:bg-navy-700/30 transition-colors">
//                 <td className="px-6 py-4 font-medium text-white">{res.userName}</td>
//                 <td className="px-6 py-4 text-slate-300">
//                   {res.simulatorName}
//                   <div className="text-xs text-slate-500">{res.locationName}</div>
//                 </td>
//                 <td className="px-6 py-4 text-slate-300">
//                   {res.date}
//                   <div className="text-xs text-slate-500">{res.startTime} - {res.endTime}</div>
//                 </td>
//                 <td className="px-6 py-4 font-mono text-gold-500">{res.doorCode}</td>
//                 <td className="px-6 py-4">
//                   <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
//                     res.status === 'booked'
//                       ? 'bg-blue-900/30 text-blue-400 border-blue-900/50'
//                       : res.status === 'completed'
//                       ? 'bg-slate-800 text-slate-300 border-slate-700'
//                       : 'bg-red-900/30 text-red-400 border-red-900/50'
//                   }`}>
//                     {res.status.charAt(0).toUpperCase() + res.status.slice(1)}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }