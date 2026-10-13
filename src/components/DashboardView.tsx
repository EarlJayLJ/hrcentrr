import React, { useState } from 'react';
import {
  Calendar,
  FileText,
  CheckSquare,
  Megaphone,
  MessageSquare,
  Download,
  Activity,
  Pin,
  Clock,
  ChevronRight,
  Check,
  MapPin,
  Users
} from 'lucide-react';
import { DashboardData, User, DocumentItem, Announcement, AuditLog, Task, Meeting } from '../types.ts';

interface DashboardViewProps {
  data: DashboardData;
  currentUser: User;
  tasks?: Task[];
  meetings?: Meeting[];
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
  onOpenMessages,
  onOpenTasks,
  onOpenMeetings,
  onOpenDocuments,
  onOpenAnnouncements,
  onDownloadAttachment,
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
  const myTasks = tasks.filter((t) => t.isMyTask);
  const unreadCount = data.stats?.unreadMessagesCount ?? 0;
  const totalTasksCount = tasks.length > 0 ? tasks.length : data.stats?.newTasksCount ?? 0;
  const upcomingMeetingsCount = meetings.length > 0 ? meetings.length : (data.upcomingMeetingsCount ?? 0);

  return (
    <div className="space-y-4">
      {/* 1. TOP STATS ROW (3 CARDS) matching reference layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Hello User Welcome Section */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-xs"
              style={{ backgroundColor: currentUser.avatarBg || '#10b981' }}
            >
              {currentUser.avatarText || 'GK'}
            </div>
            {unreadCount > 0 ? (
              <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full border border-red-200">
                {unreadCount} unread
              </span>
            ) : (
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                All caught up
              </span>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 leading-snug">
              Hello {currentUser.name.split(' ')[0]}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {pendingTasks.length > 0
                ? `${pendingTasks.length} active tasks · ${upcomingMeetingsCount} upcoming meetings`
                : 'All departmental workflows up to date'}
            </p>
          </div>
        </div>

        {/* Card 2: Scheduled Meetings Stat */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-700">
            Scheduled meetings
          </h3>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {upcomingMeetingsCount}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Upcoming sessions</span>
            <div className="flex items-center gap-2">
              <svg className="w-14 h-5" viewBox="0 0 60 20" fill="none">
                <path
                  d="M2 16L15 14L28 8L42 11L58 3"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-bold text-emerald-600 text-xs tabular-nums">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Assigned Tasks Stat */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-700">
            Assigned tasks
          </h3>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {totalTasksCount}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>{completedTasks.length} completed</span>
            <div className="flex items-center gap-2">
              <svg className="w-14 h-5" viewBox="0 0 60 20" fill="none">
                <path
                  d="M2 12L12 8L22 15L32 6L44 14L58 10"
                  stroke="#006b3f"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-bold text-emerald-700 text-xs tabular-nums">
                {pendingTasks.length} pending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-slate-700 shrink-0 pl-1">
          Quick actions:
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onQuickAction?.('task')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Create Task</span>
          </button>
          <button
            onClick={() => onQuickAction?.('meeting')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Schedule Meeting</span>
          </button>
          <button
            onClick={() => onQuickAction?.('document')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            <span>Upload Document</span>
          </button>
          <button
            onClick={() => onQuickAction?.('announcement')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition cursor-pointer"
          >
            <Megaphone className="w-3.5 h-3.5 text-emerald-700" />
            <span>Publish Notice</span>
          </button>
          <button
            onClick={() => onQuickAction?.('message')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-pink-600" />
            <span>Compose Message</span>
          </button>
        </div>
      </div>

      {/* 2. ASSIGNED TASKS AND TASK STATUSES CARD */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-800">
              Assigned tasks & workflow status
            </h3>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {pendingTasks.length} pending
            </span>
          </div>
          <button
            onClick={onOpenTasks}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 font-medium transition cursor-pointer"
          >
            <span>Full list</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {tasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 text-[11px] border-b border-slate-100">
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
              <tbody className="divide-y divide-slate-100">
                {tasks.slice(0, 6).map((task) => {
                  const isSelected = selectedTaskIds.includes(task.id);
                  return (
                    <tr key={task.id} className="hover:bg-slate-50 transition">
                      <td className="py-3">
                        <button
                          onClick={() => toggleSelectTask(task.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-300 hover:border-slate-400'
                          }`}
                          aria-label="Select task"
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      </td>

                      <td className="py-3 font-semibold text-slate-800 pr-3">
                        <div className="max-w-[240px] truncate" title={task.title}>
                          {task.title}
                        </div>
                      </td>

                      <td className="py-3 text-slate-500 whitespace-nowrap">
                        {task.category || 'Human Resources'}
                      </td>

                      <td className="py-3 text-slate-500 whitespace-nowrap">
                        {task.dueDate}
                      </td>

                      <td className="py-3">
                        {task.priority === 'Low' ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-emerald-700 border border-emerald-300 bg-emerald-50">
                            Low
                          </span>
                        ) : task.priority === 'Medium' ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-emerald-800 border border-emerald-300 bg-emerald-50">
                            Medium
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-red-700 border border-red-300 bg-red-50">
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
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : task.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                          title="Click to toggle status"
                        >
                          {task.status.replace('_', ' ')}
                        </button>
                      </td>

                      <td className="py-3 text-right pr-2">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <span className="text-[11px] text-slate-500 hidden sm:inline">
                            {task.assigneeName}
                          </span>
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-2xs"
                            style={{ backgroundColor: '#006b3f' }}
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
          <div className="text-center py-8 text-xs text-slate-400">
            No pending tasks assigned
          </div>
        )}
      </div>

      {/* 3. COMMUNICATION CARD */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-800">
              Communication (Last 7 days)
            </h3>
            {unreadCount > 0 ? (
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
            ) : null}
          </div>
          <button
            onClick={onOpenMessages}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 font-medium transition cursor-pointer"
          >
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {data.recentMessages && data.recentMessages.length > 0 ? (
          <div className="space-y-2 text-xs">
            {data.recentMessages.slice(0, 3).map((msg) => (
              <div
                key={msg.id}
                onClick={onOpenMessages}
                className="group cursor-pointer hover:bg-slate-50 p-2.5 rounded-xl transition border border-transparent hover:border-slate-100"
              >
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="group-hover:text-emerald-700 transition">
                    {msg.senderName}
                  </span>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] font-normal">
                    <span>{msg.timeAgo}</span>
                    {msg.unread && (
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    )}
                  </div>
                </div>
                <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">
                  {msg.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400">
            No recent communications recorded
          </div>
        )}
      </div>

      {/* 4. RECENTLY UPLOADED DOCUMENTS & PUBLISHED ANNOUNCEMENTS (2 COLUMNS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card: Recently uploaded documents */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800">
              Recently uploaded documents
            </h3>
            <button
              onClick={onOpenDocuments}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 font-medium transition cursor-pointer"
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
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-800 text-[11px] truncate" title={doc.name}>
                        {doc.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {doc.uploadedBy} · {doc.fileSize}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onDownloadAttachment(doc.name)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition cursor-pointer"
                    title="Download document"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              No documents recently uploaded
            </div>
          )}
        </div>

        {/* Card: Published announcements */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800">
              Published announcements
            </h3>
            <button
              onClick={onOpenAnnouncements}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 font-medium transition cursor-pointer"
            >
              <span>All notices</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {data.recentAnnouncements && data.recentAnnouncements.length > 0 ? (
            <div className="space-y-2 text-xs">
              {data.recentAnnouncements.map((ann) => {
                const isAck = ann.acknowledgedBy.includes(currentUser.id);
                return (
                  <div
                    key={ann.id}
                    className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-100/70 transition space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {ann.pinned && <Pin className="w-3 h-3 text-emerald-700 rotate-45" />}
                        <span className="font-bold text-slate-800 text-[11px] truncate max-w-[180px]">
                          {ann.title}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          ann.priority === 'High'
                            ? 'bg-red-100 text-red-700'
                            : ann.priority === 'Medium'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {ann.priority}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1">
                      {ann.content}
                    </p>
                    <div className="flex items-center justify-between pt-0.5 text-[9px] text-slate-400">
                      <span>{ann.publishedAt}</span>
                      <button
                        onClick={() => onAcknowledgeAnnouncement?.(ann.id)}
                        className={`font-semibold cursor-pointer ${
                          isAck ? 'text-emerald-600' : 'text-emerald-700 hover:text-emerald-800'
                        }`}
                      >
                        {isAck ? 'Acknowledged' : 'Acknowledge notice'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              No active announcements published
            </div>
          )}
        </div>
      </div>

      {/* 5. UPCOMING MEETINGS & SCHEDULE CARD */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-800">
              Upcoming meetings & calendar
            </h3>
          </div>
          <button
            onClick={onOpenMeetings}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 font-medium transition cursor-pointer"
          >
            <span>Open calendar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {meetings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {meetings.slice(0, 3).map((meeting) => (
              <div
                key={meeting.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100/60 transition flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold text-emerald-700">{meeting.dayLabel || meeting.date}</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      {meeting.startTime} - {meeting.endTime}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-xs line-clamp-1" title={meeting.title}>
                    {meeting.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {meeting.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-[120px]">{meeting.location}</span>
                  </span>
                  <span className="font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md border border-emerald-200">
                    {meeting.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400">
            No upcoming meetings scheduled
          </div>
        )}
      </div>

      {/* 6. RECENT ACTIVITY RELEVANT TO USER */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-800">
              Recent activity relevant to you
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            Live operational audit
          </span>
        </div>

        {data.recentActivity && data.recentActivity.length > 0 ? (
          <div className="space-y-2 text-xs">
            {data.recentActivity.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>
                  <span className="font-semibold text-slate-800 text-[11px] truncate">
                    {log.actor}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {log.action.replace(/_/g, ' ').toLowerCase()}
                  </span>
                  <span className="font-medium text-slate-700 text-[11px] truncate max-w-[200px]">
                    {log.target}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 tabular-nums shrink-0 ml-2">
                  {log.timestamp.includes('T') ? log.timestamp.split('T')[1].slice(0, 5) : log.timestamp}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-slate-400">
            No recent operational activity recorded
          </div>
        )}
      </div>
    </div>
  );
};
