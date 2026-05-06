import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, EditIcon, XIcon, CheckIcon } from 'lucide-react';
import { Member } from '../../../api';
import { getApiErrorMessage } from '../../../api/client';
import { fetchMembers } from '../../../services/member';

export function MembersTab() {
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState<Partial<Member>>({});
  const [members, setMembers] = useState<Member[]>([]);
  const { data: fetchedMembers, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'members'],
    queryFn: fetchMembers,
  });

  useEffect(() => {
    setMembers(fetchedMembers || []);
  }, [fetchedMembers]);

  const handleSaveMember = () => {
    if (editingMemberId) {
      setMembers(members.map((m) =>
        m.id === editingMemberId ? { ...m, ...memberForm } as Member : m
      ));
      setEditingMemberId(null);
    } else {
      const newMember: Member = {
        id: `mem-${Date.now()}`,
        name: memberForm.name || '',
        email: memberForm.email || '',
        membershipType: memberForm.membershipType || 'monthly',
        status: 'active',
        totalRounds: 0,
        avgScore: 0,
      };
      setMembers([...members, newMember]);
      setShowAddMember(false);
    }
    setMemberForm({});
  };

  return (
    <div className="bg-navy-800 rounded-xl border border-navy-700 shadow-lg overflow-hidden">
      <div className="p-6 border-b border-navy-700 flex justify-between items-center bg-navy-900/50">
        <h3 className="text-lg font-serif font-bold text-white">Member Management</h3>
        {/* <button
          onClick={() => { setShowAddMember(true); setEditingMemberId(null); setMemberForm({ membershipType: 'monthly' }); }}
          className="px-4 py-2 bg-gold-500 text-navy-900 rounded-lg text-sm font-bold hover:bg-gold-400 transition-colors flex items-center gap-2 shadow-[0_0_10px_rgba(201,168,76,0.2)]"
        >
          <PlusIcon className="w-4 h-4" />
          Add Member
        </button> */}
      </div>

      <AnimatePresence>
        {showAddMember && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-navy-900/80 border-b border-navy-700 p-6"
          >
            <h4 className="font-medium text-white mb-4">Add New Member</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input type="text" placeholder="Full Name" value={memberForm.name || ''}
                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                className="px-3 py-2 bg-navy-900 border border-navy-600 rounded-lg text-sm text-white focus:ring-gold-500 focus:border-gold-500 outline-none" />
              <input type="email" placeholder="Email Address" value={memberForm.email || ''}
                onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                className="px-3 py-2 bg-navy-900 border border-navy-600 rounded-lg text-sm text-white focus:ring-gold-500 focus:border-gold-500 outline-none" />
              <select value={memberForm.membershipType || 'monthly'}
                onChange={(e) => setMemberForm({ ...memberForm, membershipType: e.target.value as any })}
                className="px-3 py-2 bg-navy-900 border border-navy-600 rounded-lg text-sm text-white focus:ring-gold-500 focus:border-gold-500 outline-none">
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="daypass">Day Pass</option>
              </select>
            </div>
            {/* <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddMember(false)}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:bg-navy-700 hover:text-white rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveMember}
                className="px-4 py-2 text-sm font-bold bg-gold-500 text-navy-900 hover:bg-gold-400 rounded-lg transition-colors">
                Save Member
              </button>
            </div> */}
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="px-6 py-10 text-center text-slate-400">Loading members...</div>
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

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-800 text-slate-400 border-b border-navy-700">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-center">Rounds</th>
              <th className="px-6 py-3 font-medium text-center">Avg Score</th>
              {/* <th className="px-6 py-3 font-medium text-right">Actions</th> */}
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-700/50">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-navy-700/30 transition-colors">
                {editingMemberId === member.id ? (
                  <td colSpan={7} className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <input type="text" value={memberForm.name || ''}
                        onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                        className="px-2 py-1 bg-navy-900 border border-navy-600 text-white rounded text-sm w-1/4" />
                      <input type="email" value={memberForm.email || ''}
                        onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                        className="px-2 py-1 bg-navy-900 border border-navy-600 text-white rounded text-sm w-1/4" />
                      <select value={memberForm.membershipType || ''}
                        onChange={(e) => setMemberForm({ ...memberForm, membershipType: e.target.value as any })}
                        className="px-2 py-1 bg-navy-900 border border-navy-600 text-white rounded text-sm">
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="daypass">Day Pass</option>
                      </select>
                      {/* <div className="flex-1 flex justify-end gap-2">
                        <button onClick={() => setEditingMemberId(null)} className="p-1 text-slate-400 hover:text-red-400">
                          <XIcon className="w-5 h-5" />
                        </button>
                        <button onClick={handleSaveMember} className="p-1 text-green-500 hover:text-green-400">
                          <CheckIcon className="w-5 h-5" />
                        </button>
                      </div> */}
                    </div>
                  </td>
                ) : (
                  <>
                    <td className="px-6 py-4 font-medium text-white">{member.name}</td>
                    <td className="px-6 py-4 text-slate-400">{member.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        member.membershipType === 'yearly'
                          ? 'bg-gold-500/20 text-gold-400 border-gold-500/30'
                          : member.membershipType === 'monthly'
                          ? 'bg-blue-900/30 text-blue-400 border-blue-900/50'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {member.membershipType.charAt(0).toUpperCase() + member.membershipType.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        member.status === 'active'
                          ? 'bg-green-900/30 text-green-400 border-green-900/50'
                          : member.status === 'suspended'
                          ? 'bg-red-900/30 text-red-400 border-red-900/50'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-400">{member.totalRounds}</td>
                    <td className="px-6 py-4 text-center font-medium text-white">{member.avgScore}</td>
                    {/* <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setMembers(members.map((m) =>
                            m.id === member.id ? { ...m, status: m.status === 'active' ? 'suspended' : 'active' } : m
                          ))}
                          className="text-xs font-medium text-gold-500 hover:text-gold-400">
                          Toggle Status
                        </button>
                        <button
                          onClick={() => { setEditingMemberId(member.id); setMemberForm(member); setShowAddMember(false); }}
                          className="p-1 text-slate-400 hover:text-gold-500 rounded transition-colors">
                          <EditIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td> */}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}