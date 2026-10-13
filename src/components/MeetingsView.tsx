import React from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Plus, FileText, CheckCircle } from 'lucide-react';
import { Meeting } from '../types.ts';

interface MeetingsViewProps {
  meetings: Meeting[];
  onScheduleMeeting: () => void;
  onClearMeetings?: () => void;
}

export const MeetingsView: React.FC<MeetingsViewProps> = ({
  meetings,
  onScheduleMeeting,
  onClearMeetings
}) => {
  return (
    <div className="space-y-4">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Meetings & Calendar Schedules
          </h2>
          <p className="text-xs text-slate-500">
            National Youth Authority hearings, directorate meetings, and orientation sessions
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {meetings.length > 0 && onClearMeetings && (
            <button
              onClick={onClearMeetings}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Clear All Meetings
            </button>
          )}
          <button
            onClick={onScheduleMeeting}
            className="flex items-center gap-2 px-4 py-2 bg-[#006b3f] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* Meetings Grid */}
      {meetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meetings.map((m) => (
            <div
              key={m.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative overflow-hidden"
            >
              {/* Left color bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1.5"
                style={{ backgroundColor: m.colorBar || '#22c55e' }}
              ></div>

              <div className="flex items-start justify-between gap-2 pl-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {m.title}
                    </h3>
                    {m.dayLabel && (
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {m.dayLabel}
                      </span>
                    )}
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 tabular-nums">
                  {m.startTime} - {m.endTime}
                </span>
              </div>

              <p className="text-xs text-slate-600 pl-2 leading-relaxed">
                {m.description}
              </p>

              <div className="space-y-1.5 pl-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{m.location}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Attendees: {m.participants.join(', ')}</span>
                </div>
              </div>

              {m.actionItems && m.actionItems.length > 0 && (
                <div className="pl-2 pt-1 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700">Action Items:</span>
                  <ul className="list-disc list-inside text-slate-600 mt-1">
                    {m.actionItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Meetings Scheduled</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All meetings have been cleared. Click &ldquo;Schedule Meeting&rdquo; to add a new session or hearing to the calendar.
          </p>
        </div>
      )}
    </div>
  );
};
