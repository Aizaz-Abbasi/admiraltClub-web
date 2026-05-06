import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, EditIcon, XIcon, CheckIcon } from 'lucide-react';
import { getApiErrorMessage } from '../../../api/client';
import { createLocation, fetchLocations, updateLocation } from '../../../services/location';
import { Location } from '../../../api';


export function LocationsTab() {
    const [showAddLocation, setShowAddLocation] = useState(false);
    const [editingLocationId, setEditingLocationId] = useState<number | null>(null);
    const [locationForm, setLocationForm] = useState<Partial<Location>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const {
        data: fetchedLocations,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ['admin', 'locations'],
        queryFn: fetchLocations,
    });

    // Merge: API data + any locally added ones
    const locations = [
        ...(fetchedLocations ?? []),
    ];
    console.log("locations", locations);

    const handleSaveLocation = async () => {
        setSaveError(null);
        if (!locationForm.name?.trim() || !locationForm.address?.trim()) {
            setSaveError("Name and address are required.");
            return;
        }
        console.log("locationForm", locationForm);

        if (isSaving) return;

        try {
            setIsSaving(true);
            console.log("editingLocationId", editingLocationId);

            if (editingLocationId) {

                console.log("isLocalOnly false");
                await updateLocation(editingLocationId, {
                    name: locationForm.name,
                    address: locationForm.address,
                });
                await refetch();


                setEditingLocationId(null);
            } else {
                await createLocation({
                    name: locationForm.name || '',
                    address: locationForm.address || '',
                });
                await refetch();
                setShowAddLocation(false);
            }

            setLocationForm({});
        } catch (e) {
            setSaveError(getApiErrorMessage(e));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-navy-800 rounded-xl border border-navy-700 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-navy-700 flex justify-between items-center bg-navy-900/50">
                <div>
                    <h3 className="text-lg font-serif font-bold text-white">Location Management</h3>
                </div>
                {
                    locations.length < 1 &&
                    <button
                        onClick={() => { setShowAddLocation(true); setEditingLocationId(null); setLocationForm({}); }}
                        className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors bg-gold-500 text-navy-900 hover:bg-gold-400 shadow-[0_0_10px_rgba(201,168,76,0.2)]"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add Location
                    </button>
                }

            </div>

            <AnimatePresence>
                {showAddLocation && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-navy-900/80 border-b border-navy-700 p-6"
                    >
                        <h4 className="font-medium text-white mb-4">Add New Location</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Location Name"
                                value={locationForm.name || ''}
                                onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                                className="px-3 py-2 bg-navy-900 border border-navy-600 rounded-lg text-sm text-white focus:ring-gold-500 focus:border-gold-500 outline-none"
                            />
                            <input
                                type="text"
                                placeholder="Address"
                                value={locationForm.address || ''}
                                onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
                                className="px-3 py-2 bg-navy-900 border border-navy-600 rounded-lg text-sm text-white focus:ring-gold-500 focus:border-gold-500 outline-none"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowAddLocation(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-400 hover:bg-navy-700 hover:text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => void handleSaveLocation()}
                                disabled={isSaving}
                                className="px-4 py-2 text-sm font-bold bg-gold-500 text-navy-900 hover:bg-gold-400 rounded-lg transition-colors"
                            >
                                {isSaving ? 'Saving...' : 'Save Location'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {saveError && (
                <div className="mx-6 mt-4 rounded-lg border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-300">
                    {saveError}
                </div>
            )}

            {isLoading && (
                <div className="px-6 py-10 text-center text-slate-400">Loading locations...</div>
            )}

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

            {!isLoading && !isError && locations.length === 0 && (
                <div className="px-6 py-10 text-center text-slate-500 text-sm">No locations found.</div>
            )}

            {locations.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-navy-800 text-slate-400 border-b border-navy-700">
                            <tr>
                                <th className="px-6 py-3 font-medium">Name</th>
                                <th className="px-6 py-3 font-medium">Address</th>
                                <th className="px-6 py-3 font-medium">Created At</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-700/50">
                            {locations.map((loc) => (
                                <tr key={loc.id} className="hover:bg-navy-700/30 transition-colors">
                                    {editingLocationId === loc.id ? (
                                        <td colSpan={4} className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="text"
                                                    value={locationForm.name || ''}
                                                    onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                                                    className="px-2 py-1 bg-navy-900 border border-navy-600 text-white rounded text-sm flex-1"
                                                />
                                                <input
                                                    type="text"
                                                    value={locationForm.address || ''}
                                                    onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
                                                    className="px-2 py-1 bg-navy-900 border border-navy-600 text-white rounded text-sm flex-1"
                                                />
                                                <div className="flex gap-2">
                                                    <button onClick={() => setEditingLocationId(null)} className="p-1 text-slate-400 hover:text-red-400">
                                                        <XIcon className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => void handleSaveLocation()}
                                                        disabled={isSaving}
                                                        className="p-1 text-green-500 hover:text-green-400 disabled:opacity-50"
                                                    >
                                                        <CheckIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4 font-medium text-white">{loc.name}</td>
                                            <td className="px-6 py-4 text-slate-400">{loc.address}</td>
                                            <td className="px-6 py-4 text-slate-400">
                                                {loc.createdAt ? new Date(loc.createdAt).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => { setEditingLocationId(loc.id); setLocationForm(loc); setShowAddLocation(false); }}
                                                    className="p-1 text-slate-400 hover:text-gold-500 rounded transition-colors"
                                                >
                                                    <EditIcon className="w-4 h-4" />
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