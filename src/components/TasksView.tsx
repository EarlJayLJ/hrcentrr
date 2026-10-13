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
    <div className="space-y-4">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Departmental Tasks & Workflow
          </h2>
          <p className="text-xs text-slate-500">
            Track assignees, progress deadlines, and resolution statuses
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {tasks.length > 0 && onClearTasks && (
            <button
              onClick={onClearTasks}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Clear All Tasks
            </button>
          )}
          <button
            onClick={onAddTask}
            className="flex items-center gap-2 px-4 py-2 bg-[#006b3f] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setFilterType('MY_TASKS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              filterType === 'MY_TASKS'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Tasks ({tasks.filter(t => t.isMyTask).length})
          </button>
          <button
            onClick={() => setFilterType('ASSIGNED_TO_OTHERS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              filterType === 'ASSIGNED_TO_OTHERS'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Delegated ({tasks.filter(t => !t.isMyTask).length})
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {(['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                  : 'text-slate-500 hover:text-slate-800'
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
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    task.status === 'COMPLETED'
                      ? 'bg-emerald-500'
                      : task.isMyTask
                      ? 'bg-blue-600'
                      : 'bg-emerald-600'
                  }`}
                ></span>
                <h3
                  className={`text-xs font-bold text-slate-800 truncate ${
                    task.status === 'COMPLETED' ? 'line-through text-slate-400' : ''
                  }`}
                >
                  {task.title}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    task.priority === 'Urgent'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : task.priority === 'High'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {task.priority}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1 pl-5">
                {task.description}
              </p>
              <div className="flex items-center gap-4 text-[10px] text-slate-400 pl-5">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Assignee: {task.assigneeName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Due: {task.dueDate}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
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
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{task.status === 'COMPLETED' ? 'Completed' : 'Mark Done'}</span>
              </button>
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            No tasks match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};
