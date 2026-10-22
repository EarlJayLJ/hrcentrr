import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  UserCheck, 
  Shield, 
  KeyRound, 
  LogOut, 
  CheckCheck, 
  MessageSquare, 
  CheckSquare, 
  Calendar, 
  Megaphone, 
  AlertCircle,
  X,
  FileText,
  Briefcase,
  User as UserIcon,
  ArrowRight
} from 'lucide-react';
import { User, Announcement, NotificationItem, Task, DocumentItem, Meeting, CaseItem } from '../types.ts';

interface HeaderProps {
  currentUser: User;
  allUsers: User[];
  announcements: Announcement[];
  notifications: NotificationItem[];
  tasks?: Task[];
  documents?: DocumentItem[];
  meetings?: Meeting[];
  cases?: CaseItem[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectSearchResult?: (type: 'personnel' | 'task' | 'document' | 'meeting' | 'announcement' | 'case', item: any) => void;
  onSwitchUser?: (userId: string) => void;
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
  tasks = [],
  documents = [],
  meetings = [],
  cases = [],
  searchQuery,
  onSearchChange,
  onSelectSearchResult,
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
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Position coordinates for floating popovers
  const [profileCoords, setProfileCoords] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const [notifCoords, setNotifCoords] = useState<{ top: number; right: number }>({ top: 0, right: 0 });

  const profileBtnRef = useRef<HTMLButtonElement>(null);
  const notifBtnRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const unreadNotifications = notifications.filter(n => !n.read);

  // Filter Search Results across categories
  const trimmedQ = searchQuery.trim().toLowerCase();

  const matchingUsers = trimmedQ
    ? allUsers.filter(u => u.name.toLowerCase().includes(trimmedQ) || (u.roleTitle && u.roleTitle.toLowerCase().includes(trimmedQ)) || (u.email && u.email.toLowerCase().includes(trimmedQ)) || (u.department && u.department.toLowerCase().includes(trimmedQ)))
    : [];

  const matchingTasks = trimmedQ
    ? tasks.filter(t => t.title.toLowerCase().includes(trimmedQ) || (t.description && t.description.toLowerCase().includes(trimmedQ)) || (t.category && t.category.toLowerCase().includes(trimmedQ)) || (t.assigneeName && t.assigneeName.toLowerCase().includes(trimmedQ)))
    : [];

  const matchingDocuments = trimmedQ
    ? documents.filter(d => d.name.toLowerCase().includes(trimmedQ) || (d.category && d.category.toLowerCase().includes(trimmedQ)) || (d.folder && d.folder.toLowerCase().includes(trimmedQ)) || (d.uploadedBy && d.uploadedBy.toLowerCase().includes(trimmedQ)))
    : [];

  const matchingMeetings = trimmedQ
    ? meetings.filter(m => m.title.toLowerCase().includes(trimmedQ) || (m.description && m.description.toLowerCase().includes(trimmedQ)) || (m.location && m.location.toLowerCase().includes(trimmedQ)))
    : [];

  const matchingAnnouncements = trimmedQ
    ? announcements.filter(a => a.title.toLowerCase().includes(trimmedQ) || (a.content && a.content.toLowerCase().includes(trimmedQ)))
    : [];

  const matchingCases = trimmedQ
    ? cases.filter(c => c.name.toLowerCase().includes(trimmedQ) || c.caseNumber.toLowerCase().includes(trimmedQ) || (c.department && c.department.toLowerCase().includes(trimmedQ)))
    : [];

  const totalResultsCount =
    matchingUsers.length +
    matchingTasks.length +
    matchingDocuments.length +
    matchingMeetings.length +
    matchingAnnouncements.length +
    matchingCases.length;

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

      if (
        showSearchDropdown &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowUserDropdown(false);
        setShowNotifications(false);
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showUserDropdown, showNotifications, showSearchDropdown]);

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'MESSAGE':
        return <MessageSquare className="w-3.5 h-3.5 text-violet-500 shrink-0" />;
      case 'TASK_ASSIGNED':
      case 'TASK_UPDATED':
        return <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      case 'MEETING_REMINDER':
        return <Calendar className="w-3.5 h-3.5 text-sky-500 shrink-0" />;
      case 'ANNOUNCEMENT':
        return <Megaphone className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />;
    }
  };

  return (
    <header className="flex items-center justify-between gap-2 py-1.5 px-3 sm:px-4 border-b border-white/50 bg-white/[0.22] backdrop-blur-xl text-black select-none relative z-30 shadow-[0_4px_16px_rgba(15,23,42,0.02),inset_0_1px_1.5px_rgba(255,255,255,0.85)] shrink-0">
      {/* Window Controls (Red, Yellow, Green) */}
      <div className="flex items-center gap-1.5 mr-1 shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] shadow-[0_0_4px_rgba(255,95,86,0.4)] ring-1 ring-black/10 cursor-pointer"></span>
        <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] shadow-[0_0_4px_rgba(255,189,46,0.4)] ring-1 ring-black/10 cursor-pointer"></span>
        <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] shadow-[0_0_4px_rgba(39,201,63,0.4)] ring-1 ring-black/10 cursor-pointer"></span>
      </div>

      {/* Top Middle Header: Human Resource Department */}
      <div className="flex items-center justify-center gap-1.5 px-2.5 py-1 bg-white/85 rounded-lg border border-white/95 backdrop-blur-md shadow-xs shrink-0">
        <img
          src="/logo.jpg"
          alt="HR Logo"
          className="w-4 h-4 rounded-full object-contain bg-white p-0.5 shrink-0 shadow-xs"
        />
        <h1 className="tracking-wide text-black font-extrabold text-xs sm:text-sm leading-none whitespace-nowrap">
          Human Resource Department
        </h1>
      </div>

      {/* Interactive Live Search Bar with Dropdown - Visible & Responsive */}
      <div ref={searchContainerRef} className="relative flex-1 min-w-[130px] max-w-xs sm:max-w-sm mx-1 sm:mx-2">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#2563EB]" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onFocus={() => {
            if (searchQuery.trim().length > 0) setShowSearchDropdown(true);
          }}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setShowSearchDropdown(e.target.value.trim().length > 0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (matchingTasks.length > 0) {
                setShowSearchDropdown(false);
                onSelectSearchResult?.('task', matchingTasks[0]);
              } else if (matchingDocuments.length > 0) {
                setShowSearchDropdown(false);
                onSelectSearchResult?.('document', matchingDocuments[0]);
              } else if (matchingMeetings.length > 0) {
                setShowSearchDropdown(false);
                onSelectSearchResult?.('meeting', matchingMeetings[0]);
              } else if (matchingUsers.length > 0) {
                setShowSearchDropdown(false);
                onSelectSearchResult?.('personnel', matchingUsers[0]);
              } else if (matchingAnnouncements.length > 0) {
                setShowSearchDropdown(false);
                onSelectSearchResult?.('announcement', matchingAnnouncements[0]);
              }
            } else if (e.key === 'Escape') {
              setShowSearchDropdown(false);
            }
          }}
          placeholder="Search personnel, tasks, documents..."
          className="w-full pl-8 pr-7 py-1 bg-white/80 hover:bg-white/95 focus:bg-white text-black placeholder-slate-500 text-xs rounded-full border border-white/90 focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]/30 transition-all font-medium shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)]"
        />
        {searchQuery && (
          <button
            onClick={() => {
              onSearchChange('');
              setShowSearchDropdown(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-black cursor-pointer rounded-full hover:bg-slate-200/60 transition"
            title="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        {/* Floating Live Search Results Popover */}
        {showSearchDropdown && trimmedQ && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-200/90 p-2.5 max-h-[400px] overflow-y-auto z-50 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 px-1">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Live Search Results ({totalResultsCount})
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Esc to close
              </span>
            </div>

            {totalResultsCount === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 font-medium">
                No matching results found for &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              <div className="space-y-3">
                {/* 1. Personnel / Staff */}
                {matchingUsers.length > 0 && (
                  <div>
                    <div className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider px-2 py-0.5">
                      Personnel ({matchingUsers.length})
                    </div>
                    <div className="space-y-1 mt-1">
                      {matchingUsers.slice(0, 3).map((u) => (
                        <div
                          key={u.id}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            onSelectSearchResult?.('personnel', u);
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-blue-50/70 cursor-pointer transition group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                              style={{ backgroundColor: u.avatarBg || '#2563EB' }}
                            >
                              {u.avatarText || u.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-black group-hover:text-blue-700 truncate">
                                {u.name}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                {u.roleTitle} {u.department ? `· ${u.department}` : ''}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-blue-600 group-hover:underline shrink-0 ml-2">
                            Message
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Tasks */}
                {matchingTasks.length > 0 && (
                  <div>
                    <div className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider px-2 py-0.5">
                      Tasks ({matchingTasks.length})
                    </div>
                    <div className="space-y-1 mt-1">
                      {matchingTasks.slice(0, 3).map((t) => (
                        <div
                          key={t.id}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            onSelectSearchResult?.('task', t);
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50/70 cursor-pointer transition group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                              <CheckSquare className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-black group-hover:text-emerald-700 truncate">
                                {t.title}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                {t.dueDate ? `Due ${t.dueDate}` : 'Pending'} {t.assigneeName ? `· ${t.assigneeName}` : ''}
                              </div>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Documents */}
                {matchingDocuments.length > 0 && (
                  <div>
                    <div className="text-[10px] font-extrabold text-violet-600 uppercase tracking-wider px-2 py-0.5">
                      Documents ({matchingDocuments.length})
                    </div>
                    <div className="space-y-1 mt-1">
                      {matchingDocuments.slice(0, 3).map((d) => (
                        <div
                          key={d.id}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            onSelectSearchResult?.('document', d);
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-violet-50/70 cursor-pointer transition group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-black group-hover:text-violet-700 truncate">
                                {d.name}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                {d.category} · {d.fileSize} {d.uploadedBy ? `· by ${d.uploadedBy}` : ''}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-violet-600 group-hover:underline shrink-0 ml-2">
                            Open
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Meetings */}
                {matchingMeetings.length > 0 && (
                  <div>
                    <div className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider px-2 py-0.5">
                      Meetings ({matchingMeetings.length})
                    </div>
                    <div className="space-y-1 mt-1">
                      {matchingMeetings.slice(0, 3).map((m) => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            onSelectSearchResult?.('meeting', m);
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-amber-50/70 cursor-pointer transition group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                              <Calendar className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-black group-hover:text-amber-700 truncate">
                                {m.title}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                {m.startTime} - {m.endTime} {m.location ? `· ${m.location}` : ''}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-amber-600 group-hover:underline shrink-0 ml-2">
                            View
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Announcements */}
                {matchingAnnouncements.length > 0 && (
                  <div>
                    <div className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider px-2 py-0.5">
                      Announcements ({matchingAnnouncements.length})
                    </div>
                    <div className="space-y-1 mt-1">
                      {matchingAnnouncements.slice(0, 3).map((a) => (
                        <div
                          key={a.id}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            onSelectSearchResult?.('announcement', a);
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-rose-50/70 cursor-pointer transition group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                              <Megaphone className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-black group-hover:text-rose-700 truncate">
                                {a.title}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                {a.authorName} · {a.publishedAt}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-rose-600 group-hover:underline shrink-0 ml-2">
                            Read
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {totalResultsCount > 0 && (
              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Quick Jump:</span>
                <div className="flex items-center gap-1">
                  {matchingTasks.length > 0 && (
                    <button
                      onClick={() => {
                        setShowSearchDropdown(false);
                        onSelectSearchResult?.('task', matchingTasks[0]);
                      }}
                      className="px-1.5 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold cursor-pointer"
                    >
                      Tasks ({matchingTasks.length})
                    </button>
                  )}
                  {matchingDocuments.length > 0 && (
                    <button
                      onClick={() => {
                        setShowSearchDropdown(false);
                        onSelectSearchResult?.('document', matchingDocuments[0]);
                      }}
                      className="px-1.5 py-0.5 rounded bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold cursor-pointer"
                    >
                      Docs ({matchingDocuments.length})
                    </button>
                  )}
                  {matchingMeetings.length > 0 && (
                    <button
                      onClick={() => {
                        setShowSearchDropdown(false);
                        onSelectSearchResult?.('meeting', matchingMeetings[0]);
                      }}
                      className="px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold cursor-pointer"
                    >
                      Meetings ({matchingMeetings.length})
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls Zone */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Notifications Control Button */}
        <div>
          <button
            ref={notifBtnRef}
            onClick={toggleNotifDropdown}
            className={`relative p-1.5 text-black hover:text-black rounded-lg transition cursor-pointer ${
              showNotifications ? 'bg-white/90 text-black ring-1 ring-[#7738FF]/30' : 'hover:bg-white/70'
            }`}
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-black" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-0 right-0 px-1 bg-[#7738FF] text-white text-[9px] font-bold rounded-full ring-1 ring-white shadow-xs min-w-[14px] text-center leading-tight">
                {unreadNotifications.length}
              </span>
            )}
          </button>
        </div>

        {/* Current User Profile Control Button */}
        <div>
          <button
            ref={profileBtnRef}
            onClick={toggleProfileDropdown}
            className={`flex items-center gap-1.5 text-left px-2 py-1 rounded-lg border transition cursor-pointer shadow-xs ${
              showUserDropdown
                ? 'bg-[#1D4ED8] border-white text-white ring-2 ring-blue-300'
                : 'bg-[#2563EB] hover:bg-[#1D4ED8] border-blue-400/60 text-white'
            }`}
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[9.5px] text-blue-100 font-medium leading-none">
                {currentUser.roleTitle}
              </div>
            </div>
            
            {/* Avatar circle */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-xs ring-1 ring-white/80 overflow-hidden shrink-0"
              style={{ backgroundColor: currentUser.avatarBg || '#1E40AF' }}
            >
              {currentUser.avatarText}
            </div>

            <ChevronDown className={`w-3 h-3 text-white transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
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

      {/* FLOATING ACCOUNT MENU POPOVER (Solid White) */}
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
          <div className="px-3.5 py-3 mb-2 bg-slate-100 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
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

          <div className="flex flex-col gap-1 pt-1">
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
