
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { db } from '../../services/firebase';
import {
  Search, MoreVertical, UserPlus, Zap, X, Loader2, Copy, CheckCircle2,
} from 'lucide-react';

const ManageUsers: React.FC = () => {
  const [users, setUsers]               = useState<User[]>([]);
  const [loading, setLoading]           = useState(true);
  const [searchQuery, setSearchQuery]   = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUpdating, setIsUpdating]     = useState(false);
  const [showInvite, setShowInvite]     = useState(false);
  const [inviteLink, setInviteLink]     = useState('');
  const [linkCopied, setLinkCopied]     = useState(false);

  useEffect(() => {
    loadUsers();
    setInviteLink(`${window.location.origin}${window.location.pathname}#/login`);
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await db.getUsers();
    setUsers(data);
    setLoading(false);
  };

  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case 'Staff':          return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      case 'Mod':            return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Top Rated':      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Verified Talent': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Verified':       return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      default:               return 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-500 border-slate-200 dark:border-white/5';
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    setIsUpdating(true);
    await db.updateUserRole(userId, newRole);
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    setIsUpdating(false);
    setSelectedUser(null);
  };

  const handleAssignBadge = async (userId: string, badge: string) => {
    setIsUpdating(true);
    await db.assignBadge(userId, badge);
    setUsers(users.map(u => u.id === userId ? { ...u, badge: badge || undefined } : u));
    if (selectedUser?.id === userId) setSelectedUser(prev => prev ? { ...prev, badge: badge || undefined } : null);
    setIsUpdating(false);
  };

  const handleBan = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const isBanned = user.status === 'banned';
    const newStatus = isBanned ? 'ACTIVE' : 'BANNED';
    setIsUpdating(true);
    await db.updateUserStatus(userId, newStatus);
    setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus.toLowerCase() as any } : u));
    setIsUpdating(false);
    setSelectedUser(null);
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight text-slate-900 dark:text-white">
            Platform <span className="text-blue-500">Users</span>
          </h1>
          <p className="text-slate-500 dark:text-gray-500 font-medium">Manage permissions and assign Elite Status badges.</p>
        </div>
        <button onClick={() => setShowInvite(true)}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all font-bold text-white shadow-lg shadow-blue-500/20">
          <UserPlus className="w-5 h-5" /> Invite Member
        </button>
      </div>

      <div className="flex items-center gap-6 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search members…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4 text-slate-400 dark:text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="font-bold uppercase tracking-widest text-xs">Querying User Database…</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[40px] overflow-hidden shadow-sm dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 border-b border-slate-100 dark:border-white/5">
                  <th className="py-6 px-8">Member</th>
                  <th className="py-6 px-8">Role</th>
                  <th className="py-6 px-8">Elite Status</th>
                  <th className="py-6 px-8 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filtered.map(user => (
                  <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 last:border-none transition-colors">
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-4">
                        <img src={user.avatar} alt="" className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">
                          {user.role}
                        </span>
                        {user.status === 'banned' && (
                          <span className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-[9px] font-black uppercase tracking-widest text-red-500 dark:text-red-400">Banned</span>
                        )}
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <div className={`px-2.5 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${getBadgeStyle(user.badge)}`}>
                        {user.badge === 'Verified Talent' && <Zap className="w-3 h-3 fill-current" />}
                        {user.badge || 'Standard Member'}
                      </div>
                    </td>
                    <td className="py-6 px-8 text-right">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-blue-500 hover:text-white transition-all text-slate-400 dark:text-gray-500"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#0b0e14] border border-slate-200 dark:border-white/10 rounded-[40px] p-10 shadow-2xl relative">
            <button onClick={() => { setShowInvite(false); setLinkCopied(false); }}
              className="absolute top-8 right-8 text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-500">
              <UserPlus className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-white">Invite a Member</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-8 leading-relaxed">
              Share the signup link below. New members select their role (Learner, Educator, or Employer) during registration.
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-3 mb-6">
              <p className="text-xs font-mono text-slate-600 dark:text-gray-300 flex-1 truncate">{inviteLink}</p>
              <button
                onClick={() => { navigator.clipboard.writeText(inviteLink); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2500); }}
                className="shrink-0 p-2 rounded-xl bg-white dark:bg-white/10 hover:bg-blue-500 hover:text-white text-slate-400 dark:text-gray-400 transition-all border border-slate-200 dark:border-white/10"
              >
                {linkCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {linkCopied && (
              <p className="text-xs font-bold text-emerald-500 text-center mb-4">Link copied to clipboard!</p>
            )}
            <button
              onClick={() => { navigator.clipboard.writeText(inviteLink); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2500); }}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" /> Copy Invite Link
            </button>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#0b0e14] border border-slate-200 dark:border-white/10 rounded-[40px] p-10 shadow-2xl relative">
            {isUpdating && (
              <div className="absolute inset-0 bg-white/70 dark:bg-black/50 z-10 flex items-center justify-center rounded-[40px] backdrop-blur-sm">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
              </div>
            )}
            <button onClick={() => setSelectedUser(null)} className="absolute top-8 right-8 text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center mb-10">
              <img src={selectedUser.avatar} alt="" className="w-20 h-20 rounded-[24px] mb-4 border-2 border-slate-100 dark:border-white/10" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedUser.name}</h3>
              <p className="text-xs text-slate-500 dark:text-gray-500">{selectedUser.email}</p>
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 mb-4 px-2">Assign Role</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[UserRole.LEARNER, UserRole.EDUCATOR, UserRole.EMPLOYER, UserRole.MOD].map(r => (
                    <button
                      key={r}
                      onClick={() => handleUpdateRole(selectedUser.id, r)}
                      className={`px-4 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${
                        selectedUser.role === r
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-500 hover:bg-slate-200 dark:hover:bg-white/10'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 mb-4 px-2">Elite Status Badge</h4>
                <div className="grid grid-cols-2 gap-3">
                  {['Staff', 'Mod', 'Verified Talent', 'Top Rated'].map(b => (
                    <button
                      key={b}
                      onClick={() => handleAssignBadge(selectedUser.id, b)}
                      className={`px-4 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        selectedUser.badge === b
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-500 hover:bg-slate-200 dark:hover:bg-white/10'
                      }`}
                    >
                      {b === 'Verified Talent' && <Zap className="w-3 h-3" />}
                      {b}
                    </button>
                  ))}
                  <button
                    onClick={() => handleAssignBadge(selectedUser.id, '')}
                    className="px-4 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-500 hover:bg-red-500/20 hover:text-red-500 col-span-2 transition-all"
                  >
                    Remove All Badges
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                <button
                  onClick={() => handleBan(selectedUser.id)}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                    selectedUser.status === 'banned'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  {selectedUser.status === 'banned' ? 'Restore Access' : 'Banish from Ecosystem'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
