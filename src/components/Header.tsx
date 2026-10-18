import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, UserCheck, Shield, KeyRound, LogOut, CheckCheck, MessageSquare, CheckSquare, Calendar, Megaphone, AlertCircle } from 'lucide-react';
import { User, Announcement, NotificationItem } from '../types.ts';

interface HeaderProps {
  currentUser: User;
  allUsers: User[];
  announcements: Announcement[];
  notifications: NotificationItem[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSwitchUser: (userId: string) => void;
  onOpenLanModal: () => void;
  onOpenChangePassword?: () => void;
  onLogout?: () => void;
  onMarkNotificationRead?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
  onNotificationClick?: (n: NotificationItem) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  announcements,
  notifications,
  searchQuery,
  onSearchChange,
  onSwitchUser,
  onOpenLanModal,
  onOpenChangePassword,
  onLogout,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onNotificationClick
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Position coordinates for floating popovers
  const [profileCoords, setProfileCoords] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const [notifCoords, setNotifCoords] = useState<{ top: number; right: number }>({ top: 0, right: 0 });

  const profileBtnRef = useRef<HTMLButtonElement>(null);
  const notifBtnRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const unreadNotifications = notifications.filter(n => !n.read);

  // Toggle Profile Dropdown & calculate viewport fixed position
  const toggleProfileDropdown = () => {
    if (!showUserDropdown && profileBtnRef.current) {
      const rect = profileBtnRef.current.getBoundingClientRect();
      setProfileCoords({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
      setShowNotifications(false);
    }
    setShowUserDropdown(!showUserDropdown);
  };

  // Toggle Notifications Dropdown & calculate viewport fixed position
  const toggleNotifDropdown = () => {
    if (!showNotifications && notifBtnRef.current) {
      const rect = notifBtnRef.current.getBoundingClientRect();
      setNotifCoords({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
      setShowUserDropdown(false);
    }
    setShowNotifications(!showNotifications);
  };

  // Click Outside and Keydown (Escape) Handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showUserDropdown &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node) &&
        profileBtnRef.current &&
        !profileBtnRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }

      if (
        showNotifications &&
        notifMenuRef.current &&
        !notifMenuRef.current.contains(event.target as Node) &&
        notifBtnRef.current &&
        !notifBtnRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowUserDropdown(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showUserDropdown, showNotifications]);

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'MESSAGE':
        return <MessageSquare className="w-3.5 h-3.5 text-violet-400 shrink-0" />;
      case 'TASK_ASSIGNED':
      case 'TASK_UPDATED':
        return <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'MEETING_REMINDER':
        return <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
      case 'ANNOUNCEMENT':
        return <Megaphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
    }
  };

  return (
    <header className="flex items-center justify-between gap-4 py-3.5 px-6 border-b border-white/50 bg-white/[0.22] backdrop-blur-xl text-black select-none relative z-30 shadow-[0_4px_20px_rgba(15,23,42,0.02),inset_0_1px_1.5px_rgba(255,255,255,0.85)]">
      {/* Window Controls (Red, Yellow, Green) matching reference screenshot */}
      <div className="flex items-center gap-2 mr-1 shrink-0">
        <span className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[0_0_8px_rgba(255,95,86,0.5)] ring-1 ring-black/10 cursor-pointer"></span>
        <span className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[0_0_8px_rgba(255,189,46,0.5)] ring-1 ring-black/10 cursor-pointer"></span>
        <span className="w-3 h-3 rounded-full bg-[#27c93f] shadow-[0_0_8px_rgba(39,201,63,0.5)] ring-1 ring-black/10 cursor-pointer"></span>
      </div>

      {/* Search Input with Frosted Liquid Glass */}
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2563EB]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search personnel, tasks, documents, cases..."
          className="w-full pl-11 pr-4 py-2 bg-white/50 hover:bg-white/70 focus:bg-white/90 text-black placeholder-slate-700 text-xs sm:text-sm rounded-full border border-white/80 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-medium shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)]"
        />
      </div>

      {/* Right Controls Zone */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Ghana Youth Authority Org Tag */}
        <div className="hidden xl:flex items-center gap-2 text-xs font-bold text-black bg-white/70 px-3 py-1.5 rounded-full border border-white/90 backdrop-blur-md shadow-xs">
          <img
            src="/logo.jpg"
            alt="NYA Logo"
            className="w-4 h-4 rounded-full object-contain bg-white p-0.5 shrink-0 shadow-xs"
          />
          <span className="tracking-wide text-black font-bold">National Youth Authority · Ghana</span>
        </div>

        {/* LAN Status Pill */}
        <button
          onClick={onOpenLanModal}
          title="LAN Server Network Status"
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-black bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 rounded-full transition-all cursor-pointer shadow-xs"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-600 shadow-[0_0_6px_#10b981] animate-pulse"></span>
          <span className="text-black font-bold">LAN Mode</span>
        </button>

        {/* Notifications Control Button */}
        <div>
          <button
            ref={notifBtnRef}
            onClick={toggleNotifDropdown}
            className={`relative p-2 text-black hover:text-black rounded-full transition cursor-pointer ${
              showNotifications ? 'bg-white/90 text-black ring-1 ring-[#7738FF]/30' : 'hover:bg-white/70'
            }`}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-black" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1 right-1 px-1.5 py-0.2 bg-[#7738FF] text-black text-[9px] font-bold rounded-full ring-2 ring-white shadow-xs min-w-[16px] text-center">
                {unreadNotifications.length}
              </span>
            )}
          </button>
        </div>

