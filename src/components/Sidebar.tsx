import React, { useState } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Bookmark,
  Megaphone,
  ChevronUp,
  ChevronDown,
  Calendar,
  BarChart3,
  Shield,
  MessageSquare,
  Settings
} from 'lucide-react';
import { Conversation } from '../types.ts';

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
  recentConversations: Conversation[];
  onOpenConversation: (convId: string) => void;
  tasksCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  recentConversations,
  onOpenConversation,
  tasksCount
}) => {
  const [messagesExpanded, setMessagesExpanded] = useState(true);

  const navItems = [
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
      icon: Calendar
    },
    {
      id: 'messages' as ActiveTab,
      label: 'Messages',
      icon: MessageSquare
    },
    {
      id: 'saved' as ActiveTab,
      label: 'Announcements',
      icon: Megaphone
    },
    {
      id: 'libraries' as ActiveTab,
      label: 'Documents',
      icon: Bookmark
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Reports',
      icon: BarChart3
    },
    {
      id: 'admin' as ActiveTab,
      label: 'Administration',
      icon: Shield
    }
  ];

  return (
    <aside className="w-60 shrink-0 flex flex-col justify-between py-6 px-3.5 select-none border-r border-white/50 bg-white/[0.18] backdrop-blur-xl text-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.75)]">
      <div className="space-y-6">
        {/* Brand Logo & Authority Lockup */}
        <div className="px-2.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7738FF]/20 via-[#9A75FF]/10 to-transparent p-0.5 border border-white/80 shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
            <img
              src="/logo.jpg"
              alt="Ghana Youth Authority Logo"
              className="w-full h-full object-contain rounded-xl bg-white p-0.5"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-black tracking-tight text-sm leading-tight flex items-center gap-1.5">
              <span>HR Central</span>
            </div>
            <div className="text-[10px] text-black font-bold truncate tracking-wide">
              Ghana Youth Authority
            </div>
          </div>
        </div>

        {/* Navigation Section (Active pill matching screenshot) */}
        <div>
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`sidebar-nav-item w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-2xl transition-all cursor-pointer ${
                    isActive
                      ? 'glass-liquid-nav-active font-bold text-black scale-[1.02]'
                      : 'text-black hover:text-black hover:bg-white/80 border border-transparent hover:border-white/90'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="sidebar-icon-wrapper">
                      <Icon
                        className={`w-4 h-4 sidebar-icon-inflate transition-colors ${
                          isActive ? 'text-black drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-black'
                        }`}
                      />
                    </div>
                    <span className="text-black font-bold">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#7738FF]/20 border border-[#7738FF]/40 text-black text-[10px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RECENT MESSAGES EXPANDABLE SECTION */}
        <div className="pt-2">
          <button
            onClick={() => setMessagesExpanded(!messagesExpanded)}
            className="w-full flex items-center justify-between px-3 pb-2 text-[11px] font-bold text-black hover:text-black uppercase tracking-wider cursor-pointer"
          >
            <span className="text-black font-bold">Direct Channels</span>
            {messagesExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-black" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-black" />
            )}
          </button>

          {messagesExpanded && (
            <div className="space-y-1 px-1">
              {recentConversations.slice(0, 3).map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    onOpenConversation(conv.id);
                  }}
                  className="sidebar-nav-item w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/80 transition text-left cursor-pointer group border border-transparent hover:border-white/90"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-black shrink-0 shadow-xs ring-1 ring-white"
                    style={{ backgroundColor: conv.avatarBg || '#7738FF' }}
                  >
                    {conv.avatarText}
                  </div>
                  <span className="text-xs font-bold text-black group-hover:text-black truncate flex-1">
                    {conv.name}
                  </span>
                  {conv.unreadCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-[#7738FF] shadow-[0_0_6px_#7738FF] shrink-0"></span>
                  )}
                </button>
              ))}

              <button
                onClick={() => onSelectTab('messages')}
                className="sidebar-nav-item w-full flex items-center gap-2 px-2.5 py-2 text-[11px] font-bold text-black hover:text-black cursor-pointer transition-colors"
              >
                <div className="sidebar-icon-wrapper">
                  <MessageSquare className="w-3.5 h-3.5 sidebar-icon-inflate text-black" />
                </div>
                <span className="text-black font-bold">Open Messenger</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* LAN Server & Autonomous Mode Badge */}
      <div className="px-1 pt-4 border-t border-slate-300">
        <div className="p-3 rounded-2xl bg-white/70 border border-white/90 shadow-xs text-[11px] text-black">
          <div className="font-bold text-black flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse"></span>
            <span className="text-black font-bold">LAN Engine Active</span>
          </div>
          <div className="text-[10px] text-black font-bold mt-0.5">
            Offline Resilient Architecture
          </div>
        </div>
      </div>
    </aside>
  );
};
