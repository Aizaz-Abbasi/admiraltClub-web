import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUpIcon,
  TargetIcon,
  AwardIcon,
  CalendarIcon,
  MapPinIcon,
  PlusIcon,
  XIcon,
  Loader2Icon,
} from 'lucide-react';
import { StatsCard } from '../components/StatsCard';
import { apiGet } from '../api';
import { getApiErrorMessage } from '../api/client';
import { createScore } from '../services/scorecard';
import { fetchCourses } from '../services/course';

interface Scorecard {
  id: number;
  score: number;
  datePlayed: string;
  createdAt: string;
  course: { id: number; name: string };
}

interface MyScoresResponse {
  success: boolean;
  total: number;
  stats: {
    bestScore: number | null;
    avgScore: number | null;
    totalRounds: number;
  };
  scorecards: Scorecard[];
}

export function StatsPage({ canAddScore = false }: { canAddScore?: boolean }) {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [courseId, setCourseId] = useState<number | ''>('');
  const [score, setScore] = useState('');
  const [datePlayed, setDatePlayed] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['my-scores'],
    queryFn: () => apiGet<MyScoresResponse>('scorecards/my?page=1&limit=100'),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => fetchCourses(true),
    enabled: showForm,
  });

  const addMutation = useMutation({
    mutationFn: () =>
      createScore({
        courseId: Number(courseId),
        score: Number(score),
        datePlayed,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-scores'] });
      setShowForm(false);
      setCourseId('');
      setScore('');
      setDatePlayed(new Date().toISOString().slice(0, 10));
      setFormError(null);
    },
    onError: (err) => setFormError(getApiErrorMessage(err)),
  });

  const handleSubmit = () => {
    if (!courseId) return setFormError('Please select a course.');
    const s = Number(score);
    if (!score || !Number.isInteger(s) || s <= 0) return setFormError('Enter a valid positive score.');
    addMutation.mutate();
  };

  const scorecards = data?.scorecards ?? [];
  const stats = data?.stats;

  const last6 = [...scorecards].slice(0, 6).reverse();
  const bestScore = stats?.bestScore ?? 0;
  const minChartScore = last6.length ? Math.min(...last6.map((s) => s.score)) - 5 : 0;
  const maxChartScore = last6.length ? Math.max(...last6.map((s) => s.score)) + 5 : 1;
  const range = maxChartScore - minChartScore || 1;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading your stats...</p>
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

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
              My Stats Dashboard
            </h1>
            <p className="text-slate-400">Track your performance and recent rounds.</p>
          </div>
          {canAddScore && (
            <button
              onClick={() => { setShowForm((v) => !v); setFormError(null); }}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500 text-navy-900 font-semibold text-sm hover:bg-gold-400 transition-colors shadow-md"
            >
              {showForm ? <XIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
              {showForm ? 'Cancel' : 'Add Score'}
            </button>
          )}
        </div>

        {/* Add Score Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-navy-800 border border-navy-700 rounded-2xl p-6 shadow-lg">
                <h3 className="text-base font-serif font-bold text-white mb-5">Record a Round</h3>

                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  {/* Course */}
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">Course</label>
                    <select
                      value={courseId}
                      onChange={(e) => { setCourseId(Number(e.target.value)); setFormError(null); }}
                      className="w-full bg-navy-900 border border-navy-600 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/60 transition-colors"
                    >
                      <option value="">— select course —</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Score */}
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">Score</label>
                    <input
                      type="number"
                      min={1}
                      value={score}
                      onChange={(e) => { setScore(e.target.value); setFormError(null); }}
                      placeholder="e.g. 72"
                      className="w-full bg-navy-900 border border-navy-600 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/60 transition-colors"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">Date Played</label>
                    <input
                      type="date"
                      value={datePlayed}
                      onChange={(e) => { setDatePlayed(e.target.value); setFormError(null); }}
                      className="w-full bg-navy-900 border border-navy-600 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/60 transition-colors"
                    />
                  </div>
                </div>

                {formError && (
                  <p className="text-sm text-red-400 mb-4">{formError}</p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={addMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 text-navy-900 font-semibold text-sm hover:bg-gold-400 transition-colors disabled:opacity-50"
                >
                  {addMutation.isPending
                    ? <><Loader2Icon className="w-4 h-4 animate-spin" /> Saving…</>
                    : <><PlusIcon className="w-4 h-4" /> Save Score</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <StatsCard title="Total Rounds" value={String(stats?.totalRounds ?? 0)} icon={TrendingUpIcon} />
          <StatsCard title="Average Score" value={stats?.avgScore != null ? String(stats.avgScore) : '—'} icon={TargetIcon} />
          <StatsCard title="Best Score" value={stats?.bestScore != null ? String(stats.bestScore) : '—'} icon={AwardIcon} />
        </div>

        {scorecards.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-16">
            No rounds recorded yet. Click <span className="text-gold-400 font-medium">Add Score</span> above to record your first round.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Recent Rounds Table */}
            <div className="lg:col-span-2 bg-navy-800 rounded-2xl shadow-lg border border-navy-700 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-navy-700 bg-navy-900/50">
                <h2 className="text-xl font-serif font-bold text-white">Recent Rounds</h2>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm">
                  <thead className="bg-navy-800 text-slate-400 border-b border-navy-700">
                    <tr>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium">Course</th>
                      <th className="px-6 py-4 font-medium text-center">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-700/50">
                    {scorecards.map((s, idx) => (
                      <motion.tr
                        key={s.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-navy-700/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-slate-300">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-slate-500 shrink-0" />
                            {new Date(s.datePlayed).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-white">
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="w-4 h-4 text-slate-500 shrink-0" />
                            {s.course.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full border font-bold shadow-inner text-sm
                            ${s.score === bestScore
                              ? 'bg-gold-500/20 border-gold-500/50 text-gold-400'
                              : 'bg-navy-900 border-navy-600 text-white'
                            }`}
                          >
                            {s.score}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Score Trend */}
            <div className="bg-navy-800 rounded-2xl shadow-lg border border-navy-700 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-navy-700 bg-navy-900/50">
                <h2 className="text-xl font-serif font-bold text-white">Score Trend</h2>
                <p className="text-xs text-slate-400 mt-1">Last 6 rounds</p>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center gap-4">
                {last6.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center">Not enough rounds yet.</p>
                ) : (
                  last6.map((s, idx) => {
                    const widthPercent = ((s.score - minChartScore) / range) * 100;
                    const isBest = s.score === bestScore;
                    return (
                      <div key={s.id} className="flex items-center gap-3">
                        <div className="w-12 text-xs text-slate-400 text-right shrink-0">
                          {new Date(s.datePlayed).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric',
                          })}
                        </div>
                        <div className="flex-1 h-8 bg-navy-900 rounded-md overflow-hidden relative flex items-center shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(10, widthPercent)}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                            className={`h-full rounded-md ${isBest
                              ? 'bg-gold-500 shadow-[0_0_10px_rgba(201,168,76,0.5)]'
                              : 'bg-navy-600'
                            }`}
                          />
                          <span className={`absolute left-3 text-xs font-bold ${isBest ? 'text-navy-900' : 'text-white'}`}>
                            {s.score}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div className="mt-4 pt-4 border-t border-navy-700 flex justify-between text-xs text-slate-500">
                  <span>Better</span>
                  <span>Worse</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