        {/* Current User Profile Control Button (Vibrant Blue for Easy Identification) */}
        <div>
          <button
            ref={profileBtnRef}
            onClick={toggleProfileDropdown}
            className={`flex items-center gap-3 text-left px-3 py-1.5 rounded-2xl border transition cursor-pointer shadow-md ${
              showUserDropdown
                ? 'bg-[#1D4ED8] border-white text-white ring-2 ring-blue-300'
                : 'bg-[#2563EB] hover:bg-[#1D4ED8] border-blue-400/60 text-white shadow-blue-500/20'
            }`}
          >
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-white leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-blue-100 font-medium">
                {currentUser.roleTitle}
              </div>
            </div>
            
            {/* Avatar circle */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs ring-2 ring-white/80 overflow-hidden shrink-0"
              style={{ backgroundColor: currentUser.avatarBg || '#1E40AF' }}
            >
              {currentUser.avatarText}
            </div>

            <ChevronDown className={`w-3.5 h-3.5 text-white transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* FLOATING NOTIFICATIONS POPOVER */}
      {showNotifications && (
        <div
          ref={notifMenuRef}
          style={{
            position: 'fixed',
            top: `${notifCoords.top}px`,
            right: `${Math.max(16, notifCoords.right)}px`,
            zIndex: 9999
          }}
          className="w-80 sm:w-96 glass-profile-panel rounded-2xl p-4 text-black animate-in fade-in zoom-in-95 border border-slate-300 shadow-2xl bg-white"
        >
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-black" />
              <span className="text-xs font-bold text-black tracking-wide">
                Notifications & Alerts
              </span>
            </div>
            {unreadNotifications.length > 0 && (
              <button
                onClick={() => onMarkAllNotificationsRead?.()}
                className="text-[10px] text-white font-bold flex items-center gap-1 bg-[#2563EB] hover:bg-[#1D4ED8] px-2.5 py-1 rounded-full shadow-xs cursor-pointer transition"
              >
                <CheckCheck className="w-3 h-3 text-white" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2 pr-0.5">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (onNotificationClick) onNotificationClick(notif);
                  if (onMarkNotificationRead && !notif.read) onMarkNotificationRead(notif.id);
                  setShowNotifications(false);
                }}
                className={`p-3 rounded-xl transition text-left cursor-pointer border ${
                  !notif.read
                    ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">{getNotifIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 text-[11px]">
                      <span className="font-bold text-black truncate">{notif.title}</span>
                      <span className="text-[10px] text-black font-mono font-semibold shrink-0">
                        {notif.timeAgo || 'Recently'}
                      </span>
                    </div>
                    <p className="text-xs text-black mt-1 leading-snug line-clamp-2 font-normal">
                      {notif.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="text-center py-6 text-xs text-black font-semibold">
                No active notifications
              </div>
            )}
          </div>
        </div>
      )}

      {/* FLOATING ACCOUNT MENU POPOVER (Fully Opaque Solid White for Easy Reading) */}
      {showUserDropdown && (
        <div
          ref={profileMenuRef}
          style={{
            position: 'fixed',
            top: `${profileCoords.top}px`,
            right: `${Math.max(16, profileCoords.right)}px`,
            zIndex: 9999
          }}
          className="w-80 bg-white rounded-2xl p-4 text-black animate-in fade-in zoom-in-95 border border-slate-300 shadow-2xl opacity-100"
        >
          {/* Authenticated Account Details Banner */}
          <div className="px-3.5 py-3 mb-3 bg-slate-100 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-xs ring-2 ring-white shrink-0"
              style={{ backgroundColor: currentUser.avatarBg || '#2563EB' }}
            >
              {currentUser.avatarText}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-black truncate">{currentUser.name}</div>
              <div className="text-xs text-blue-700 font-semibold truncate mt-0.5">{currentUser.roleTitle}</div>
              <div className="text-[11px] text-black font-medium mt-0.5 font-mono truncate">{currentUser.email}</div>
            </div>
          </div>

          <div className="text-[10px] font-bold text-black uppercase tracking-wider px-2 py-1">
            Switch Staff Profile (Authorized)
          </div>

          <div className="max-h-52 overflow-y-auto space-y-1 my-1 pr-0.5">
            {allUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  onSwitchUser(u.id);
                  setShowUserDropdown(false);
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-left text-xs transition cursor-pointer ${
                  u.id === currentUser.id
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-black hover:bg-slate-100 border border-transparent font-medium'
                }`}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ring-1 ring-white"
                  style={{ backgroundColor: u.avatarBg || '#2563EB' }}
                >
                  {u.avatarText}
                </div>
                <div className="truncate flex-1">
                  <div className={`truncate font-bold ${u.id === currentUser.id ? 'text-white' : 'text-black'}`}>{u.name}</div>
                  <div className={`text-[10px] truncate ${u.id === currentUser.id ? 'text-blue-100' : 'text-black'}`}>{u.roleTitle}</div>
                </div>
                {u.id === currentUser.id && (
                  <UserCheck className="w-3.5 h-3.5 text-white shrink-0" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-col gap-1">
            {onOpenChangePassword && (
              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  onOpenChangePassword();
                }}
                className="flex items-center gap-2 px-2.5 py-2 text-xs text-black hover:bg-slate-100 rounded-xl cursor-pointer font-bold transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Change Account Password</span>
              </button>
            )}

            <button
              onClick={() => {
                setShowUserDropdown(false);
                onOpenLanModal();
              }}
              className="flex items-center gap-2 px-2.5 py-2 text-xs text-black hover:bg-slate-100 rounded-xl cursor-pointer font-bold transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>LAN Connection Diagnostics</span>
            </button>

            {onLogout && (
              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  onLogout();
                }}
                className="flex items-center gap-2 px-2.5 py-2 text-xs text-rose-700 hover:bg-rose-50 rounded-xl cursor-pointer font-bold border-t border-slate-200 mt-1 pt-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="text-rose-700">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
