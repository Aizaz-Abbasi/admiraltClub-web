import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, EditIcon, XIcon, CheckIcon, Trash2Icon } from 'lucide-react';
import { getApiErrorMessage } from '../../../api/client';
import { fetchCourses, createCourse, updateCourse, deleteCourse, Course } from '../../../services/course';

export function CoursesTab() {
    const [showAddCourse, setShowAddCourse] = useState(false);
    const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
    const [courseForm, setCourseForm] = useState<Partial<Course>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const {
        data: fetchedCourses,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ['admin', 'courses'],
        queryFn: () => fetchCourses(),
    });

    const courses = fetchedCourses ?? [];

    const handleSaveCourse = async () => {
        setSaveError(null);
        if (!courseForm.name?.trim()) {
            setSaveError('Name is required.');
            return;
        }
        if (isSaving) return;

        try {
            setIsSaving(true);
            if (editingCourseId) {
                await updateCourse(editingCourseId, {
                    name: courseForm.name,
                    isActive: courseForm.isActive,
                });
                await refetch();
                setEditingCourseId(null);
            } else {
                await createCourse({ name: courseForm.name });
                await refetch();
                setShowAddCourse(false);
            }
            setCourseForm({});
        } catch (e) {
            setSaveError(getApiErrorMessage(e));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteCourse = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;
        try {
            setDeletingId(id);
            await deleteCourse(id);
            await refetch();
        } catch (e) {
            setSaveError(getApiErrorMessage(e));
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="bg-navy-800 rounded-xl border border-navy-700 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-navy-700 flex justify-between items-center bg-navy-900/50">
                <div>
                    <h3 className="text-lg font-serif font-bold text-white">Course Management</h3>
                </div>
                <button
                    onClick={() => { setShowAddCourse(true); setEditingCourseId(null); setCourseForm({}); setSaveError(null); }}
                    className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors bg-gold-500 text-navy-900 hover:bg-gold-400 shadow-[0_0_10px_rgba(201,168,76,0.2)]"
                >
                    <PlusIcon className="w-4 h-4" />
                    Add Course
                </button>
            </div>

            {/* Add Course Form */}
            <AnimatePresence>
                {showAddCourse && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-navy-900/80 border-b border-navy-700 p-6"
                    >
                        <h4 className="font-medium text-white mb-4">Add New Course</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Course Name"
                                value={courseForm.name || ''}
                                onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                                className="px-3 py-2 bg-navy-900 border border-navy-600 rounded-lg text-sm text-white focus:ring-gold-500 focus:border-gold-500 outline-none"
                            />
                        </div>
                        {saveError && (
                            <p className="text-sm text-red-400 mb-3">{saveError}</p>
                        )}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => { setShowAddCourse(false); setCourseForm({}); setSaveError(null); }}
                                className="px-4 py-2 text-sm font-medium text-slate-400 hover:bg-navy-700 hover:text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => void handleSaveCourse()}
                                disabled={isSaving}
                                className="px-4 py-2 text-sm font-bold bg-gold-500 text-navy-900 hover:bg-gold-400 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save Course'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global save error (for edit/delete) */}
            {saveError && !showAddCourse && (
                <div className="mx-6 mt-4 rounded-lg border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-300">
                    {saveError}
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <div className="px-6 py-10 text-center text-slate-400">Loading courses...</div>
            )}

            {/* Fetch Error */}
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
            {!isLoading && !isError && courses.length === 0 && (
                <div className="px-6 py-10 text-center text-slate-500 text-sm">No courses found.</div>
            )}

            {/* Table */}
            {courses.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-navy-800 text-slate-400 border-b border-navy-700">
                            <tr>
                                <th className="px-6 py-3 font-medium">Name</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Created At</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-700/50">
                            {courses.map((course) => (
                                <tr key={course.id} className="hover:bg-navy-700/30 transition-colors">
                                    {editingCourseId === course.id ? (
                                        <td colSpan={4} className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="text"
                                                    value={courseForm.name || ''}
                                                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                                                    className="px-2 py-1 bg-navy-900 border border-navy-600 text-white rounded text-sm flex-1"
                                                />
                                                {/* Active toggle */}
                                                <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer select-none">
                                                    <div
                                                        onClick={() => setCourseForm({ ...courseForm, isActive: !courseForm.isActive })}
                                                        className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${courseForm.isActive ? 'bg-gold-500' : 'bg-navy-600'}`}
                                                    >
                                                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${courseForm.isActive ? 'left-5' : 'left-0.5'}`} />
                                                    </div>
                                                    {courseForm.isActive ? 'Active' : 'Inactive'}
                                                </label>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => { setEditingCourseId(null); setCourseForm({}); setSaveError(null); }}
                                                        className="p-1 text-slate-400 hover:text-red-400"
                                                    >
                                                        <XIcon className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => void handleSaveCourse()}
                                                        disabled={isSaving}
                                                        className="p-1 text-green-500 hover:text-green-400 disabled:opacity-50"
                                                    >
                                                        <CheckIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                            {saveError && editingCourseId === course.id && (
                                                <p className="text-xs text-red-400 mt-2">{saveError}</p>
                                            )}
                                        </td>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4 font-medium text-white">{course.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${course.isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                                    {course.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">
                                                {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                <button
                                                    onClick={() => { setEditingCourseId(course.id); setCourseForm(course); setShowAddCourse(false); setSaveError(null); }}
                                                    className="p-1 text-slate-400 hover:text-gold-500 rounded transition-colors"
                                                >
                                                    <EditIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => void handleDeleteCourse(course.id)}
                                                    disabled={deletingId === course.id}
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