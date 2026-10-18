import React, { useState, useEffect } from 'react';
import { Users, Server, UserPlus, Search, Download, Upload, Shield, Settings, Check, KeyRound, Unlock, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { User, UserRole } from '../types.ts';

interface AdminViewProps {
  users: User[];
  lanInfo: any;
  onAddUser: () => void;
  onToggleUserStatus: (userId: string, currentStatus: User['status']) => void;
  onResetPassword?: (user: User) => void;
  onUnlockAccount?: (userId: string) => void;
  onExportBackup?: () => void;
  onRestoreBackup?: (fileContent: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  users,
  lanInfo,
  onAddUser,
  onToggleUserStatus,
  onResetPassword,
  onUnlockAccount,
  onExportBackup,
  onRestoreBackup
}) => {
  const [searchUser, setSearchUser] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'USERS' | 'LAN' | 'SETTINGS' | 'RESETS'>('USERS');

  // Security stats & reset tickets state
  const [securityUsers, setSecurityUsers] = useState<any[]>([]);
  const [resetTickets, setResetTickets] = useState<any[]>([]);

  const fetchSecurityData = () => {
    fetch('/api/admin/users-security')
      .then(res => res.json())
      .then(data => Array.isArray(data) && setSecurityUsers(data))
      .catch(console.error);

    fetch('/api/admin/reset-tickets')
      .then(res => res.json())
      .then(data => Array.isArray(data) && setResetTickets(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleResolveTicket = (ticketId: string) => {
    fetch(`/api/admin/reset-tickets/${ticketId}/resolve`, { method: 'PATCH' })
      .then(res => res.json())
      .then(() => fetchSecurityData())
      .catch(console.error);
  };

  // Settings state
  const [orgTimezone, setOrgTimezone] = useState('GMT (UTC+0)');
  const [requireDocApproval, setRequireDocApproval] = useState(true);
  const [allowRegistration, setAllowRegistration] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (searchUser) {
      const q = searchUser.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        u.roleTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSaveSettings = () => {
    fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timezone: orgTimezone,
        requireDocumentApproval: requireDocApproval,
        allowSelfRegistration: allowRegistration
      })
    })
      .then(() => {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 2500);
      })
      .catch(console.error);
  };

  return (
    <div className="space-y-4 select-none text-black">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-liquid-tile p-4.5 rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.05),inset_0_1.5px_2px_rgba(255,255,255,0.95)]">
        <div>
          <h2 className="text-base font-bold text-black tracking-wide">
            System Administration & LAN Deployment
          </h2>
          <p className="text-xs text-black mt-0.5">
            Manage National Youth Authority HR user accounts, roles, access permissions, and LAN settings
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {onExportBackup && (
            <button
              onClick={onExportBackup}
              className="flex items-center gap-1.5 px-3.5 py-2 glass-btn-secondary rounded-xl text-xs font-semibold text-black hover:text-black transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#7738FF]" />
              <span>Export Backup</span>
            </button>
          )}

          <button
            onClick={onAddUser}
            className="flex items-center gap-2 px-4 py-2 glass-liquid-cta rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>New User Account</span>
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 p-1 glass-liquid-pill rounded-xl text-xs w-fit flex-wrap">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeTab === 'USERS'
              ? 'glass-liquid-nav-active font-bold'
              : 'text-black hover:text-black'
          }`}
        >
          User Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('RESETS')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'RESETS'
              ? 'glass-liquid-nav-active font-bold'
              : 'text-black hover:text-black'
          }`}
        >
          <span>Password Requests</span>
          {resetTickets.filter(t => t.status === 'PENDING').length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-[#7738FF] text-black text-[10px] font-bold shadow-[0_0_8px_#7738FF]">
              {resetTickets.filter(t => t.status === 'PENDING').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('LAN')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeTab === 'LAN'
              ? 'glass-liquid-nav-active font-bold'
              : 'text-black hover:text-black'
          }`}
        >
          LAN Network Status
        </button>
        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeTab === 'SETTINGS'
              ? 'glass-liquid-nav-active font-bold'
              : 'text-black hover:text-black'
          }`}
        >
          System Policies
        </button>
      </div>

      {activeTab === 'USERS' && (
        <div className="glass-liquid-tile p-5 rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.05),inset_0_1.5px_2px_rgba(255,255,255,0.95)] space-y-4">
          {/* User search & filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {['ALL', 'HR_ADMIN', 'HR_MANAGER', 'HR_SPECIALIST', 'HR_OFFICER', 'HR_DIRECTOR'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer border ${
                    roleFilter === r
                      ? 'bg-[#7738FF] text-black font-bold shadow-xs border-[#7738FF]'
                      : 'glass-liquid-pill text-black hover:text-black'
                  }`}
                >
                  {r.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7738FF]" />
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Search by name, email, department..."
                className="pl-8 pr-4 py-1.5 bg-white/80 text-black hover:bg-white/[0.07] focus:bg-white/[0.09] text-black placeholder-[#A6B0C8]/50 text-xs rounded-xl border border-white/80 focus:border-[#7738FF] focus:outline-none w-full sm:w-72 transition shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-black text-[11px] border-b border-slate-200/80">
                  <th className="pb-2.5 font-normal">Staff User</th>
                  <th className="pb-2.5 font-normal">Email & Username</th>
                  <th className="pb-2.5 font-normal">Role & Designation</th>
                  <th className="pb-2.5 font-normal">Department</th>
                  <th className="pb-2.5 font-normal">Status</th>
                  <th className="pb-2.5 font-normal">Security State</th>
                  <th className="pb-2.5 font-normal text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60">
                {filteredUsers.map((u) => {
                  const sec = securityUsers.find(s => s.id === u.id);
                  const isLocked = sec?.isLocked;
                  const failedAttempts = sec?.failedLoginAttempts || 0;

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.035] transition">
                      <td className="py-3 font-semibold text-black">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-black text-[10px] font-bold shadow-xs ring-1 ring-white/20"
                            style={{ backgroundColor: u.avatarBg || '#7738FF' }}
                          >
                            {u.avatarText}
                          </div>
                          <span>{u.name}</span>
                        </div>
                      </td>

                      <td className="py-3 text-black font-mono text-[11px]">
                        <div>{u.email}</div>
                        <div className="text-[10px] text-black font-mono">@{u.username || sec?.username || 'user'}</div>
                      </td>

                      <td className="py-3">
                        <div className="font-semibold text-black">{u.roleTitle}</div>
                        <div className="text-[10px] text-[#7738FF] font-semibold">{u.role}</div>
                      </td>

                      <td className="py-3 text-black">{u.department}</td>

                      <td className="py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      <td className="py-3">
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            Locked (Failed Tries)
                          </span>
                        ) : failedAttempts > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <Clock className="w-3 h-3 text-amber-400" />
                            {failedAttempts}/5 failed tries
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                            <Check className="w-3.5 h-3.5" />
                            Normal
                          </span>
                        )}
                      </td>

                      <td className="py-3 text-right pr-2">
                        <div className="flex items-center justify-end gap-1.5">
                          {isLocked && onUnlockAccount && (
                            <button
                              onClick={() => onUnlockAccount(u.id)}
                              title="Clear lockout and reset failed attempts"
                              className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                            >
                              <Unlock className="w-3 h-3" />
                              <span>Unlock</span>
                            </button>
                          )}

                          {onResetPassword && (
                            <button
                              onClick={() => onResetPassword(u)}
                              title="Provision new temporary password"
                              className="px-2 py-1 glass-btn-secondary hover:border-[#7738FF] text-black rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-xs"
                            >
                              <KeyRound className="w-3 h-3 text-[#7738FF]" />
                              <span>Reset PW</span>
                            </button>
                          )}

                          <button
                            onClick={() => onToggleUserStatus(u.id, u.status)}
                            className={`px-2.5 py-1 border rounded-lg text-xs font-medium transition cursor-pointer ${
                              u.status === 'ACTIVE'
                                ? 'glass-btn-secondary border-slate-200/80 text-black hover:text-black'
                                : 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/40 text-emerald-300 font-bold'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-xs text-black">
                No users found matching query.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'RESETS' && (
        <div className="glass-liquid-tile p-5 rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.05),inset_0_1.5px_2px_rgba(255,255,255,0.95)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#7738FF]" />
              <h3 className="text-xs font-bold text-black uppercase tracking-wider">
                Offline LAN Password Recovery Tickets ({resetTickets.length})
              </h3>
            </div>
            <span className="text-[11px] text-black">
              Staff submit reset requests directly from the login terminal
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-black text-[11px] border-b border-slate-200/80">
                  <th className="pb-2.5 font-normal">Identifier / Staff</th>
                  <th className="pb-2.5 font-normal">Department</th>
                  <th className="pb-2.5 font-normal">Notes / Station</th>
                  <th className="pb-2.5 font-normal">Timestamp</th>
                  <th className="pb-2.5 font-normal">Status</th>
                  <th className="pb-2.5 font-normal text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60">
                {resetTickets.map((ticket) => {
                  const target = users.find(u => u.email.toLowerCase() === ticket.identifier.toLowerCase() || (u.username && u.username.toLowerCase() === ticket.identifier.toLowerCase()));

                  return (
                    <tr key={ticket.id} className="hover:bg-white/[0.035] transition">
                      <td className="py-3 font-semibold text-black">
                        <div>{ticket.staffName || ticket.identifier}</div>
                        <div className="text-[10px] text-black font-mono">{ticket.identifier}</div>
                      </td>

                      <td className="py-3 text-black">{ticket.department || 'General Staff'}</td>

                      <td className="py-3 text-black max-w-xs truncate">{ticket.notes || 'LAN Request'}</td>

                      <td className="py-3 text-black font-mono text-[11px]">
                        {ticket.requestedAt?.replace('T', ' ').substring(0, 16) || 'Recent'}
                      </td>

                      <td className="py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ticket.status === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </td>

                      <td className="py-3 text-right pr-2">
                        <div className="flex items-center justify-end gap-1.5">
                          {ticket.status === 'PENDING' && target && onResetPassword && (
                            <button
                              onClick={() => {
                                onResetPassword(target);
                                handleResolveTicket(ticket.id);
                              }}
                              className="px-2.5 py-1 glass-liquid-cta rounded-lg text-xs font-bold cursor-pointer transition shadow-xs"
                            >
                              Issue Reset
                            </button>
                          )}

                          {ticket.status === 'PENDING' ? (
                            <button
                              onClick={() => handleResolveTicket(ticket.id)}
                              className="px-2.5 py-1 glass-btn-secondary hover:border-[#7738FF] text-black rounded-lg text-xs font-semibold cursor-pointer transition"
                            >
                              Mark Resolved
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 justify-end">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Resolved
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {resetTickets.length === 0 && (
              <div className="text-center py-8 text-xs text-black">
                No password recovery requests logged.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'LAN' && (
        <div className="glass-liquid-tile p-5 rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.05),inset_0_1.5px_2px_rgba(255,255,255,0.95)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#7738FF]" />
              <h3 className="text-xs font-bold text-black uppercase tracking-wider">
                Office Local Area Network (LAN) Configuration
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
              LAN Active (Port 3000)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-white/80 text-black rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-black">Server Hostname</span>
              <div className="font-mono font-bold text-black mt-1">
                {lanInfo?.hostname || 'nya-ghana-hr-lan'}
              </div>
            </div>
            <div className="p-3.5 bg-white/80 text-black rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-black">LAN Access Address</span>
              <div className="font-mono font-bold text-[#7738FF] mt-1">
                {lanInfo?.accessUrls?.[0] || 'http://192.168.1.100:3000'}
              </div>
            </div>
            <div className="p-3.5 bg-white/80 text-black rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-black">Network Dependency</span>
              <div className="font-bold text-black mt-1">
                100% Standalone (Zero External APIs)
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-white/80 text-black rounded-xl text-xs text-black leading-relaxed border border-slate-200/80 shadow-xs">
            <strong className="text-black">Connecting other devices on the office LAN:</strong>
            <br />
            Ensure computers or tablets are connected to the same Ghana Youth Authority Wi-Fi network or Ethernet switch. Direct the browser to the LAN Access Address. All files, messages, cases, and calendar items synchronize in real-time over Socket.IO without internet.
          </div>
        </div>
      )}

      {activeTab === 'SETTINGS' && (
        <div className="glass-liquid-tile p-5 rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.05),inset_0_1.5px_2px_rgba(255,255,255,0.95)] space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#7738FF]" />
              <h3 className="text-xs font-bold text-black uppercase tracking-wider">Department System Policies</h3>
            </div>
            {settingsSaved && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                <Check className="w-3.5 h-3.5" /> Policies updated successfully
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-semibold text-black">Office Timezone Setting</label>
              <select
                value={orgTimezone}
                onChange={(e) => setOrgTimezone(e.target.value)}
                className="w-full px-3 py-2 bg-white/80 text-black rounded-xl border border-white/80 text-black focus:outline-none focus:border-[#7738FF]"
              >
                <option value="GMT (UTC+0)" className="bg-[#050816] text-black">GMT (UTC+0) - Ghana Standard Time</option>
                <option value="UTC" className="bg-[#050816] text-black">UTC (Coordinated Universal Time)</option>
              </select>
              <span className="text-[10px] text-black block">
                Official timezone for all calendar meetings, deadlines, and audit logs.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-black">Document Governance</label>
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireDocApproval}
                    onChange={(e) => setRequireDocApproval(e.target.checked)}
                    className="rounded text-[#7738FF] focus:ring-[#7738FF] bg-white/80 text-black border-white/20"
                  />
                  <span className="text-black font-medium">Require administrative approval for uploaded policies</span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 glass-liquid-cta rounded-xl font-bold transition cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
