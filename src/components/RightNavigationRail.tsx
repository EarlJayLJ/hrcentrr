import React from 'react';
import { Plus, Calendar as CalendarIcon, CheckSquare, Users, CheckCircle2, Clock } from 'lucide-react';
import { Meeting, Task } from '../types.ts';

interface RightNavigationRailProps {
  meetings: Meeting[];
  myTasks: Task[];
  tasksAssignedToOthers: Task[];
  canAssignToOthers?: boolean;
  onAddMeeting: () => void;
  onAddMyTask: () => void;
  onAddTaskToOthers: () => void;
  onToggleTaskStatus: (taskId: string, currentStatus: Task['status']) => void;
  onViewMeetings?: () => void;
  onViewTasks?: () => void;
}

export const RightNavigationRail: React.FC<RightNavigationRailProps> = ({
  meetings,
  myTasks,
  tasksAssignedToOthers,
  canAssignToOthers = false,
  onAddMeeting,
  onAddMyTask,
  onAddTaskToOthers,
  onToggleTaskStatus,
  onViewMeetings,
  onViewTasks
}) => {
  // Group meetings by day label or date
  const groupedMeetings: { [day: string]: Meeting[] } = {};
  meetings.forEach((m) => {
    const label = m.dayLabel ? (m.date && !m.dayLabel.includes(m.date) ? `${m.dayLabel} (${m.date})` : m.dayLabel) : (m.date || 'UPCOMING');
    if (!groupedMeetings[label]) groupedMeetings[label] = [];
    groupedMeetings[label].push(m);
  });

  return (
    <aside className="w-80 sm:w-84 xl:w-96 shrink-0 h-full overflow-y-auto p-3.5 sm:p-4 space-y-3.5 sm:space-y-4 border-l border-white/50 bg-white/[0.18] backdrop-blur-xl select-none text-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.75)] hidden lg:block">
      {/* 1. Meetings Schedule Card */}
      <div className="glass-liquid-tile p-3.5 sm:p-4 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04),inset_0_1px_1.5px_rgba(255,255,255,0.95)] border border-white/80">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#7738FF]/15 border border-[#7738FF]/30 flex items-center justify-center text-[#7738FF] shrink-0 shadow-xs">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-black tracking-wide leading-none truncate">
                Meeting Schedule
              </h3>
              <span className="text-xs text-slate-700 font-semibold mt-1 inline-block">
                {meetings.length === 0 ? '0 Scheduled' : `${meetings.length} Scheduled`}
              </span>
            </div>
          </div>
          <button
            onClick={onAddMeeting}
            className="w-7 h-7 rounded-lg glass-btn-primary flex items-center justify-center text-xs font-bold transition cursor-pointer text-black hover:scale-105 shrink-0 shadow-xs"
            aria-label="Add Meeting"
            title="Schedule New Meeting"
          >
            <Plus className="w-4 h-4 stroke-[2.5] text-black" />
          </button>
        </div>

        {/* Meeting Events list */}
        <div className="space-y-2.5">
          {Object.entries(groupedMeetings).map(([dayLabel, dayMeetings]) => (
            <div key={dayLabel} className="space-y-1.5">
              <div className="text-[10px] font-extrabold text-[#7738FF] uppercase tracking-wider px-1">
                {dayLabel}
              </div>

              <div className="space-y-1.5">
                {dayMeetings.map((m) => (
                  <div
                    key={m.id}
                    onClick={onViewMeetings}
                    className="flex items-start gap-2.5 group p-2.5 sm:p-3 rounded-xl glass-liquid-pill border border-white/80 hover:border-[#9A75FF]/40 hover:bg-white/95 transition cursor-pointer shadow-xs"
                  >
                    <span className="text-xs font-bold text-black w-12 pt-0.5 tabular-nums font-mono shrink-0">
                      {m.startTime}
                    </span>

                    {/* Colored vertical bar */}
                    <span
                      className="w-1 self-stretch rounded-full shrink-0 min-h-6 shadow-[0_0_6px_rgba(119,56,255,0.35)]"
                      style={{ backgroundColor: m.colorBar || '#7738FF' }}
                    ></span>

                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-black text-xs sm:text-[13px] truncate group-hover:text-[#7738FF] transition-colors leading-snug">
                        {m.title}
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium tabular-nums mt-1 truncate flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{m.date ? `${m.date} · ` : ''}{m.startTime} - {m.endTime}</span>
                        {m.location && <span>· {m.location}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {meetings.length === 0 && (
            <div className="text-center py-4 px-2 rounded-xl bg-white/40 border border-white/60 space-y-1">
              <CalendarIcon className="w-5 h-5 text-slate-400 mx-auto" />
              <div className="text-xs font-bold text-slate-700">No upcoming meetings.</div>
              <p className="text-[11px] text-slate-500 font-medium">Click + to schedule a session</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. My Tasks Card */}
      <div className="glass-liquid-tile p-3.5 sm:p-4 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04),inset_0_1px_1.5px_rgba(255,255,255,0.95)] border border-white/80">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-black tracking-wide leading-none truncate">
                My Tasks
              </h3>
              <span className="text-xs text-slate-700 font-semibold mt-1 inline-block">
                {myTasks.filter(t => t.status !== 'COMPLETED').length} Active
              </span>
            </div>
          </div>
          <button
            onClick={onAddMyTask}
            className="w-7 h-7 rounded-lg glass-btn-primary flex items-center justify-center text-xs font-bold transition cursor-pointer text-black hover:scale-105 shrink-0 shadow-xs"
            aria-label="Add My Task"
            title="Create Task for Myself"
          >
            <Plus className="w-4 h-4 stroke-[2.5] text-black" />
          </button>
        </div>

        {/* Task List */}
        <div className="space-y-1.5">
          {myTasks.slice(0, 5).map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            return (
              <div
                key={task.id}
                className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl glass-liquid-pill border border-white/80 hover:bg-white/95 transition group shadow-xs"
              >
                <button
                  onClick={() => onToggleTaskStatus(task.id, task.status)}
                  className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition cursor-pointer ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-600 text-white'
                      : 'border-slate-400 bg-white hover:border-[#7738FF]'
                  }`}
                  aria-label="Toggle Task Complete"
                >
                  {isCompleted && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-xs sm:text-[13px] font-bold truncate leading-snug ${
                      isCompleted ? 'line-through text-slate-400' : 'text-black group-hover:text-[#7738FF]'
                    }`}
                  >
                    {task.title}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                    {task.dueDate && <span>Due: {task.dueDate}</span>}
                    {task.priority && (
                      <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold border ${
                        task.priority === 'High'
                          ? 'bg-rose-100 text-rose-700 border-rose-200/60'
                          : task.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-800 border-amber-200/60'
                          : 'bg-slate-100 text-slate-700 border-slate-200/60'
                      }`}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {myTasks.length === 0 && (
            <div className="text-center py-3 text-xs text-slate-500 font-medium bg-white/40 rounded-xl border border-white/60">
              No personal tasks.
            </div>
          )}
        </div>
      </div>

      {/* 3. Assigned Tasks Card */}
      <div className="glass-liquid-tile p-3.5 sm:p-4 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04),inset_0_1px_1.5px_rgba(255,255,255,0.95)] border border-white/80">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-black tracking-wide leading-none truncate">
                Assigned Tasks
              </h3>
              <span className="text-xs text-slate-700 font-semibold mt-1 inline-block">
                {tasksAssignedToOthers.filter(t => t.status !== 'COMPLETED').length} Active
              </span>
            </div>
          </div>
          {canAssignToOthers && (
            <button
              onClick={onAddTaskToOthers}
              className="w-7 h-7 rounded-lg glass-btn-primary flex items-center justify-center text-xs font-bold transition cursor-pointer text-black hover:scale-105 shrink-0 shadow-xs"
              aria-label="Assign Task to Others"
              title="Delegate Task to Staff"
            >
              <Plus className="w-4 h-4 stroke-[2.5] text-black" />
            </button>
          )}
        </div>

        {/* Assigned Tasks list */}
        <div className="space-y-1.5">
          {tasksAssignedToOthers.slice(0, 5).map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            return (
              <div
                key={task.id}
                className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl glass-liquid-pill border border-white/80 hover:bg-white/95 transition group shadow-xs"
              >
                <button
                  onClick={() => onToggleTaskStatus(task.id, task.status)}
                  className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition cursor-pointer ${
                    isCompleted
                      ? 'bg-blue-500 border-blue-600 text-white'
                      : 'border-slate-400 bg-white hover:border-blue-500'
                  }`}
                  aria-label="Toggle Assigned Task Status"
                >
                  {isCompleted && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-xs sm:text-[13px] font-bold truncate leading-snug ${
                      isCompleted ? 'line-through text-slate-400' : 'text-black group-hover:text-blue-600'
                    }`}
                  >
                    {task.title}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between gap-1.5 mt-1">
                    <span className="truncate font-semibold text-blue-900 bg-blue-50/80 px-1.5 py-0.5 rounded border border-blue-200/50">
                      {task.assigneeName || 'Staff'}
                    </span>
                    {task.dueDate && <span className="shrink-0">{task.dueDate}</span>}
                  </div>
                </div>
              </div>
            );
          })}

          {tasksAssignedToOthers.length === 0 && (
            <div className="text-center py-3 text-xs text-slate-500 font-medium bg-white/40 rounded-xl border border-white/60">
              No assigned tasks.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
