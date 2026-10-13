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
    <div className="space-y-4">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            System Administration & LAN Deployment
          </h2>
          <p className="text-xs text-slate-500">
            Manage National Youth Authority HR user accounts, roles, access permissions, and LAN settings
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onExportBackup && (
            <button
              onClick={onExportBackup}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Backup</span>
            </button>
          )}

          <button
            onClick={onAddUser}
            className="flex items-center gap-2 px-4 py-2 bg-[#006b3f] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>New User Account</span>
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl text-xs w-fit flex-wrap">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeTab === 'USERS'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          User Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('RESETS')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'RESETS'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Password Requests</span>
          {resetTickets.filter(t => t.status === 'PENDING').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
              {resetTickets.filter(t => t.status === 'PENDING').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('LAN')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeTab === 'LAN'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          LAN Network Status
        </button>
        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeTab === 'SETTINGS'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          System Policies
        </button>
      </div>

      {activeTab === 'USERS' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          {/* User search & filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {['ALL', 'HR_ADMIN', 'HR_MANAGER', 'HR_SPECIALIST', 'HR_OFFICER', 'HR_DIRECTOR'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    roleFilter === r
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {r.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Search by name, email, department..."
                className="pl-8 pr-4 py-1.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 w-full sm:w-72"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 text-[11px] border-b border-slate-100">
                  <th className="pb-2.5 font-normal">Staff User</th>
                  <th className="pb-2.5 font-normal">Email & Username</th>
                  <th className="pb-2.5 font-normal">Role & Designation</th>
                  <th className="pb-2.5 font-normal">Department</th>
                  <th className="pb-2.5 font-normal">Status</th>
                  <th className="pb-2.5 font-normal">Security State</th>
                  <th className="pb-2.5 font-normal text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const sec = securityUsers.find(s => s.id === u.id);
                  const isLocked = sec?.isLocked;
                  const failedAttempts = sec?.failedLoginAttempts || 0;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 font-semibold text-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-2xs"
                            style={{ backgroundColor: u.avatarBg }}
                          >
                            {u.avatarText}
                          </div>
                          <span>{u.name}</span>
                        </div>
                      </td>

                      <td className="py-3 text-slate-600 font-mono text-[11px]">
                        <div>{u.email}</div>
                        <div className="text-[10px] text-slate-400 font-mono">@{u.username || sec?.username || 'user'}</div>
                      </td>

                      <td className="py-3">
                        <div className="font-semibold text-slate-800">{u.roleTitle}</div>
                        <div className="text-[10px] text-slate-400">{u.role}</div>
                      </td>

                      <td className="py-3 text-slate-600">{u.department}</td>

                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-600 border border-red-200'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      <td className="py-3">
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-300">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            Locked (Failed Tries)
                          </span>
                        ) : failedAttempts > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Clock className="w-3 h-3 text-emerald-700" />
                            {failedAttempts}/5 failed tries
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
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
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Unlock className="w-3 h-3" />
                              <span>Unlock</span>
                            </button>
                          )}

                          {onResetPassword && (
                            <button
                              onClick={() => onResetPassword(u)}
                              title="Provision new temporary password"
                              className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <KeyRound className="w-3 h-3 text-emerald-700" />
                              <span>Reset PW</span>
                            </button>
                          )}

                          <button
                            onClick={() => onToggleUserStatus(u.id, u.status)}
                            className={`px-2.5 py-1 border rounded-lg text-xs font-medium transition cursor-pointer ${
                              u.status === 'ACTIVE'
                                ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                                : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 font-bold'
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
              <div className="text-center py-8 text-xs text-slate-400">
                No users found matching query.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'RESETS' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-bold text-slate-800">
                Offline LAN Password Recovery Tickets ({resetTickets.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">
              Staff submit reset requests directly from the login terminal
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 text-[11px] border-b border-slate-100">
                  <th className="pb-2.5 font-normal">Identifier / Staff</th>
                  <th className="pb-2.5 font-normal">Department</th>
                  <th className="pb-2.5 font-normal">Notes / Station</th>
                  <th className="pb-2.5 font-normal">Timestamp</th>
                  <th className="pb-2.5 font-normal">Status</th>
                  <th className="pb-2.5 font-normal text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resetTickets.map((ticket) => {
                  const target = users.find(u => u.email.toLowerCase() === ticket.identifier.toLowerCase() || (u.username && u.username.toLowerCase() === ticket.identifier.toLowerCase()));

                  return (
                    <tr key={ticket.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 font-semibold text-slate-800">
                        <div>{ticket.staffName || ticket.identifier}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{ticket.identifier}</div>
                      </td>

                      <td className="py-3 text-slate-600">{ticket.department || 'General Staff'}</td>

                      <td className="py-3 text-slate-500 max-w-xs truncate">{ticket.notes || 'LAN Request'}</td>

                      <td className="py-3 text-slate-400 text-[11px]">
                        {ticket.requestedAt?.replace('T', ' ').substring(0, 16) || 'Recent'}
                      </td>

                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ticket.status === 'PENDING'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
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
                              className="px-2.5 py-1 bg-[#006b3f] hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Issue Reset
                            </button>
                          )}

                          {ticket.status === 'PENDING' ? (
                            <button
                              onClick={() => handleResolveTicket(ticket.id)}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              Mark Resolved
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 justify-end">
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
              <div className="text-center py-8 text-xs text-slate-400">
                No password recovery requests logged.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'LAN' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800">
                Office Local Area Network (LAN) Configuration
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              LAN Active (Port 3000)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500">Server Hostname</span>
              <div className="font-mono font-bold text-slate-800 mt-0.5">
                {lanInfo?.hostname || 'nya-ghana-hr-lan'}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500">LAN Access Address</span>
              <div className="font-mono font-bold text-emerald-600 mt-0.5">
                {lanInfo?.accessUrls?.[0] || 'http://192.168.1.100:3000'}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500">Network Dependency</span>
              <div className="font-bold text-slate-800 mt-0.5">
                100% Standalone (Zero External APIs)
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 leading-relaxed border border-slate-200">
            <strong className="text-slate-800">Connecting other devices on the office LAN:</strong>
            <br />
            Ensure computers or tablets are connected to the same Ghana Youth Authority Wi-Fi network or Ethernet switch. Direct the browser to the LAN Access Address. All files, messages, cases, and calendar items synchronize in real-time over Socket.IO without internet.
          </div>
        </div>
      )}

      {activeTab === 'SETTINGS' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-bold text-slate-800">Department System Policies</h3>
            </div>
            {settingsSaved && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <Check className="w-3.5 h-3.5" /> Policies updated successfully
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Office Timezone Setting</label>
              <select
                value={orgTimezone}
                onChange={(e) => setOrgTimezone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              >
                <option value="GMT (UTC+0)">GMT (UTC+0) - Ghana Standard Time</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
              </select>
              <span className="text-[10px] text-slate-400 block">
                Official timezone for all calendar meetings, deadlines, and audit logs.
              </span>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Document Governance</label>
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireDocApproval}
                    onChange={(e) => setRequireDocApproval(e.target.checked)}
                    className="rounded text-emerald-700 focus:ring-emerald-500"
                  />
                  <span className="text-slate-700 font-medium">Require administrative approval for uploaded policies</span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-[#006b3f] hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
