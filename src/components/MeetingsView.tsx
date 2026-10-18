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
    <div className="space-y-4 select-none text-black">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-liquid-tile p-4.5 rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.05),inset_0_1.5px_2px_rgba(255,255,255,0.95)]">
        <div>
          <h2 className="text-base font-bold text-black tracking-wide">
            Meetings & Calendar Schedules
          </h2>
          <p className="text-xs text-black mt-0.5">
            National Youth Authority hearings, directorate meetings, and orientation sessions
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {meetings.length > 0 && onClearMeetings && (
            <button
              onClick={onClearMeetings}
              className="px-3.5 py-2 glass-btn-secondary rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Clear All Meetings
            </button>
          )}
          <button
            onClick={onScheduleMeeting}
            className="flex items-center gap-2 px-4 py-2 glass-liquid-cta rounded-xl text-xs font-bold transition cursor-pointer"
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
              className="glass-liquid-tile glass-card-hover p-5 rounded-2xl space-y-3 relative overflow-hidden border border-white/80 shadow-[0_6px_24px_rgba(0,0,0,0.30)]"
            >
              {/* Left color bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1.5 shadow-[0_0_8px_rgba(119,56,255,0.4)]"
                style={{ backgroundColor: m.colorBar || '#7738FF' }}
              ></div>

              <div className="flex items-start justify-between gap-2 pl-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-black">
                      {m.title}
                    </h3>
                    {m.dayLabel && (
                      <span className="text-[11px] font-semibold text-[#7738FF] bg-[#7738FF]/20 border border-[#7738FF]/40 px-2 py-0.5 rounded-md">
                        {m.dayLabel}
                      </span>
                    )}
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-white/[0.06] border border-slate-200/80 rounded-lg text-xs font-bold text-[#7738FF] tabular-nums font-mono">
                  {m.startTime} - {m.endTime}
                </span>
              </div>

              <p className="text-xs text-black pl-2 leading-relaxed">
                {m.description}
              </p>

              <div className="space-y-1.5 pl-2 text-xs text-black/80 pt-2 border-t border-slate-200/80">
                <div className="flex items-center gap-2 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-[#7738FF] shrink-0" />
                  <span>{m.location}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <Users className="w-3.5 h-3.5 text-[#7738FF] shrink-0" />
                  <span>Attendees: {m.participants.join(', ')}</span>
                </div>
              </div>

              {m.actionItems && m.actionItems.length > 0 && (
                <div className="ml-2 pt-1 text-[11px] bg-white/80 text-black p-2.5 rounded-xl border border-slate-200/80">
                  <span className="font-bold text-black">Action Items:</span>
                  <ul className="list-disc list-inside text-black mt-1">
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
        <div className="glass-liquid-tile p-12 rounded-2xl border border-slate-200/80 text-center space-y-3">
          <CalendarIcon className="w-10 h-10 text-[#7738FF]/60 mx-auto" />
          <h3 className="text-sm font-bold text-black">No Meetings Scheduled</h3>
          <p className="text-xs text-black max-w-sm mx-auto">
            All meetings have been cleared. Click &ldquo;Schedule Meeting&rdquo; to add a new session or hearing to the calendar.
          </p>
        </div>
      )}
    </div>
  );
};
