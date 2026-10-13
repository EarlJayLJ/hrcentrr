import React, { useState } from 'react';
import { Search, Bell, ChevronDown, UserCheck, Shield, RefreshCw, KeyRound, LogOut } from 'lucide-react';
import { User, Announcement } from '../types.ts';

interface HeaderProps {
  currentUser: User;
  allUsers: User[];
  announcements: Announcement[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSwitchUser: (userId: string) => void;
  onOpenLanModal: () => void;
  onOpenChangePassword?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  announcements,
  searchQuery,
  onSearchChange,
  onSwitchUser,
  onOpenLanModal,
  onOpenChangePassword,
  onLogout
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadAnnouncements = announcements.filter(
    a => !a.acknowledgedBy.includes(currentUser.id)
  );

  return (
    <header className="flex items-center justify-between gap-4 py-3.5 px-6 border-b border-slate-200 bg-white">
      {/* Search Input matching reference */}
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search..."
          className="w-full pl-11 pr-4 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-slate-800 placeholder-slate-400 text-sm rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-inner/5"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Ghana Youth Authority Org Tag */}
        <div className="hidden xl:flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          <img
            src="/logo.jpg"
            alt="NYA Logo"
            className="w-4 h-4 rounded-full object-contain bg-white shrink-0 border border-slate-200"
          />
          <span>National Youth Authority · Ghana</span>
        </div>

        {/* LAN Status Pill */}
        <button
          onClick={onOpenLanModal}
          title="LAN Server Network Status"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-full transition-colors cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>LAN Mode</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadAnnouncements.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">
                  Announcements & Notices
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  {unreadAnnouncements.length} new
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {announcements.slice(0, 4).map((ann) => (
                  <div key={ann.id} className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition text-left">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-800 line-clamp-1">{ann.title}</span>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-1">{ann.publishedAt}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{ann.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Current User Profile Pill with Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-3 text-left p-1 pr-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-slate-800 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {currentUser.roleTitle}
              </div>
            </div>
            
            {/* Avatar circle matching reference */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white overflow-hidden"
              style={{ backgroundColor: currentUser.avatarBg }}
            >
              {currentUser.avatarText}
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in">
              <div className="px-2.5 py-2 mb-2 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm font-bold text-slate-900">{currentUser.name}</div>
                <div className="text-xs text-emerald-700 font-semibold">{currentUser.roleTitle}</div>
              </div>

              <div className="text-xs font-semibold text-slate-600 px-2 py-1">
                Switch User Account
              </div>
              <div className="max-h-56 overflow-y-auto space-y-1">
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSwitchUser(u.id);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-xs transition cursor-pointer ${
                      u.id === currentUser.id
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: u.avatarBg }}
                    >
                      {u.avatarText}
                    </div>
                    <div className="truncate flex-1">
                      <div className="truncate">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.roleTitle}</div>
                    </div>
                    {u.id === currentUser.id && (
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1">
                {onOpenChangePassword && (
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenChangePassword();
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-emerald-800 rounded-lg cursor-pointer font-medium"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Change Password</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onOpenLanModal();
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>LAN Connection Diagnostics</span>
                </button>

                {onLogout && (
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout();
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg cursor-pointer font-semibold border-t border-slate-50 mt-1 pt-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Sign Out Session</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
