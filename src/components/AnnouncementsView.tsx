import React, { useState } from 'react';
import { Megaphone, Pin, Plus, CheckCircle2, Search, Calendar, Trash2, Tag, Eye } from 'lucide-react';
import { Announcement, User } from '../types.ts';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  currentUser: User;
  onNewAnnouncement: () => void;
  onAcknowledge: (id: string) => void;
  onDeleteAnnouncement?: (id: string) => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  currentUser,
  onNewAnnouncement,
  onAcknowledge,
  onDeleteAnnouncement
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const canPublish = ['HR_ADMIN', 'HR_MANAGER'].includes(currentUser.role);

  const categories = ['ALL', 'General', 'Policy Update', 'Emergency', 'Holiday', 'Benefits'];

  const filteredAnnouncements = announcements.filter((ann) => {
    // If draft, only visible to admins/managers
    if (ann.isDraft && !canPublish) return false;
    if (selectedCategory !== 'ALL' && ann.category !== selectedCategory) return false;
    if (searchQuery && !ann.title.toLowerCase().includes(searchQuery.toLowerCase()) && !ann.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Official Notices & Announcements
          </h2>
          <p className="text-xs text-slate-500">
            National Youth Authority official memos, directives, and departmental notices
          </p>
        </div>

        {canPublish && (
          <button
            onClick={onNewAnnouncement}
            className="flex items-center gap-2 px-4 py-2 bg-[#006b3f] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer self-start sm:self-auto"
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
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notices..."
            className="pl-8 pr-4 py-1.5 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 w-full sm:w-64"
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
              className={`p-5 rounded-2xl border transition ${
                ann.pinned
                  ? 'bg-white border-2 border-emerald-400 shadow-xs'
                  : 'bg-white border border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {ann.pinned && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <Pin className="w-3 h-3 rotate-45" /> Pinned
                      </span>
                    )}

                    {ann.isDraft && (
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        Draft (Unpublished)
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ann.priority === 'High' || ann.priority === 'Urgent'
                          ? 'bg-red-100 text-red-700'
                          : ann.priority === 'Medium'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {ann.priority} Priority
                    </span>

                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {ann.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 pt-0.5">
                    {ann.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {ann.content}
                  </p>

                  <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1 flex-wrap">
                    <span>
                      Published by: <strong className="text-slate-600">{ann.authorName}</strong> ({ann.authorRole})
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {ann.publishedAt}
                    </span>
                    {ann.expiryDate && (
                      <span>Expires: {ann.expiryDate}</span>
                    )}
                    <span>{ann.acknowledgedBy.length} acknowledgements</span>
                  </div>
                </div>

                {/* Actions: Acknowledge & Delete */}
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => onAcknowledge(ann.id)}
                    disabled={isAcknowledged}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isAcknowledged
                        ? 'bg-emerald-100 text-emerald-800 cursor-default'
                        : 'bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-800 shadow-2xs'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isAcknowledged ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{isAcknowledged ? 'Acknowledged' : 'Acknowledge'}</span>
                  </button>

                  {canPublish && onDeleteAnnouncement && (
                    <button
                      onClick={() => onDeleteAnnouncement(ann.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
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
          <div className="text-center py-12 text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No notices found matching current criteria.
          </div>
        )}
      </div>
    </div>
  );
};
