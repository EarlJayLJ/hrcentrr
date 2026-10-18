import React, { useState } from 'react';
import { Plus, CheckCircle, Clock, AlertCircle, Filter, MessageSquare, User, Calendar } from 'lucide-react';
import { Task, Priority } from '../types.ts';

interface TasksViewProps {
  tasks: Task[];
  onAddTask: () => void;
  onUpdateStatus: (taskId: string, status: Task['status']) => void;
  onClearTasks?: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onAddTask,
  onUpdateStatus,
  onClearTasks
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'MY_TASKS' | 'ASSIGNED_TO_OTHERS'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

  const filteredTasks = tasks.filter((t) => {
    if (filterType === 'MY_TASKS' && !t.isMyTask) return false;
    if (filterType === 'ASSIGNED_TO_OTHERS' && t.isMyTask) return false;
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4 select-none text-black">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-liquid-tile p-4.5 rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.05),inset_0_1.5px_2px_rgba(255,255,255,0.95)]">
        <div>
          <h2 className="text-base font-bold text-black tracking-wide">
            Departmental Tasks & Workflow
          </h2>
          <p className="text-xs text-black mt-0.5">
            Track assignees, progress deadlines, and resolution statuses across the directorate
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {tasks.length > 0 && onClearTasks && (
            <button
              onClick={onClearTasks}
              className="px-3.5 py-2 glass-btn-secondary rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Clear All Tasks
            </button>
          )}
          <button
            onClick={onAddTask}
            className="flex items-center gap-2 px-4 py-2 glass-liquid-cta rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-1.5 p-1 glass-liquid-pill rounded-xl text-xs">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              filterType === 'ALL'
                ? 'glass-liquid-nav-active font-bold'
                : 'text-black hover:text-black'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setFilterType('MY_TASKS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              filterType === 'MY_TASKS'
                ? 'glass-liquid-nav-active font-bold'
                : 'text-black hover:text-black'
            }`}
          >
            My Tasks ({tasks.filter(t => t.isMyTask).length})
          </button>
          <button
            onClick={() => setFilterType('ASSIGNED_TO_OTHERS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              filterType === 'ASSIGNED_TO_OTHERS'
                ? 'glass-liquid-nav-active font-bold'
                : 'text-black hover:text-black'
            }`}
          >
            Assigned Tasks ({tasks.filter(t => !t.isMyTask).length})
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {(['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#7738FF] text-black font-bold shadow-xs'
                  : 'text-black hover:text-black hover:bg-white/80'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="glass-liquid-tile glass-card-hover p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/80 shadow-[0_6px_24px_rgba(0,0,0,0.30)]"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    task.status === 'COMPLETED'
                      ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                      : task.isMyTask
                      ? 'bg-[#7738FF] shadow-[0_0_8px_#7738FF]'
                      : 'bg-sky-400 shadow-[0_0_8px_#38bdf8]'
                  }`}
                ></span>
                <h3
                  className={`text-xs font-bold text-black truncate ${
                    task.status === 'COMPLETED' ? 'line-through text-black' : ''
                  }`}
                >
                  {task.title}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    task.priority === 'Urgent'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : task.priority === 'High'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-white/[0.06] text-[#7738FF] border border-slate-200/80'
                  }`}
                >
                  {task.priority}
                </span>
              </div>
              <p className="text-[11px] text-black line-clamp-1 pl-5">
                {task.description}
              </p>
              <div className="flex items-center gap-4 text-[10px] text-black pl-5">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-[#7738FF]" />
                  Assignee: <span className="text-black font-medium">{task.assigneeName}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#7738FF]" />
                  Due: <span className="text-[#7738FF] font-mono font-medium">{task.dueDate}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-[#7738FF]" />
                  {task.commentsCount} comments
                </span>
              </div>
            </div>

            {/* Quick Status Toggle */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center pl-5 md:pl-0">
              <button
                onClick={() =>
                  onUpdateStatus(
                    task.id,
                    task.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED'
                  )
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  task.status === 'COMPLETED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                    : 'glass-btn-secondary hover:border-[#7738FF]'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{task.status === 'COMPLETED' ? 'Completed' : 'Mark Done'}</span>
              </button>
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="glass-liquid-tile p-8 rounded-2xl border border-slate-200/80 text-center text-black text-xs">
            No tasks match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};
