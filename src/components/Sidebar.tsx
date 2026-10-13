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
  MessageSquare
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

  return (
    <aside className="w-56 shrink-0 flex flex-col justify-between py-6 px-4 select-none border-r border-slate-200 bg-white">
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="px-3 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white p-0.5 border border-slate-200 shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
            <img
              src="/logo.jpg"
              alt="Ghana Youth Authority Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback if image path has issue
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="font-extrabold text-slate-900 tracking-tight text-sm leading-tight">
              HR Central
            </div>
            <div className="text-[10px] text-slate-500 font-semibold truncate">
              Ghana Youth Authority
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div>
          <div className="space-y-1">
            {/* Dashboard Navigation Item */}
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-slate-100 font-bold text-slate-900 border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-slate-700" />
              <span>Dashboard</span>
            </button>

            {/* Tasks with emerald badge */}
            <button
              onClick={() => onSelectTab('tasks')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-slate-100 font-bold text-slate-900 border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4 text-slate-700" />
                <span>Tasks</span>
              </div>
              <span className="w-5 h-5 rounded-full bg-[#006b3f] text-white text-[11px] font-bold flex items-center justify-center">
                {tasksCount}
              </span>
            </button>

            {/* Libraries (Documents Repository) */}
            <button
              onClick={() => onSelectTab('libraries')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                activeTab === 'libraries'
                  ? 'bg-slate-100 font-bold text-slate-900 border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-4 h-4 text-slate-700" />
              <span>Libraries</span>
            </button>

            {/* Announcements */}
            <button
              onClick={() => onSelectTab('saved')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-slate-100 font-bold text-slate-900 border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Megaphone className="w-4 h-4 text-slate-700" />
              <span>Announcement</span>
            </button>

            {/* Meetings Calendar */}
            <button
              onClick={() => onSelectTab('meetings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                activeTab === 'meetings'
                  ? 'bg-slate-100 font-bold text-slate-900 border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4 text-slate-700" />
              <span>Meetings</span>
            </button>

            {/* Reports & Audit */}
            <button
              onClick={() => onSelectTab('reports')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-slate-100 font-bold text-slate-900 border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-slate-700" />
              <span>Reports</span>
            </button>

            {/* Admin & LAN Console */}
            <button
              onClick={() => onSelectTab('admin')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-slate-100 font-bold text-slate-900 border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Shield className="w-4 h-4 text-slate-700" />
              <span>Administration</span>
            </button>
          </div>
        </div>

        {/* RECENT MESSAGES SECTION */}
        <div className="pt-2">
          <button
            onClick={() => setMessagesExpanded(!messagesExpanded)}
            className="w-full flex items-center justify-between px-3 pb-2 text-xs font-bold text-slate-700 cursor-pointer"
          >
            <span>Messages</span>
            {messagesExpanded ? (
              <ChevronUp className="w-3 h-3 text-slate-400" />
            ) : (
              <ChevronDown className="w-3 h-3 text-slate-400" />
            )}
          </button>

          {messagesExpanded && (
            <div className="space-y-1.5 px-1">
              {recentConversations.slice(0, 3).map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    onOpenConversation(conv.id);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition text-left cursor-pointer group"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-2xs"
                    style={{ backgroundColor: conv.avatarBg }}
                  >
                    {conv.avatarText}
                  </div>
                  <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 truncate flex-1">
                    {conv.name}
                  </span>
                  {conv.unreadCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                  )}
                </button>
              ))}

              <button
                onClick={() => onSelectTab('messages')}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open Messenger</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* LAN Offline Badge */}
      <div className="px-3 pt-4 border-t border-slate-200">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            LAN Server Active
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Zero Internet Dependency
          </div>
        </div>
      </div>
    </aside>
  );
};
