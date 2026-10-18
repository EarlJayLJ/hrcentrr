import React from 'react';
import { Calendar, Clock, MapPin, Users, X, BellRing, ArrowRight } from 'lucide-react';
import { Meeting } from '../types.ts';

interface MeetingReminderModalProps {
  isOpen: boolean;
  meeting: Meeting | null;
  onDismiss: () => void;
  onViewMeeting: (meeting: Meeting) => void;
}

export const MeetingReminderModal: React.FC<MeetingReminderModalProps> = ({
  isOpen,
  meeting,
  onDismiss,
  onViewMeeting
}) => {
  if (!isOpen || !meeting) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 select-none">
      <div className="glass-liquid-window rounded-3xl p-6 w-full max-w-md text-black animate-in fade-in zoom-in-95 relative overflow-hidden border border-white/20 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.14),0_0_40px_rgba(119,56,255,0.08)]">
        {/* Ambient glowing gradient accent */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#7738FF]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#7738FF]/25 border border-[#7738FF]/40 flex items-center justify-center text-[#7738FF] shadow-xs">
              <BellRing className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-bold text-black tracking-wide uppercase flex items-center gap-1.5">
                <span>Meeting Time Reminder</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"></span>
              </div>
              <div className="text-[11px] text-[#7738FF] font-semibold">Scheduled Starting Now</div>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 text-black hover:text-black rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Meeting Details Card */}
        <div className="my-4 space-y-3.5 text-xs">
          <div className="p-4 rounded-2xl glass-liquid-tile space-y-2 border border-white/80 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
            <h3 className="text-sm font-bold text-black tracking-tight leading-snug">
              {meeting.title}
            </h3>
            {meeting.description && (
              <p className="text-xs text-black leading-relaxed line-clamp-2">
                {meeting.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-[11px]">
            <div className="p-2.5 rounded-xl glass-liquid-pill flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#7738FF] shrink-0" />
              <div>
                <span className="text-black block text-[10px]">Time Slot</span>
                <span className="font-bold text-black font-mono">{meeting.startTime} - {meeting.endTime}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl glass-liquid-pill flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <div className="truncate">
                <span className="text-black block text-[10px]">Location</span>
                <span className="font-bold text-black truncate block">{meeting.location || 'Head Office'}</span>
              </div>
            </div>
          </div>

          {meeting.participants && meeting.participants.length > 0 && (
            <div className="p-2.5 rounded-xl glass-liquid-pill flex items-center gap-2 text-[11px]">
              <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="truncate">
                <span className="text-black block text-[10px]">Attendees</span>
                <span className="font-semibold text-black truncate block">{meeting.participants.join(', ')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200/80">
          <button
            onClick={onDismiss}
            className="px-4 py-2 glass-btn-secondary text-black hover:text-black rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Dismiss
          </button>
          <button
            onClick={() => onViewMeeting(meeting)}
            className="flex items-center gap-1.5 px-4 py-2 glass-liquid-cta rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <span>Open Meeting</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
