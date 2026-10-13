import React from 'react';
import { Plus, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { Meeting, Task } from '../types.ts';

interface RightCalendarRailProps {
  meetings: Meeting[];
  myTasks: Task[];
  tasksAssignedToOthers: Task[];
  onAddMeeting: () => void;
  onAddMyTask: () => void;
  onAddTaskToOthers: () => void;
  onToggleTaskStatus: (taskId: string) => void;
}

export const RightCalendarRail: React.FC<RightCalendarRailProps> = ({
  meetings,
  myTasks,
  tasksAssignedToOthers,
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
    <aside className="w-72 shrink-0 p-5 space-y-5 border-l border-slate-200 bg-white select-none overflow-y-auto">
      {/* 1. Calendar card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-800">
            Calendar
          </h3>
          <button
            onClick={onAddMeeting}
            className="w-6 h-6 rounded-full bg-[#006b3f] hover:bg-emerald-700 text-white flex items-center justify-center text-sm font-bold shadow-xs transition cursor-pointer"
            aria-label="Add Meeting"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>

        {/* Days & Events */}
        <div className="space-y-3.5 text-xs">
          {Object.entries(groupedMeetings).map(([dayLabel, dayMeetings]) => (
            <div key={dayLabel} className="space-y-2">
              <div className="text-xs font-bold text-slate-700">
                {dayLabel}
              </div>

              <div className="space-y-2 pl-0.5">
                {dayMeetings.map((m) => (
                  <div key={m.id} className="flex items-start gap-2.5 group">
                    <span className="text-[11px] font-medium text-slate-500 w-9 pt-0.5 tabular-nums">
                      {m.startTime}
                    </span>

                    {/* Colored vertical bar */}
                    <span
                      className="w-1 self-stretch rounded-full shrink-0 min-h-7"
                      style={{ backgroundColor: m.colorBar || '#22c55e' }}
                    ></span>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 text-[11px] truncate group-hover:text-emerald-700 transition">
                        {m.title}
                      </div>
                      <div className="text-[10px] text-slate-400 tabular-nums">
                        {m.startTime} - {m.endTime}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {Object.keys(groupedMeetings).length === 0 && (
            <div className="text-center py-4 text-xs text-slate-400">
              No meetings scheduled
            </div>
          )}
        </div>
      </div>

      {/* 2. My tasks card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-800">
            My tasks
          </h3>
          <button
            onClick={onAddMyTask}
            className="w-6 h-6 rounded-full bg-[#006b3f] hover:bg-emerald-700 text-white flex items-center justify-center text-sm font-bold shadow-xs transition cursor-pointer"
            aria-label="Add My Task"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1.5 border-b border-slate-100">
          <span>Name</span>
          <span>Date</span>
        </div>

        <div className="space-y-2.5 pt-2 text-xs">
          {myTasks.slice(0, 4).map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-2 group cursor-pointer"
              onClick={() => onToggleTaskStatus(task.id)}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Blue bullet dot */}
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    task.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-[#0284c7]'
                  }`}
                ></span>
                <span
                  className={`text-[11px] truncate ${
                    task.status === 'COMPLETED'
                      ? 'line-through text-slate-400'
                      : 'text-slate-800 font-medium group-hover:text-blue-600'
                  }`}
                  title={task.title}
                >
                  {task.title}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0 tabular-nums">
                {task.dueDate.replace(', 2024', '')}
              </span>
            </div>
          ))}

          {myTasks.length === 0 && (
            <div className="text-center py-3 text-xs text-slate-400">
              All tasks completed!
            </div>
          )}
        </div>
      </div>

      {/* 3. Assigned to others card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-800">
            Assigned to others
          </h3>
          <button
            onClick={onAddTaskToOthers}
            className="w-6 h-6 rounded-full bg-[#006b3f] hover:bg-emerald-700 text-white flex items-center justify-center text-sm font-bold shadow-xs transition cursor-pointer"
            aria-label="Assign Task"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1.5 border-b border-slate-100">
          <span>Name</span>
          <span>Date</span>
        </div>

        <div className="space-y-2.5 pt-2 text-xs">
          {tasksAssignedToOthers.slice(0, 4).map((task) => (
            <div key={task.id} className="flex items-center justify-between gap-2 group">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Emerald bullet dot */}
                <span className="w-2 h-2 rounded-full bg-[#006b3f] shrink-0"></span>
                <span
                  className="text-[11px] text-slate-800 font-medium truncate group-hover:text-emerald-700 transition"
                  title={task.title}
                >
                  {task.title}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0 tabular-nums">
                {task.dueDate.replace(', 2024', '')}
              </span>
            </div>
          ))}

          {tasksAssignedToOthers.length === 0 && (
            <div className="text-center py-3 text-xs text-slate-400">
              No tasks delegated
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
