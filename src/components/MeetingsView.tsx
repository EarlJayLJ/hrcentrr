import React from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Plus, FileText, CheckCircle } from 'lucide-react';
import { Meeting } from '../types.ts';

interface MeetingsViewProps {
  meetings: Meeting[];
  searchQuery?: string;
  onScheduleMeeting: () => void;
  onClearMeetings?: () => void;
}

export const MeetingsView: React.FC<MeetingsViewProps> = ({
  meetings,
  searchQuery = '',
  onScheduleMeeting,
  onClearMeetings
}) => {
  const filteredMeetings = searchQuery.trim()
    ? meetings.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.location && m.location.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : meetings;

  return (
    <div className="space-y-3.5 select-none text-black">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-liquid-tile p-3.5 sm:p-4 rounded-xl border border-white/80 shadow-[0_6px_20px_rgba(15,23,42,0.04),inset_0_1px_1.5px_rgba(255,255,255,0.95)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-extrabold text-black tracking-tight">
              Meetings & Calendar Schedules
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#7738FF]/20 border border-[#7738FF]/40 text-black tabular-nums">
              {filteredMeetings.length === 0 ? '0 Scheduled' : `${filteredMeetings.length} Scheduled`}
            </span>
          </div>
          <p className="text-xs text-slate-700 font-medium mt-0.5">
            Human Resource Department hearings, directorate briefings, and staff schedules
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {meetings.length > 0 && onClearMeetings && (
            <button
              onClick={onClearMeetings}
              className="px-3 py-1.5 glass-btn-secondary rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Clear All Meetings
            </button>
          )}
          <button
            onClick={onScheduleMeeting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 glass-liquid-cta rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* Meetings Grid */}
      {filteredMeetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredMeetings.map((m) => (
            <div
              key={m.id}
              className="glass-liquid-tile glass-card-hover p-5 rounded-2xl space-y-3.5 relative overflow-hidden border border-white/80 shadow-[0_6px_24px_rgba(0,0,0,0.05)]"
            >
              {/* Left color bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1.5 shadow-[0_0_8px_rgba(119,56,255,0.4)]"
                style={{ backgroundColor: m.colorBar || '#7738FF' }}
              ></div>

              <div className="flex items-start justify-between gap-3 pl-2">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-black">
                      {m.title}
                    </h3>
                    {(m.dayLabel || m.date) && (
                      <span className="text-xs font-bold text-[#7738FF] bg-[#7738FF]/20 border border-[#7738FF]/40 px-2.5 py-0.5 rounded-md">
                        {m.dayLabel || m.date}
                      </span>
                    )}
                  </div>
                </div>
                <span className="px-3 py-1 bg-white/70 border border-slate-200/90 rounded-lg text-sm font-bold text-[#7738FF] tabular-nums font-mono shrink-0">
                  {m.startTime} - {m.endTime}
                </span>
              </div>

              <p className="text-sm text-slate-800 pl-2 leading-relaxed font-medium">
                {m.description}
              </p>

              <div className="space-y-2 pl-2 text-sm text-slate-800 pt-2.5 border-t border-slate-200/80">
                {m.date && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                    <CalendarIcon className="w-4 h-4 text-[#7738FF] shrink-0" />
                    <span className="font-mono font-semibold text-black">{m.date}</span>
                    <span className="text-slate-500">·</span>
                    <span className="font-mono text-[#7738FF] font-semibold">{m.startTime} - {m.endTime}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                  <MapPin className="w-4 h-4 text-[#7738FF] shrink-0" />
                  <span>{m.location}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                  <Users className="w-4 h-4 text-[#7738FF] shrink-0" />
                  <span>Attendees: {Array.isArray(m.participants) && m.participants.length > 0 ? m.participants.join(', ') : 'All HR Staff'}</span>
                </div>
              </div>

              {m.actionItems && m.actionItems.length > 0 && (
                <div className="ml-2 pt-1 text-xs sm:text-sm bg-white/80 text-black p-3 rounded-xl border border-slate-200/80">
                  <span className="font-bold text-black">Action Items:</span>
                  <ul className="list-disc list-inside text-slate-800 mt-1 space-y-0.5 font-medium">
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
          <CalendarIcon className="w-12 h-12 text-[#7738FF]/70 mx-auto" />
          <h3 className="text-lg font-bold text-black">No upcoming meetings.</h3>
          <p className="text-sm text-slate-700 max-w-md mx-auto font-medium">
            There are currently no meetings scheduled on the calendar. Click &ldquo;Schedule Meeting&rdquo; to add a new directorate meeting, hearing, or review session.
          </p>
        </div>
      )}
    </div>
  );
};
