import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Simulator } from '../../../api';
import { getApiErrorMessage } from '../../../api/client';
import { fetchLocations } from '../../../services/location';
import { createSimulator, fetchSimulators, updateSimulator } from '../../../services/simulator';

export function SimulatorsTab() {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Simulator>>({
    status: 'ACTIVE',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'simulators'],
    queryFn: fetchSimulators,
  });
  const {
    data: locationsData,
    isLoading: isLocationsLoading,
    isError: isLocationsError,
    error: locationsError,
    refetch: refetchLocations,
  } = useQuery({
    queryKey: ['admin', 'locations'],
    queryFn: fetchLocations,
  });

  const simulators = data ?? [];
  const locations = locationsData ?? [];

  const startEdit = (sim: Simulator) => {
    setEditingId(sim.id);
    setShowAdd(false);
    setForm(sim);
    setSaveError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ status: 'ACTIVE' });
    setSaveError(null);
  };

  const save = async () => {
    if (isSaving) return;
    setSaveError(null);

    const name = (form.name || '').trim();
    const locationId = (form.locationId || 0)
    const status = (form.status || 'ACTIVE').toUpperCase() as Simulator['status'];

    if (!name || !locationId) {
      setSaveError('Name and location are required.');
      return;
    }

    try {
      setIsSaving(true);
      if (editingId) {
        await updateSimulator(editingId, { name, locationId:`${locationId}`, status });
      } else {
        await createSimulator({ name, locationId:`${locationId}`, status });
      }
      await refetch();
      setShowAdd(false);
      cancelEdit();
    } catch (e) {
      setSaveError(getApiErrorMessage(e));
    } finally {
      setIsSaving(false);
    }
  };

//   const toggleStatus = async (sim: Simulator) => {
//     if (isSaving) return;
//     setSaveError(null);
//     try {
//       setIsSaving(true);
//       await updateSimulator(sim.id, {
//         status: sim.status === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE',
//       });
//       await refetch();
//     } catch (e) {
//       setSaveError(getApiErrorMessage(e));
//     } finally {
//       setIsSaving(false);
//     }
//   };
console.log("data.length", data?.length);

  return (
    <div className="bg-navy-800 rounded-xl border border-navy-700 shadow-lg overflow-hidden">
      <div className="p-6 border-b border-navy-700 flex justify-between items-center bg-navy-900/50">
        <h3 className="text-lg font-serif font-bold text-white">Simulator Management</h3>
       {
        data && data.length < 1 &&
<button
          onClick={() => {
            setShowAdd(true);
            setEditingId(null);
            setForm({ status: 'ACTIVE' });
            setSaveError(null);
          }}
          className="px-4 py-2 bg-gold-500 text-navy-900 rounded-lg text-sm font-bold hover:bg-gold-400 transition-colors shadow-[0_0_10px_rgba(201,168,76,0.2)]"
        >
          Add Simulator
        </button>
       }
        
      </div>

      {showAdd && (
        <div className="border-b border-navy-700 bg-navy-900/60 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Simulator name"
              value={form.name || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="px-3 py-2 bg-navy-900 border border-navy-600 rounded-lg text-sm text-white focus:ring-gold-500 focus:border-gold-500 outline-none"
            />

            <select
              value={form.locationId || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, locationId: Number(e.target.value) }))}
              className="px-3 py-2 bg-navy-900 border border-navy-600 rounded-lg text-sm text-white focus:ring-gold-500 focus:border-gold-500 outline-none"
            >
              <option value="" disabled>
                Select location
              </option>
              {locations.map((loc) => (
                <option key={loc.id} value={String(loc.id)}>
                  {loc.name}
                </option>
              ))}
            </select>

            <select
              value={(form.status || 'active') as Simulator['status']}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, status: e.target.value as Simulator['status'] }))
              }
              className="px-3 py-2 bg-navy-900 border border-navy-600 rounded-lg text-sm text-white focus:ring-gold-500 focus:border-gold-500 outline-none"
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:bg-navy-700 hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => void save()}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-bold bg-gold-500 text-navy-900 hover:bg-gold-400 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Simulator'}
            </button>
          </div>
        </div>
      )}

      {saveError ? (
        <div className="mx-6 mt-4 rounded-lg border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-300">
          {saveError}
        </div>
      ) : null}

      {isLoading ? (
        <div className="px-6 py-10 text-center text-slate-400">Loading simulators...</div>
      ) : null}

      {isError ? (
        <div className="mx-6 my-4 rounded-lg border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-300">
          <p>{getApiErrorMessage(error)}</p>
          <button
            onClick={() => void refetch()}
            className="mt-3 rounded-md bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/30"
          >
            Retry
          </button>
        </div>
      ) : null}
      {isLocationsLoading ? (
        <div className="px-6 pb-6 text-sm text-slate-400">Loading locations...</div>
      ) : null}

      {isLocationsError ? (
        <div className="mx-6 my-4 rounded-lg border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-300">
          <p>{getApiErrorMessage(locationsError)}</p>
          <button
            onClick={() => void refetchLocations()}
            className="mt-3 rounded-md bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/30"
          >
            Retry locations
          </button>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-800 text-slate-400 border-b border-navy-700">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Location</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-700/50">
            {simulators.map((sim) => {
              const loc = locations.find((l) => String(l.id) === String(sim.locationId));
              return (
                <tr key={sim.id} className="hover:bg-navy-700/30 transition-colors">
                  {editingId === sim.id ? (
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={form.name || ''}
                          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                          className="w-full px-2 py-1 bg-navy-900 border border-navy-600 text-white rounded text-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={form.locationId || ''}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, locationId: Number(e.target.value) }))
                          }
                          className="w-full px-2 py-1 bg-navy-900 border border-navy-600 text-white rounded text-sm"
                        >
                          <option value="" disabled>
                            Select location
                          </option>
                          {locations.map((l) => (
                            <option key={l.id} value={String(l.id)}>
                              {l.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={(form.status || 'active') as Simulator['status']}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              status: e.target.value as Simulator['status'],
                            }))
                          }
                          className="w-full px-2 py-1 bg-navy-900 border border-navy-600 text-white rounded text-sm"
                        >
                          <option value="active">Active</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={cancelEdit}
                            className="text-slate-400 hover:text-red-400 font-medium text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => void save()}
                            disabled={isSaving}
                            className="text-green-400 hover:text-green-300 font-medium text-sm disabled:opacity-50"
                          >
                            Save
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 font-medium text-white">{sim.name}</td>
                      <td className="px-6 py-4 text-slate-400">{loc?.name || '—'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            sim.status === 'ACTIVE'
                              ? 'bg-green-900/30 text-green-400 border-green-900/50'
                              : 'bg-red-900/30 text-red-400 border-red-900/50'
                          }`}
                        >
                          {sim.status.charAt(0).toUpperCase() + sim.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => startEdit(sim)}
                            className="text-slate-300 hover:text-white font-medium text-sm"
                          >
                            Edit
                          </button>
                          {/* <button
                            onClick={() => void toggleStatus(sim)}
                            disabled={isSaving}
                            className="text-gold-500 hover:text-gold-400 font-medium text-sm disabled:opacity-50"
                          >
                            Toggle Status
                          </button> */}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}