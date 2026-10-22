import React, { useState } from 'react';
import {
  Calendar,
  FileText,
  CheckSquare,
  Megaphone,
  MessageSquare,
  Activity,
  Clock,
  ChevronRight,
  Check,
  MapPin,
  BarChart3,
  Plus
} from 'lucide-react';
import { DashboardData, User, Task, Meeting } from '../types.ts';

interface DashboardViewProps {
  data: DashboardData;
  currentUser: User;
  tasks?: Task[];
  meetings?: Meeting[];
  searchQuery?: string;
  onOpenMessages: () => void;
  onOpenTasks?: () => void;
  onOpenMeetings?: () => void;
  onOpenDocuments?: () => void;
  onOpenAnnouncements?: () => void;
  onDownloadAttachment: (attachmentName: string) => void;
  onQuickAction?: (action: 'meeting' | 'task' | 'document' | 'announcement' | 'message') => void;
  onAcknowledgeAnnouncement?: (id: string) => void;
  onUpdateTaskStatus?: (taskId: string, status: Task['status']) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  currentUser,
  tasks = [],
  meetings = [],
  searchQuery = '',
  onOpenMessages,
  onOpenTasks,
  onOpenMeetings,
  onOpenDocuments,
  onOpenAnnouncements,
  onQuickAction,
  onAcknowledgeAnnouncement,
  onUpdateTaskStatus
}) => {
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const toggleSelectTask = (id: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Derive counts from DB state
  const pendingTasks = tasks.filter((t) => t.status !== 'COMPLETED');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');
  const unreadCount = data.stats?.unreadMessagesCount ?? 0;
  const totalTasksCount = tasks.length > 0 ? tasks.length : (data.stats?.newTasksCount ?? 0);
  const upcomingMeetingsCount = Array.isArray(meetings) ? meetings.length : (data.stats?.upcomingMeetingsCount ?? 0);
  const progressPct = totalTasksCount > 0 ? Math.round((completedTasks.length / totalTasksCount) * 100) : 0;

  return (
    <div className="space-y-4 select-none text-black">
      {/* 1. WELCOME HEADER */}
      <div className="flex items-center justify-between pb-0.5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight leading-tight">
            Welcome back, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 font-medium mt-0.5">
            Human Resource Directorate Operations Dashboard
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/40 shadow-xs cursor-pointer hover:ring-[#7738FF]/60 transition"
            style={{ backgroundColor: currentUser.avatarBg || '#7738FF' }}
            title={currentUser.name}
          >
            {currentUser.avatarText || 'EE'}
          </div>
        </div>
      </div>

      {/* 2. THREE STAT TILES (Tasks, Meetings, Progress) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Tile 1: Tasks */}
        <div 
          onClick={onOpenTasks}
          className="glass-liquid-tile glass-card-hover p-3.5 sm:p-4 rounded-xl cursor-pointer flex flex-col justify-between space-y-2.5 border border-white/80 shadow-[0_6px_20px_rgba(15,23,42,0.04),inset_0_1px_1.5px_rgba(255,255,255,0.95)]"
        >
          <div className="w-8 h-8 rounded-lg bg-[#7738FF]/10 border border-[#7738FF]/30 flex items-center justify-center text-[#7738FF] shadow-xs">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-black tabular-nums tracking-tight">
              {totalTasksCount}
            </div>
            <div className="text-xs sm:text-sm text-slate-800 font-bold mt-0.5">
              Active Tasks
            </div>
          </div>
        </div>

        {/* Tile 2: Meetings (Guaranteed 0 when none scheduled) */}
        <div 
          onClick={onOpenMeetings}
          className="glass-liquid-tile glass-card-hover p-3.5 sm:p-4 rounded-xl cursor-pointer flex flex-col justify-between space-y-2.5 border border-white/80 shadow-[0_6px_20px_rgba(15,23,42,0.04),inset_0_1px_1.5px_rgba(255,255,255,0.95)]"
        >
          <div className="w-8 h-8 rounded-lg bg-[#7738FF]/10 border border-[#7738FF]/30 flex items-center justify-center text-[#7738FF] shadow-xs">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-black tabular-nums tracking-tight">
              {upcomingMeetingsCount}
            </div>
            <div className="text-xs sm:text-sm text-slate-800 font-bold mt-0.5">
              Meetings
            </div>
          </div>
        </div>

        {/* Tile 3: Progress */}
        <div 
          onClick={onOpenTasks}
          className="glass-liquid-tile glass-card-hover p-3.5 sm:p-4 rounded-xl cursor-pointer flex flex-col justify-between space-y-2.5 border border-white/80 shadow-[0_6px_20px_rgba(15,23,42,0.04),inset_0_1px_1.5px_rgba(255,255,255,0.95)]"
        >
          <div className="w-8 h-8 rounded-lg bg-[#7738FF]/10 border border-[#7738FF]/30 flex items-center justify-center text-[#7738FF] shadow-xs">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-black tabular-nums tracking-tight">
              {progressPct}%
            </div>
            <div className="text-xs sm:text-sm text-slate-800 font-bold mt-0.5">
              Resolution Rate
            </div>
          </div>
        </div>
      </div>

      {/* 3. UPCOMING MEETINGS & DEADLINES SECTION */}
      <div className="glass-liquid-tile p-4 sm:p-5 rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.05),inset_0_1px_1.5px_rgba(255,255,255,0.95)] space-y-3">
        <div className="flex items-center justify-between pb-0.5">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm sm:text-base font-extrabold text-black tracking-wide">
              Directorate Calendar & Upcoming Deadlines
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#7738FF]/15 border border-[#7738FF]/30 text-black tabular-nums">
              {meetings.length === 0 ? '0 Scheduled' : `${meetings.length} Scheduled`}
            </span>
          </div>
          <span className="text-[11px] sm:text-xs text-slate-700 font-semibold">
            Live Synchronized
          </span>
        </div>

        {/* Meetings sub-block */}
        {meetings.length > 0 ? (
          <div className="space-y-2">
            {meetings.slice(0, 3).map((m) => (
              <div
                key={m.id}
                onClick={onOpenMeetings}
                className="glass-liquid-pill p-3 rounded-xl flex items-center justify-between cursor-pointer group border border-white/80 hover:border-[#9A75FF]/45 hover:bg-white/80 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#7738FF]/15 border border-[#7738FF]/30 flex items-center justify-center text-[#7738FF] shrink-0 shadow-xs">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#7738FF] bg-[#7738FF]/20 px-1.5 py-0.2 rounded">
                        Meeting
                      </span>
                      <div className="text-xs sm:text-sm font-bold text-black group-hover:text-[#7738FF] transition truncate">
                        {m.title}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5 font-mono font-medium">
                      {m.startTime} - {m.endTime} {m.location ? `· ${m.location}` : ''}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-black group-hover:text-black group-hover:translate-x-0.5 transition shrink-0 ml-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/40 border border-white/60">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-700 font-semibold">
                No upcoming meetings.
              </span>
            </div>
            <button
              onClick={onOpenMeetings}
              className="text-xs font-bold text-[#7738FF] hover:underline cursor-pointer"
            >
              Open Calendar
            </button>
          </div>
        )}

        {/* Pending tasks deadlines */}
        {pendingTasks.length > 0 && (
          <div className="space-y-1.5 pt-1.5 border-t border-slate-200/60">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Pending Task Deadlines ({pendingTasks.length})
            </div>
            <div className="space-y-1.5">
              {pendingTasks.slice(0, 2).map((t) => (
                <div
                  key={t.id}
                  onClick={onOpenTasks}
                  className="glass-liquid-pill p-2.5 rounded-xl flex items-center justify-between cursor-pointer group border border-white/80 hover:bg-white/80 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shrink-0">
                      <CheckSquare className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-black group-hover:text-[#7738FF] transition truncate">
                        {t.title}
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium">
                        {t.dueDate ? `Due ${t.dueDate}` : 'Pending review'} · Assigned to {t.assigneeName || 'Staff'}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-black transition shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Glowing + New Task Action Button */}
        <button
          onClick={() => onQuickAction?.('task')}
          className="w-full mt-1.5 py-2.5 rounded-xl glass-liquid-cta font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer text-black shadow-[0_4px_20px_rgba(119,56,255,0.4),inset_0_1px_1px_rgba(255,255,255,0.45)] border border-white/30 hover:scale-[1.006] transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Task</span>
        </button>
      </div>



      {/* 4. QUICK ACTIONS STRIP */}
      <div className="glass-liquid-tile p-4 rounded-2xl flex items-center justify-between gap-3 overflow-x-auto border border-white/80 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
        <span className="text-sm font-bold text-black uppercase tracking-wider shrink-0 pl-1">
          Directorate Shortcuts:
        </span>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onQuickAction?.('meeting')}
            className="flex items-center gap-2 px-3.5 py-2 glass-liquid-pill rounded-xl text-sm font-semibold text-black hover:bg-white/80 transition cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-sky-500" />
            <span>Schedule Meeting</span>
          </button>
          <button
            onClick={() => onQuickAction?.('document')}
            className="flex items-center gap-2 px-3.5 py-2 glass-liquid-pill rounded-xl text-sm font-semibold text-black hover:bg-white/80 transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#7738FF]" />
            <span>Upload Document</span>
          </button>
          <button
            onClick={() => onQuickAction?.('announcement')}
            className="flex items-center gap-2 px-3.5 py-2 glass-liquid-pill rounded-xl text-sm font-semibold text-black hover:bg-white/80 transition cursor-pointer"
          >
            <Megaphone className="w-4 h-4 text-emerald-500" />
            <span>Publish Notice</span>
          </button>
          <button
            onClick={() => onQuickAction?.('message')}
            className="flex items-center gap-2 px-3.5 py-2 glass-liquid-pill rounded-xl text-sm font-semibold text-black hover:bg-white/80 transition cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-[#9A75FF]" />
            <span>Compose Message</span>
          </button>
        </div>
      </div>

      {/* 5. ASSIGNED TASKS AND TASK STATUSES TABLE */}
      <div className="glass-liquid-tile p-5 rounded-2xl space-y-4 border border-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.05),inset_0_1.5px_2px_rgba(255,255,255,0.95)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider">
              Assigned Tasks & Workflow Status
            </h3>
            <span className="text-[11px] font-semibold text-[#7738FF] bg-[#7738FF]/20 px-2.5 py-0.5 rounded-full border border-[#7738FF]/40">
              {pendingTasks.length} pending
            </span>
          </div>
          <button
            onClick={onOpenTasks}
            className="flex items-center gap-1 text-xs text-black hover:text-[#7738FF] font-medium transition cursor-pointer"
          >
            <span>Full List</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {tasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-black text-[11px] border-b border-slate-200/80">
                  <th className="pb-2 font-normal w-8">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="pb-2 font-normal">Task Title</th>
                  <th className="pb-2 font-normal">Category</th>
                  <th className="pb-2 font-normal">Deadline</th>
                  <th className="pb-2 font-normal">Priority</th>
                  <th className="pb-2 font-normal">Status</th>
                  <th className="pb-2 font-normal text-right pr-2">Assignee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60">
                {tasks.slice(0, 6).map((task) => {
                  const isSelected = selectedTaskIds.includes(task.id);
                  return (
                    <tr key={task.id} className="hover:bg-white/60 transition">
                      <td className="py-3">
                        <button
                          onClick={() => toggleSelectTask(task.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#7738FF] border-[#9A75FF] text-black shadow-xs'
                              : 'border-white/20 hover:border-[#7738FF]'
                          }`}
                          aria-label="Select task"
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      </td>

                      <td className="py-3 font-semibold text-black pr-3">
                        <div className="max-w-[240px] truncate" title={task.title}>
                          {task.title}
                        </div>
                      </td>

                      <td className="py-3 text-black whitespace-nowrap">
                        {task.category || 'Human Resources'}
                      </td>

                      <td className="py-3 text-black whitespace-nowrap font-mono tabular-nums">
                        {task.dueDate}
                      </td>

                      <td className="py-3">
                        {task.priority === 'Low' ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-emerald-300 border border-emerald-500/30 bg-emerald-500/15">
                            Low
                          </span>
                        ) : task.priority === 'Medium' ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-amber-300 border border-amber-500/30 bg-amber-500/15">
                            Medium
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-rose-300 border border-rose-500/30 bg-rose-500/15">
                            {task.priority}
                          </span>
                        )}
                      </td>

                      <td className="py-3">
                        <button
                          onClick={() => {
                            if (onUpdateTaskStatus) {
                              const nextStatus =
                                task.status === 'COMPLETED'
                                  ? 'IN_PROGRESS'
                                  : task.status === 'IN_PROGRESS'
                                  ? 'COMPLETED'
                                  : 'IN_PROGRESS';
                              onUpdateTaskStatus(task.id, nextStatus);
                            }
                          }}
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition ${
                            task.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                              : task.status === 'IN_PROGRESS'
                              ? 'bg-[#7738FF]/20 text-[#7738FF] border border-[#7738FF]/40'
                              : 'bg-white/[0.05] text-black border border-slate-200/80'
                          }`}
                          title="Click to toggle status"
                        >
                          {task.status.replace('_', ' ')}
                        </button>
                      </td>

                      <td className="py-3 text-right pr-2">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <span className="text-[11px] text-black hidden sm:inline">
                            {task.assigneeName}
                          </span>
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-black text-[10px] font-bold shadow-xs ring-1 ring-white/20"
                            style={{ backgroundColor: '#7738FF' }}
                            title={`Assignee: ${task.assigneeName}`}
                          >
                            {task.assigneeName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-500 font-medium">
            No assigned tasks.
          </div>
        )}
      </div>

      {/* 6. COMMUNICATION CARD */}
      <div className="glass-liquid-tile p-5 rounded-2xl space-y-3 border border-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.05),inset_0_1.5px_2px_rgba(255,255,255,0.95)]">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider">
              Communication (Last 7 Days)
            </h3>
            {unreadCount > 0 ? (
              <span className="w-2 h-2 rounded-full bg-[#7738FF] shadow-[0_0_8px_#7738FF]"></span>
            ) : null}
          </div>
          <button
            onClick={onOpenMessages}
            className="flex items-center gap-1 text-xs text-black hover:text-[#7738FF] font-medium transition cursor-pointer"
          >
            <span>See All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {data.recentMessages && data.recentMessages.length > 0 ? (
          <div className="space-y-2 text-xs">
            {data.recentMessages.slice(0, 3).map((msg) => (
              <div
                key={msg.id}
                onClick={onOpenMessages}
                className="group cursor-pointer glass-liquid-pill p-3 rounded-xl transition"
              >
                <div className="flex items-center justify-between font-bold text-black">
                  <span className="group-hover:text-[#7738FF] transition">
                    {msg.senderName}
                  </span>
                  <div className="flex items-center gap-2 text-black text-[11px] font-normal">
                    <span className="font-mono">{msg.timeAgo}</span>
                    {msg.unread && (
                      <span className="w-2 h-2 rounded-full bg-[#7738FF] shadow-[0_0_8px_#7738FF]"></span>
                    )}
                  </div>
                </div>
                <p className="text-black text-[11px] line-clamp-1 mt-1">
                  {msg.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-500 font-medium">
            No conversations yet.
          </div>
        )}
      </div>

      {/* 7. RECENTLY UPLOADED DOCUMENTS & PUBLISHED ANNOUNCEMENTS (2 COLUMNS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card: Recently uploaded documents */}
        <div className="glass-liquid-tile p-5 rounded-2xl space-y-3 border border-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.05),inset_0_1.5px_2px_rgba(255,255,255,0.95)]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider">
              Recently Uploaded Documents
            </h3>
            <button
              onClick={onOpenDocuments}
              className="flex items-center gap-1 text-xs text-black hover:text-[#7738FF] font-medium transition cursor-pointer"
            >
              <span>Repository</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {data.recentDocuments && data.recentDocuments.length > 0 ? (
            <div className="space-y-2 text-xs">
              {data.recentDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2.5 rounded-xl glass-liquid-pill transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <FileText className="w-4 h-4 text-[#7738FF] shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-black text-[11px] truncate" title={doc.name}>
                        {doc.name}
                      </div>
                      <div className="text-[10px] text-black">
                        {doc.uploadedBy} · {doc.fileSize}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-500 font-medium">
              No recent documents.
            </div>
          )}
        </div>

        {/* Card: Published Announcements */}
        <div className="glass-liquid-tile p-5 rounded-2xl space-y-3 border border-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.05),inset_0_1.5px_2px_rgba(255,255,255,0.95)]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider">
              Directorate Notices
            </h3>
            <button
              onClick={onOpenAnnouncements}
              className="flex items-center gap-1 text-xs text-black hover:text-[#7738FF] font-medium transition cursor-pointer"
            >
              <span>Notices</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {data.recentAnnouncements && data.recentAnnouncements.length > 0 ? (
            <div className="space-y-2.5 text-xs">
              {data.recentAnnouncements.map((ann) => {
                const isAck = ann.acknowledgedBy?.includes(currentUser.id);
                return (
                  <div
                    key={ann.id}
                    className="p-3 rounded-xl glass-liquid-pill space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-black text-[11px] truncate">
                        {ann.title}
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          ann.priority === 'High'
                            ? 'bg-rose-50 text-rose-700 border border-rose-300'
                            : ann.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-300'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        }`}
                      >
                        {ann.priority}
                      </span>
                    </div>
                    <p className="text-[10px] text-black line-clamp-1">
                      {ann.content}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 text-[10px] text-black">
                      <span className="font-mono">{ann.publishedAt}</span>
                      <button
                        onClick={() => onAcknowledgeAnnouncement?.(ann.id)}
                        className={`font-semibold cursor-pointer ${
                          isAck ? 'text-emerald-400' : 'text-[#7738FF] hover:text-black'
                        }`}
                      >
                        {isAck ? 'Acknowledged' : 'Acknowledge Notice'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-500 font-medium">
              No announcements available.
            </div>
          )}
        </div>
      </div>

      {/* 8. RECENT OPERATIONAL AUDIT */}
      <div className="glass-liquid-tile p-5 rounded-2xl space-y-3 border border-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.05),inset_0_1.5px_2px_rgba(255,255,255,0.95)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#7738FF]" />
            <h3 className="text-xs font-bold text-black uppercase tracking-wider">
              Recent Activity Relevant to You
            </h3>
          </div>
          <span className="text-[10px] text-black font-medium">
            Live Operational Audit
          </span>
        </div>

        {data.recentActivity && data.recentActivity.length > 0 ? (
          <div className="space-y-2 text-xs">
            {data.recentActivity.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-2.5 rounded-xl glass-liquid-pill transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7738FF] shadow-[0_0_8px_#7738FF] shrink-0"></span>
                  <span className="font-semibold text-black text-[11px] truncate">
                    {log.actor}
                  </span>
                  <span className="text-black text-[11px]">
                    {log.action.replace(/_/g, ' ').toLowerCase()}
                  </span>
                  <span className="font-medium text-[#7738FF] text-[11px] truncate max-w-[200px]">
                    {log.target}
                  </span>
                </div>
                <div className="text-[10px] text-black tabular-nums font-mono shrink-0 ml-2">
                  {log.timestamp.includes('T') ? log.timestamp.split('T')[1].slice(0, 5) : log.timestamp}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-black">
            No recent operational activity recorded
          </div>
        )}
      </div>
    </div>
  );
};
