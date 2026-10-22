import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Bookmark,
  Megaphone,
  Calendar,
  Shield,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { User } from '../types.ts';

export type ActiveTab =
  | 'dashboard'
  | 'activity'
  | 'statistic'
  | 'performance_cases'
  | 'tasks'
  | 'libraries'
  | 'saved'
  | 'messages'
  | 'meetings'
  | 'reports'
  | 'admin';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  tasksCount: number;
  documentsCount?: number;
  meetingsCount?: number;
  currentUser?: User;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  tasksCount,
  documentsCount,
  meetingsCount = 0,
  currentUser
}) => {
  const primaryNavItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'tasks' as ActiveTab,
      label: 'Tasks',
      icon: CheckSquare,
      badge: tasksCount > 0 ? tasksCount : undefined
    },
    {
      id: 'meetings' as ActiveTab,
      label: 'Meetings',
      icon: Calendar,
      badge: meetingsCount !== undefined ? meetingsCount : 0
    },
    {
      id: 'messages' as ActiveTab,
      label: 'Messages',
      icon: MessageSquare
    }
  ];

  const secondaryNavItems = [
    {
      id: 'saved' as ActiveTab,
      label: 'Announcements',
      icon: Megaphone
    },
    {
      id: 'libraries' as ActiveTab,
      label: 'Documents',
      icon: Bookmark,
      badge: documentsCount !== undefined && documentsCount > 0 ? documentsCount : undefined
    },
    {
      id: 'admin' as ActiveTab,
      label: 'Administration',
      icon: Shield
    }
  ];

  return (
    <aside className="w-56 sm:w-60 lg:w-64 shrink-0 h-full overflow-y-auto flex flex-col justify-between p-3 sm:p-3.5 select-none border-r border-white/50 bg-white/[0.18] backdrop-blur-xl text-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.75)]">
      {/* Top Branding & Navigation */}
      <div className="space-y-4">
        {/* Brand Logo & Authority Lockup */}
        <div className="px-1.5 py-1 flex items-center gap-2.5 pb-3 border-b border-white/40">
          <div className="w-8 h-8 rounded-xl bg-white/90 p-1 border border-white shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
            <img
              src="/logo.jpg"
              alt="Ghana Youth Authority Logo"
              className="w-full h-full object-contain rounded"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-black tracking-tight text-sm leading-tight flex items-center gap-1.5">
              <span>HR Central</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" title="System Online" />
            </div>
            <div className="text-[10px] text-slate-700 font-semibold truncate tracking-wide mt-0.5">
              Human Resource Dept
            </div>
          </div>
        </div>

        {/* Primary Workspace Navigation */}
        <div className="space-y-1.5">
          <div className="px-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
            Workspace
          </div>
          <div className="space-y-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`sidebar-nav-item w-full flex items-center justify-between px-3 py-2 text-xs sm:text-[13px] font-bold rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'glass-liquid-nav-active font-bold text-black shadow-xs'
                      : 'text-slate-800 hover:text-black hover:bg-white/80 border border-transparent hover:border-white/90'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="sidebar-icon-wrapper shrink-0">
                      <Icon
                        className={`w-4 h-4 sidebar-icon-inflate transition-colors ${
                          isActive ? 'text-black drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]' : 'text-slate-800'
                        }`}
                      />
                    </div>
                    <span className="text-black font-bold text-xs sm:text-[13px] truncate leading-none">
                      {item.label}
                    </span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="min-w-[18px] h-4.5 px-1.5 rounded-full bg-[#7738FF]/20 border border-[#7738FF]/40 text-black text-[10px] font-bold flex items-center justify-center tabular-nums shrink-0 ml-1">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Resources & Management Navigation */}
        <div className="space-y-1.5 pt-1">
          <div className="px-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
            Resources & System
          </div>
          <div className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`sidebar-nav-item w-full flex items-center justify-between px-3 py-2 text-xs sm:text-[13px] font-bold rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'glass-liquid-nav-active font-bold text-black shadow-xs'
                      : 'text-slate-800 hover:text-black hover:bg-white/80 border border-transparent hover:border-white/90'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="sidebar-icon-wrapper shrink-0">
                      <Icon
                        className={`w-4 h-4 sidebar-icon-inflate transition-colors ${
                          isActive ? 'text-black drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]' : 'text-slate-800'
                        }`}
                      />
                    </div>
                    <span className="text-black font-bold text-xs sm:text-[13px] truncate leading-none">
                      {item.label}
                    </span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="min-w-[18px] h-4.5 px-1.5 rounded-full bg-[#7738FF]/20 border border-[#7738FF]/40 text-black text-[10px] font-bold flex items-center justify-center tabular-nums shrink-0 ml-1">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Industrial Status & User Card */}
      <div className="pt-3 mt-4 border-t border-white/40 space-y-2">
        {currentUser && (
          <div className="p-2 sm:p-2.5 rounded-xl bg-white/60 border border-white/80 shadow-xs flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs ring-1 ring-white"
              style={{ backgroundColor: currentUser.avatarBg || '#7738FF' }}
            >
              {currentUser.avatarText || currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-black truncate leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-600 font-semibold truncate leading-tight mt-0.5">
                {currentUser.roleTitle || currentUser.role}
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Active Account" />
          </div>
        )}

        <div className="px-1 flex items-center justify-between text-[9.5px] font-semibold text-slate-500">
          <span>Ghana Youth Authority</span>
          <span className="tabular-nums">HRIS v2.4</span>
        </div>
      </div>
    </aside>
  );
};
