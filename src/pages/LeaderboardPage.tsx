import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrophyIcon, MedalIcon } from 'lucide-react';
import { apiGet } from '../api';
import { getApiErrorMessage } from '../api/client';

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

const getPodiumStyles = (rank: number) => {
  switch (rank) {
    case 1:
      return {
        height: 'h-64',
        bg: 'bg-gradient-to-b from-navy-800 to-navy-900',
        border: 'border-gold-500',
        text: 'text-gold-500',
        medal: 'text-gold-500',
        shadow: 'shadow-[0_-10px_30px_rgba(201,168,76,0.15)]',
        scale: 'scale-105 z-10',
      };
    case 2:
      return {
        height: 'h-56',
        bg: 'bg-gradient-to-b from-navy-800/80 to-navy-900',
        border: 'border-slate-400',
        text: 'text-slate-300',
        medal: 'text-slate-400',
        shadow: 'shadow-lg shadow-black/20',
        scale: 'z-0',
      };
    case 3:
      return {
        height: 'h-48',
        bg: 'bg-gradient-to-b from-navy-800/60 to-navy-900',
        border: 'border-orange-700/50',
        text: 'text-orange-400',
        medal: 'text-orange-500',
        shadow: 'shadow-md shadow-black/20',
        scale: 'z-0',
      };
    default:
      return { height: '', bg: '', border: '', text: '', medal: '', shadow: '', scale: '' };
  }
};

const rankLabel = (rank: number) => {
  if (rank === 1) return '1st Place';
  if (rank === 2) return '2nd Place';
  return '3rd Place';
};

export function LeaderboardPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => apiGet<LeaderboardResponse>('leaderboard?limit=10'),
  });

  const leaderboard = data?.leaderboard ?? [];
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  // Podium display order: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading leaderboard...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-sm">{getApiErrorMessage(error)}</p>
        <button
          onClick={() => void refetch()}
          className="px-4 py-2 rounded-lg bg-navy-800 text-white text-sm hover:bg-navy-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <p className="text-slate-500 text-sm">No scores recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy-800 border border-navy-700 text-gold-500 mb-4 shadow-[0_0_15px_rgba(201,168,76,0.2)]">
            <TrophyIcon className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            Club Leaderboard
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            See how you stack up against fellow members. Rankings are based on best score.
          </p>
        </div>

        {/* Podium — only if we have at least 1 top player */}
        {top3.length > 0 && (
          <div className="flex flex-col md:flex-row justify-center items-end gap-4 md:gap-6 mb-16 px-4">
            {podiumOrder.map((player, index) => {
              if (!player) return null;
              const styles = getPodiumStyles(player.rank);
              return (
                <motion.div
                  key={player.userId}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  className={`w-full md:w-64 rounded-t-2xl border-t-4 border-x border-b border-b-navy-900 ${styles.border} ${styles.bg} ${styles.shadow} ${styles.scale} flex flex-col items-center p-6 relative`}
                >
                  <div className="absolute -top-6 bg-navy-900 rounded-full p-1 shadow-lg border border-navy-700">
                    <MedalIcon className={`w-10 h-10 ${styles.medal}`} />
                  </div>
                  <div className="mt-6 text-center">
                    <span className={`text-sm font-bold uppercase tracking-wider ${styles.text}`}>
                      {rankLabel(player.rank)}
                    </span>
                    <h3 className="text-xl font-serif font-bold text-white mt-2 mb-1 truncate w-full px-2">
                      {player.playerName}
                    </h3>
                    <div className={`text-3xl font-bold my-3 ${player.rank === 1 ? 'text-gold-500 drop-shadow-[0_0_8px_rgba(201,168,76,0.5)]' : 'text-white'}`}>
                      {player.bestScore}
                    </div>
                    <div className="space-y-1 text-sm text-slate-400">
                      <p className="truncate w-full px-2">{player.bestScoreCourse}</p>
                      <p className="text-xs text-slate-500">{player.totalRounds} rounds</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Rest of table — ranks 4+ */}
        {rest.length > 0 && (
          <div className="bg-navy-800 rounded-2xl shadow-xl border border-navy-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-navy-900/80 text-slate-300 border-b border-navy-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-20 text-center">Rank</th>
                    <th className="px-6 py-4 font-semibold">Player</th>
                    <th className="px-6 py-4 font-semibold text-center">Best Score</th>
                    <th className="px-6 py-4 font-semibold text-center">Recent Score</th>
                    <th className="px-6 py-4 font-semibold">Course</th>
                    <th className="px-6 py-4 font-semibold text-center">Rounds</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-700/50">
                  {rest.map((player, index) => (
                    <motion.tr
                      key={player.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="hover:bg-navy-700/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-300 text-center">
                        {player.rank}
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-navy-900 border border-navy-600 text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {player.playerName.charAt(0)}
                          </div>
                          {player.playerName}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-white text-center">
                        {player.bestScore}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-center">
                        {player.recentScore}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {player.bestScoreCourse}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-center">
                        {player.totalRounds}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}