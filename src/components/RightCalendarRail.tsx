import React from 'react';
import { Plus, Calendar as CalendarIcon, CheckCircle2, Clock } from 'lucide-react';
import { Meeting, Task } from '../types.ts';

interface RightCalendarRailProps {
  meetings: Meeting[];
  myTasks: Task[];
  tasksAssignedToOthers: Task[];
  isHrHead?: boolean;
  onAddMeeting: () => void;
  onAddMyTask: () => void;
  onAddTaskToOthers: () => void;
  onToggleTaskStatus: (taskId: string) => void;
}

export const RightCalendarRail: React.FC<RightCalendarRailProps> = ({
  meetings,
  myTasks,
  tasksAssignedToOthers,
  isHrHead = false,
  onAddMeeting,
  onAddMyTask,
  onAddTaskToOthers,
  onToggleTaskStatus
}) => {
  // Group meetings by day label
  const groupedMeetings: { [day: string]: Meeting[] } = {};
  meetings.forEach((m) => {
    const label = m.dayLabel || 'UPCOMING';
    if (!groupedMeetings[label]) groupedMeetings[label] = [];
    groupedMeetings[label].push(m);
  });

  return (
    <aside className="w-72 shrink-0 p-5 space-y-5 border-l border-white/50 bg-white/[0.18] backdrop-blur-xl select-none overflow-y-auto text-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.75)]">
      {/* 1. Meetings Schedule Card */}
      <div className="glass-liquid-tile p-4 rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.05),inset_0_1.5px_2px_rgba(255,255,255,0.95)] border border-white/80">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-black" />
            <h3 className="text-xs font-bold text-black tracking-wide">
              Meetings Schedule
            </h3>
          </div>
          <button
            onClick={onAddMeeting}
            className="w-6 h-6 rounded-full glass-btn-primary flex items-center justify-center text-sm font-bold transition cursor-pointer text-black"
            aria-label="Add Meeting"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3] text-black" />
          </button>
        </div>

        {/* Days & Events */}
        <div className="space-y-3.5 text-xs">
          {Object.entries(groupedMeetings).map(([dayLabel, dayMeetings]) => (
            <div key={dayLabel} className="space-y-2">
              <div className="text-[11px] font-bold text-black uppercase tracking-wider">
                {dayLabel}
              </div>

              <div className="space-y-2 pl-0.5">
                {dayMeetings.map((m) => (
                  <div key={m.id} className="flex items-start gap-2.5 group p-1.5 rounded-xl glass-liquid-pill transition">
                    <span className="text-[11px] font-bold text-black w-10 pt-0.5 tabular-nums font-mono">
                      {m.startTime}
                    </span>

                    {/* Colored vertical bar with soft glow */}
                    <span
                      className="w-1 self-stretch rounded-full shrink-0 min-h-7 shadow-[0_0_6px_rgba(119,56,255,0.35)]"
                      style={{ backgroundColor: m.colorBar || '#7738FF' }}
                    ></span>

                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-black text-[11px] truncate group-hover:text-black transition-colors">
                        {m.title}
                      </div>
                      <div className="text-[10px] text-black font-semibold tabular-nums">
                        {m.startTime} - {m.endTime}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {Object.keys(groupedMeetings).length === 0 && (
            <div className="text-center py-4 text-xs text-black font-bold">
              No meetings scheduled
            </div>
          )}
        </div>
      </div>

      {/* 2. My Tasks Card */}
      <div className="glass-liquid-tile p-4 rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.05),inset_0_1.5px_2px_rgba(255,255,255,0.95)] border border-white/80">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-black" />
            <h3 className="text-xs font-bold text-black tracking-wide">
              My Tasks
            </h3>
          </div>
          <button
            onClick={onAddMyTask}
            className="w-6 h-6 rounded-full glass-btn-primary flex items-center justify-center text-sm font-bold transition cursor-pointer text-black"
            aria-label="Add My Task"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3] text-black" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-black font-bold pb-2 border-b border-slate-300">
          <span>Task Title</span>
          <span>Due</span>
        </div>

        <div className="space-y-2 pt-2 text-xs">
          {myTasks.slice(0, 4).map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-2 group cursor-pointer p-1.5 rounded-xl glass-liquid-pill transition"
              onClick={() => onToggleTaskStatus(task.id)}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    task.status === 'COMPLETED'
                      ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]'
                      : 'bg-[#7738FF] shadow-[0_0_6px_#7738FF]'
                  }`}
                ></span>
                <span
                  className={`text-[11px] truncate ${
                    task.status === 'COMPLETED'
                      ? 'line-through text-black font-bold'
                      : 'text-black font-bold group-hover:text-black'
                  }`}
                  title={task.title}
                >
                  {task.title}
                </span>
              </div>
              <span className="text-[10px] text-black font-bold shrink-0 tabular-nums font-mono">
                {task.dueDate.replace(', 2024', '').replace(', 2026', '')}
              </span>
            </div>
          ))}

          {myTasks.length === 0 && (
            <div className="text-center py-3 text-xs text-black font-bold">
              No personal tasks
            </div>
          )}
        </div>
      </div>

      {/* 3. Assigned Tasks Card (Read-only for ordinary users) */}
      <div className="glass-liquid-tile p-4 rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.05),inset_0_1.5px_2px_rgba(255,255,255,0.95)] border border-white/80">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-xs font-bold text-black tracking-wide">
            Assigned Tasks
          </h3>
          {isHrHead && (
            <button
              onClick={onAddTaskToOthers}
              className="w-6 h-6 rounded-full bg-white/70 hover:bg-white border border-white/80 text-black flex items-center justify-center text-sm font-bold transition cursor-pointer shadow-xs"
              aria-label="Assign Task"
              title="Assign Task to Staff"
            >
              <Plus className="w-3.5 h-3.5 text-black" />
            </button>
          )}
        </div>

        <div className="space-y-2 text-xs">
          {tasksAssignedToOthers.slice(0, 3).map((task) => (
            <div key={task.id} className="p-2.5 rounded-xl glass-liquid-pill">
              <div className="text-[11px] font-bold text-black truncate">{task.title}</div>
              <div className="flex items-center justify-between text-[10px] text-black font-bold mt-1">
                <span>{task.assigneeName || task.creatorName}</span>
                <span className="text-black font-mono font-bold">{task.dueDate.replace(', 2024', '').replace(', 2026', '')}</span>
              </div>
            </div>
          ))}

          {tasksAssignedToOthers.length === 0 && (
            <div className="text-center py-2 text-xs text-black font-bold">
              No assigned tasks
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
