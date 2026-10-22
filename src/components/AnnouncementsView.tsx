import React, { useState } from 'react';
import { Megaphone, Pin, Plus, CheckCircle2, Search, Calendar, Trash2, Tag, Eye } from 'lucide-react';
import { Announcement, User } from '../types.ts';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  currentUser: User;
  searchQuery?: string;
  onNewAnnouncement: () => void;
  onAcknowledge: (id: string) => void;
  onDeleteAnnouncement?: (id: string) => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  currentUser,
  searchQuery = '',
  onNewAnnouncement,
  onAcknowledge,
  onDeleteAnnouncement
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const canPublish = ['HR_ADMIN', 'HR_MANAGER'].includes(currentUser.role);
  const categories = ['ALL', 'General', 'Policy Update', 'Emergency', 'Holiday', 'Benefits'];

  const effectiveSearch = (localSearch || searchQuery || '').trim().toLowerCase();

  const filteredAnnouncements = announcements.filter((ann) => {
    if (ann.isDraft && !canPublish) return false;
    if (selectedCategory !== 'ALL' && ann.category !== selectedCategory) return false;
    if (effectiveSearch && !ann.title.toLowerCase().includes(effectiveSearch) && !ann.content.toLowerCase().includes(effectiveSearch)) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 select-none text-black">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-liquid-tile p-4.5 rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.05),inset_0_1.5px_2px_rgba(255,255,255,0.95)]">
        <div>
          <h2 className="text-base font-bold text-black tracking-wide">
            Official Notices & Announcements
          </h2>
          <p className="text-xs text-black mt-0.5">
            National Youth Authority official memos, directives, and departmental notices
          </p>
        </div>

        {canPublish && (
          <button
            onClick={onNewAnnouncement}
            className="flex items-center gap-2 px-4 py-2 glass-liquid-cta rounded-xl text-xs font-bold transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Publish Notice</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition cursor-pointer border ${
                selectedCategory === cat
                  ? 'glass-liquid-nav-active font-bold'
                  : 'glass-liquid-pill text-black hover:text-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7738FF]" />
          <input
            type="text"
            value={localSearch || searchQuery}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search notices..."
            className="pl-8 pr-4 py-1.5 bg-white/80 text-black hover:bg-white focus:bg-white placeholder-slate-500 text-xs rounded-xl border border-white/80 focus:border-[#7738FF] focus:outline-none w-full sm:w-64 transition shadow-xs"
          />
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {filteredAnnouncements.map((ann) => {
          const isAcknowledged = ann.acknowledgedBy.includes(currentUser.id);
          return (
            <div
              key={ann.id}
              className="glass-liquid-tile glass-card-hover p-5 rounded-2xl border border-white/80 shadow-[0_6px_24px_rgba(0,0,0,0.30)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {ann.pinned && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#7738FF] bg-[#7738FF]/20 px-2 py-0.5 rounded-full border border-[#7738FF]/40">
                        <Pin className="w-3 h-3 rotate-45 text-[#7738FF]" /> Pinned
                      </span>
                    )}

                    {ann.isDraft && (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                        Draft (Unpublished)
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ann.priority === 'High' || ann.priority === 'Urgent'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : ann.priority === 'Medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {ann.priority} Priority
                    </span>

                    <span className="text-[10px] font-medium text-[#7738FF] bg-white/[0.06] border border-slate-200/80 px-2.5 py-0.5 rounded-full">
                      {ann.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-black pt-1">
                    {ann.title}
                  </h3>

                  <p className="text-xs text-black leading-relaxed whitespace-pre-wrap">
                    {ann.content}
                  </p>

                  <div className="flex items-center gap-4 text-[10px] text-black pt-1 flex-wrap">
                    <span>
                      Published by: <strong className="text-black">{ann.authorName}</strong> ({ann.authorRole})
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-[#7738FF]" />
                      {ann.publishedAt}
                    </span>
                    {ann.expiryDate && (
                      <span className="font-mono">Expires: {ann.expiryDate}</span>
                    )}
                    <span className="text-[#7738FF] font-semibold">{ann.acknowledgedBy.length} acknowledgements</span>
                  </div>
                </div>

                {/* Actions: Acknowledge & Delete */}
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => onAcknowledge(ann.id)}
                    disabled={isAcknowledged}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      isAcknowledged
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 cursor-default'
                        : 'glass-btn-secondary hover:border-[#7738FF] text-black'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isAcknowledged ? 'text-emerald-400' : 'text-[#7738FF]'}`} />
                    <span>{isAcknowledged ? 'Acknowledged' : 'Acknowledge'}</span>
                  </button>

                  {canPublish && onDeleteAnnouncement && (
                    <button
                      onClick={() => onDeleteAnnouncement(ann.id)}
                      className="p-1.5 text-black hover:text-rose-400 hover:bg-rose-500/15 rounded-lg transition cursor-pointer"
                      title="Archive / Remove Notice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredAnnouncements.length === 0 && (
          <div className="text-center py-12 text-xs text-slate-600 glass-liquid-tile rounded-2xl border border-slate-200/80 font-medium">
            {announcements.length === 0 ? 'No announcements available.' : 'No notices match the selected criteria.'}
          </div>
        )}
      </div>
    </div>
  );
};
