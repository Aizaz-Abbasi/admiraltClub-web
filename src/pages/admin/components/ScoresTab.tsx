import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, EditIcon, XIcon, CheckIcon, Trash2Icon } from 'lucide-react';
import { getApiErrorMessage } from '../../../api/client';
import { fetchCourses, Course } from '../../../services/course';
import {
  fetchAllScores, adminCreateScore,
  updateScore,
  deleteScore,
  Scorecard,
} from '../../../services/scorecard';
import { fetchMembers } from '../../../services/member';


export function ScoresTab() {
  const [showAddScore, setShowAddScore] = useState(false);
  const [editingScoreId, setEditingScoreId] = useState<number | null>(null);
  const [scoreForm, setScoreForm] = useState<{
    userId?: number;
    courseId?: number;
    score?: number;
    datePlayed?: string;
  }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const {
    data: scores = [],
    isLoading: scoresLoading,
    isError: scoresError,
    error: scoresFetchError,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'scores'],
    queryFn: () => fetchAllScores(''),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: () => fetchCourses(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => fetchMembers(),
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  const resetForm = () => {
    setScoreForm({});
    setSaveError(null);
    setShowAddScore(false);
    setEditingScoreId(null);
  };

  // ── Save (create or update) ────────────────────────────────────────────────
  const handleSaveScore = async () => {
    setSaveError(null);

    if (!scoreForm.userId) { setSaveError('Please select a user.'); return; }
    if (!scoreForm.courseId) { setSaveError('Please select a course.'); return; }
    if (!scoreForm.score || scoreForm.score < 1) { setSaveError('Score must be a positive number.'); return; }
    if (isSaving) return;

    try {
      setIsSaving(true);
      if (editingScoreId) {
        await updateScore(editingScoreId, {
          score: scoreForm.score,
          datePlayed: scoreForm.datePlayed,
        });
        setEditingScoreId(null);
      } else {
        await adminCreateScore({
          userId: scoreForm.userId,
          courseId: scoreForm.courseId,
          score: scoreForm.score,
          datePlayed: scoreForm.datePlayed,
        });
        setShowAddScore(false);
      }
      setScoreForm({});
      await refetch();
    } catch (e) {
      setSaveError(getApiErrorMessage(e));
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteScore = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this score?')) return;
    try {
      setDeletingId(id);
      await deleteScore(id);
      await refetch();
    } catch (e) {
      setSaveError(getApiErrorMessage(e));
    } finally {
      setDeletingId(null);
    }
  };

  const selectClass = "px-3 py-2 bg-navy-900 border border-navy-600 rounded-lg text-sm text-white focus:ring-gold-500 focus:border-gold-500 outline-none";
  const inputClass = selectClass;

  return (
    <div className="bg-navy-800 rounded-xl border border-navy-700 shadow-lg overflow-hidden">

      {/* Header */}
      <div className="p-6 border-b border-navy-700 flex justify-between items-center bg-navy-900/50">
        <h3 className="text-lg font-serif font-bold text-white">Score Management</h3>
        <button
          onClick={() => { resetForm(); setShowAddScore(true); }}
          className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 bg-gold-500 text-navy-900 hover:bg-gold-400 transition-colors shadow-[0_0_10px_rgba(201,168,76,0.2)]"
        >
          <PlusIcon className="w-4 h-4" />
          Add Score
        </button>
      </div>

      {/* Add Score Form */}
      <AnimatePresence>
        {showAddScore && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-navy-900/80 border-b border-navy-700 p-6"
          >
            <h4 className="font-medium text-white mb-4">Add New Score</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

              {/* User select */}
              <select
                value={scoreForm.userId ?? ''}
                onChange={(e) => setScoreForm({ ...scoreForm, userId: Number(e.target.value) })}
                className={selectClass}
              >
                <option value="">Select User</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>

              {/* Course select */}
              <select
                value={scoreForm.courseId ?? ''}
                onChange={(e) => setScoreForm({ ...scoreForm, courseId: Number(e.target.value) })}
                className={selectClass}
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {/* Score */}
              <input
                type="number"
                placeholder="Score"
                value={scoreForm.score ?? ''}
                onChange={(e) => setScoreForm({ ...scoreForm, score: Number(e.target.value) })}
                className={inputClass}
              />

              {/* Date */}
              <input
                type="date"
                value={scoreForm.datePlayed?.split('T')[0] ?? ''}
                onChange={(e) => setScoreForm({ ...scoreForm, datePlayed: e.target.value })}
                className={inputClass}
              />
            </div>

            {saveError && <p className="text-sm text-red-400 mb-3">{saveError}</p>}

            <div className="flex justify-end gap-2">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:bg-navy-700 hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSaveScore()}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-bold bg-gold-500 text-navy-900 hover:bg-gold-400 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Score'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global error */}
      {saveError && !showAddScore && (
        <div className="mx-6 mt-4 rounded-lg border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-300">
          {saveError}
        </div>
      )}

      {/* Loading */}
      {scoresLoading && (
        <div className="px-6 py-10 text-center text-slate-400">Loading scores...</div>
      )}

      {/* Fetch error */}
      {scoresError && (
        <div className="mx-6 my-4 rounded-lg border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-300">
          <p>{getApiErrorMessage(scoresFetchError)}</p>
          <button
            onClick={() => void refetch()}
            className="mt-3 rounded-md bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/30"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!scoresLoading && !scoresError && scores.length === 0 && (
        <div className="px-6 py-10 text-center text-slate-500 text-sm">No scores found.</div>
      )}

      {/* Table */}
      {scores.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-800 text-slate-400 border-b border-navy-700">
              <tr>
                <th className="px-6 py-3 font-medium">Player</th>
                <th className="px-6 py-3 font-medium">Course</th>
                <th className="px-6 py-3 font-medium text-center">Score</th>
                <th className="px-6 py-3 font-medium">Date Played</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/50">
              {scores.map((score) => (
                <tr key={score.id} className="hover:bg-navy-700/30 transition-colors">
                  {editingScoreId === score.id ? (
                    <td colSpan={5} className="px-6 py-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Score input */}
                        <input
                          type="number"
                          value={scoreForm.score ?? ''}
                          onChange={(e) => setScoreForm({ ...scoreForm, score: Number(e.target.value) })}
                          placeholder="Score"
                          className="px-2 py-1 bg-navy-900 border border-navy-600 text-white rounded text-sm w-24"
                        />
                        {/* Date input */}
                        <input
                          type="date"
                          value={scoreForm.datePlayed?.split('T')[0] ?? ''}
                          onChange={(e) => setScoreForm({ ...scoreForm, datePlayed: e.target.value })}
                          className="px-2 py-1 bg-navy-900 border border-navy-600 text-white rounded text-sm"
                        />
                        <div className="flex gap-2 ml-auto">
                          <button
                            onClick={() => { setEditingScoreId(null); setScoreForm({}); setSaveError(null); }}
                            className="p-1 text-slate-400 hover:text-red-400"
                          >
                            <XIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => void handleSaveScore()}
                            disabled={isSaving}
                            className="p-1 text-green-500 hover:text-green-400 disabled:opacity-50"
                          >
                            <CheckIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      {saveError && editingScoreId === score.id && (
                        <p className="text-xs text-red-400 mt-2">{saveError}</p>
                      )}
                    </td>
                  ) : (
                    <>
                      <td className="px-6 py-4 font-medium text-white">
                        {score.user?.name ?? '—'}
                        <span className="block text-xs text-slate-500">{score.user?.email}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{score.course?.name ?? '—'}</td>
                      <td className="px-6 py-4 text-center font-bold text-white">{score.score}</td>
                      <td className="px-6 py-4 text-slate-400">
                        {score.datePlayed ? new Date(score.datePlayed).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingScoreId(score.id);
                            setScoreForm({
                              score: score.score,
                              datePlayed: score.datePlayed,
                            });
                            setShowAddScore(false);
                            setSaveError(null);
                          }}
                          className="p-1 text-slate-400 hover:text-gold-500 rounded transition-colors"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => void handleDeleteScore(score.id)}
                          disabled={deletingId === score.id}
                          className="p-1 text-slate-400 hover:text-red-400 rounded transition-colors disabled:opacity-50"
                        >
                          <Trash2Icon className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}