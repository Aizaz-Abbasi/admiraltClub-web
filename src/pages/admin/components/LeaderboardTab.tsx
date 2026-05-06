import { useQuery } from '@tanstack/react-query';
import { getApiErrorMessage } from '../../../api/client';
import { apiGet } from '../../../api';

interface LeaderboardEntry {
  rank: number;
  userId: number;
  playerName: string;
  bestScore: number;
  bestScoreCourse: string;
  recentScore: number;
  recentScoreCourse: string;
  totalRounds: number;
}

interface LeaderboardResponse {
  success: boolean;
  total: number;
  leaderboard: LeaderboardEntry[];
}

const rankStyles: Record<number, string> = {
  1: 'text-yellow-400 font-extrabold',
  2: 'text-slate-300 font-bold',
  3: 'text-amber-600 font-bold',
};

export function LeaderboardTab() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'leaderboard'],
    queryFn: () => apiGet<LeaderboardResponse>('leaderboard?limit=10'),
  });

  const leaderboard = data?.leaderboard ?? [];

  return (
    <div className="bg-navy-800 rounded-xl border border-navy-700 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-navy-700 flex justify-between items-center bg-navy-900/50">
        <h3 className="text-lg font-serif font-bold text-white">Leaderboard</h3>
        <button
          onClick={() => void refetch()}
          className="px-4 py-2 bg-gold-500 text-navy-900 rounded-lg text-sm font-bold hover:bg-gold-400 transition-colors shadow-[0_0_10px_rgba(201,168,76,0.2)]"
        >
          Recalculate Rankings
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="px-6 py-10 text-center text-slate-400">Loading leaderboard...</div>
      )}

      {/* Error */}
      {isError && (
        <div className="mx-6 my-4 rounded-lg border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-300">
          <p>{getApiErrorMessage(error)}</p>
          <button
            onClick={() => void refetch()}
            className="mt-3 rounded-md bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/30"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && leaderboard.length === 0 && (
        <div className="px-6 py-10 text-center text-slate-500 text-sm">
          No scores recorded yet.
        </div>
      )}

      {/* Table */}
      {leaderboard.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-800 text-slate-400 border-b border-navy-700">
              <tr>
                <th className="px-6 py-3 font-medium w-16">Rank</th>
                <th className="px-6 py-3 font-medium">Player</th>
                <th className="px-6 py-3 font-medium text-center">Best Score</th>
                <th className="px-6 py-3 font-medium text-center">Recent Score</th>
                <th className="px-6 py-3 font-medium">Course</th>
                <th className="px-6 py-3 font-medium text-center">Rounds</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/50">
              {leaderboard.map((player) => (
                <tr key={player.userId} className="hover:bg-navy-700/30 transition-colors">
                  <td className={`px-6 py-4 text-lg ${rankStyles[player.rank] ?? 'text-slate-400 font-medium'}`}>
                    #{player.rank}
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    {player.playerName}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-gold-400 text-base">
                    {player.bestScore}
                  </td>
                  <td className="px-6 py-4 text-center text-white">
                    {player.recentScore}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {player.bestScoreCourse}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-400">
                    {player.totalRounds}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}




// import { mockLeaderboard } from '../../../data/mockData';
// import { EditIcon } from 'lucide-react';

// export function LeaderboardTab() {
//   return (
//     <div className="bg-navy-800 rounded-xl border border-navy-700 shadow-lg overflow-hidden">
//       <div className="p-6 border-b border-navy-700 flex justify-between items-center bg-navy-900/50">
//         <h3 className="text-lg font-serif font-bold text-white">Leaderboard Management</h3>
//         <button className="px-4 py-2 bg-gold-500 text-navy-900 rounded-lg text-sm font-bold hover:bg-gold-400 transition-colors shadow-[0_0_10px_rgba(201,168,76,0.2)]">
//           Recalculate Rankings
//         </button>
//       </div>
//       <div className="overflow-x-auto">
//         <table className="w-full text-left text-sm">
//           <thead className="bg-navy-800 text-slate-400 border-b border-navy-700">
//             <tr>
//               <th className="px-6 py-3 font-medium w-16">Rank</th>
//               <th className="px-6 py-3 font-medium">Player Name</th>
//               <th className="px-6 py-3 font-medium">Handicap</th>
//               <th className="px-6 py-3 font-medium">Recent Score</th>
//               <th className="px-6 py-3 font-medium">Course</th>
//               <th className="px-6 py-3 font-medium text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-navy-700/50">
//             {mockLeaderboard.map((player) => (
//               <tr key={player.id} className="hover:bg-navy-700/30 transition-colors">
//                 <td className="px-6 py-4 font-bold text-slate-300">#{player.rank}</td>
//                 <td className="px-6 py-4 font-medium text-white">{player.name}</td>
//                 <td className="px-6 py-4 text-slate-400">
//                   {player.handicap > 0 ? `+${player.handicap}` : player.handicap}
//                 </td>
//                 <td className="px-6 py-4 font-medium text-white">{player.recentScore}</td>
//                 <td className="px-6 py-4 text-slate-400">{player.course}</td>
//                 <td className="px-6 py-4 text-right">
//                   <button className="p-1.5 text-slate-400 hover:text-gold-500 hover:bg-navy-700 rounded transition-colors">
//                     <EditIcon className="w-4 h-4" />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }