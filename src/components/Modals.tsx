import React, { useState } from 'react';
import { X, Upload, Calendar, Clock, MapPin, User, FileText, CheckCircle2, Copy, Megaphone, UserPlus, MessageSquare, Download, Shield, KeyRound, Sparkles } from 'lucide-react';
import { Priority, UserRole, User as UserType, DocumentItem, Announcement } from '../types.ts';

// 1. New Case Modal
export const NewCaseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (caseData: any) => void;
  users: UserType[];
}> = ({ isOpen, onClose, onSubmit, users }) => {
  const [name, setName] = useState('');
  const [caseNumber, setCaseNumber] = useState(`HR-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [category, setCategory] = useState<string>('Postings & Deployment');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [dates, setDates] = useState('May 18, 2024 - May 25, 2024');
  const [attachmentName, setAttachmentName] = useState('NYA_Posting_Schedule.doc');
  const [country, setCountry] = useState('Greater Accra');
  const [assigneeId, setAssigneeId] = useState(users[0]?.id || 'u1');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const assignee = users.find(u => u.id === assigneeId) || users[0];
    onSubmit({
      name,
      caseNumber,
      category,
      priority,
      dates,
      country,
      status: 'PENDING_ACCEPTANCE',
      attachment: attachmentName ? { name: attachmentName, size: '1.2 MB' } : undefined,
      assignee: {
        id: assignee.id,
        name: assignee.name,
        initials: assignee.avatarText,
        color: assignee.avatarBg
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 select-none">
      <div className="glass-liquid-window bg-white/95 rounded-3xl p-6  shadow-[0_25px_60px_-15px_rgba(15,23,42,0.14),0_0_40px_rgba(119,56,255,0.08)] border border-white/20 text-black animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80">
          <h3 className="text-sm font-bold text-black flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400"></span>
            <span>Create New HR Case</span>
          </h3>
          <button onClick={onClose} className="p-1 text-black hover:text-black rounded-lg hover:bg-slate-100 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-4 text-xs">
          <div>
            <label className="block font-semibold text-black mb-1">Case Title</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Staff Arbitration & Restructuring Dispute"
              className="w-full px-3 py-2 rounded-xl bg-white/80 text-black hover:bg-white focus:bg-white/80 text-black border border-white/80 focus:border-violet-500 text-black placeholder-slate-400 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-black mb-1">Case Number</label>
              <input
                type="text"
                value={caseNumber}
                onChange={e => setCaseNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/80 text-black border border-white/80 text-violet-700 font-mono font-semibold focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-black mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white/80 text-black border border-white/80 text-black focus:outline-none"
              >
                <option value="Product">Product / Onboarding</option>
                <option value="Trademark">Trademark / Contracts</option>
                <option value="Patent">Patent / Intellectual Property</option>
                <option value="Compensation">Compensation & Benefits</option>
                <option value="Postings & Deployment">Postings & Deployment (NSSP)</option>
                <option value="Training & Skills">Training & Skills (YLSTI)</option>
                <option value="Promotions">Promotions & PSC Review</option>
                <option value="Staff Welfare">Staff Welfare & Health</option>
                <option value="Policy & Compliance">Policy & Civil Service Compliance</option>
                <option value="Disciplinary">Disciplinary & Labor Relations</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-black mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-xl bg-white/80 text-black border border-white/80 text-black focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-black mb-1">Regional Directorate</label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/80 text-black border border-white/80 text-black focus:outline-none"
              >
                <option value="Greater Accra">Greater Accra (Head Office)</option>
                <option value="Ashanti">Ashanti (Kumasi Secretariat)</option>
                <option value="Western">Western (Takoradi Secretariat)</option>
                <option value="Eastern">Eastern (Koforidua Secretariat)</option>
                <option value="Northern">Northern (Tamale Secretariat)</option>
                <option value="Central">Central (Cape Coast Secretariat)</option>
                <option value="Volta">Volta (Ho Secretariat)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-black mb-1">Active Dates</label>
              <input
                type="text"
                value={dates}
                onChange={e => setDates(e.target.value)}
                placeholder="May 18, 2024 - May 25, 2024"
                className="w-full px-3 py-2 rounded-xl bg-white/80 text-black hover:bg-white focus:bg-white/80 text-black border border-white/80 focus:border-violet-500 text-black placeholder-slate-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block font-semibold text-black mb-1">Initial Assignee</label>
              <select
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/80 text-black border border-white/80 text-black focus:outline-none"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.roleTitle})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-black mb-1">Attachment File Name</label>
            <input
              type="text"
              value={attachmentName}
              onChange={e => setAttachmentName(e.target.value)}
              placeholder="e.g. Requirements.doc"
              className="w-full px-3 py-2 rounded-xl bg-white/80 text-black hover:bg-white focus:bg-white/80 text-black border border-white/80 focus:border-violet-500 text-black placeholder-slate-400 focus:outline-none transition"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-black hover:text-black hover:bg-slate-100 rounded-xl font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 glass-liquid-cta rounded-xl font-bold text-black transition cursor-pointer"
            >
              Create Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. New Task Modal
export const NewTaskModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => void;
  users: UserType[];
  defaultIsMyTask?: boolean;
}> = ({ isOpen, onClose, onSubmit, users, defaultIsMyTask = true }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [dueDate, setDueDate] = useState('May 25, 2024');
  const [assigneeId, setAssigneeId] = useState(defaultIsMyTask ? users[0]?.id : users[1]?.id || users[0]?.id);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const assignee = users.find(u => u.id === assigneeId) || users[0];
    onSubmit({
      title,
      description,
      priority,
      status: 'PENDING',
      dueDate,
      assigneeId: assignee.id,
      assigneeName: assignee.name,
      category: 'Operations',
      isMyTask: assignee.id === users[0]?.id
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 select-none">
      <div className="glass-liquid-window bg-white/95 rounded-3xl p-6  shadow-[0_25px_60px_-15px_rgba(15,23,42,0.14),0_0_40px_rgba(119,56,255,0.08)] border border-white/20 text-black animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80">
          <h3 className="text-sm font-bold text-black flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400"></span>
            <span>Create New Task</span>
          </h3>
          <button onClick={onClose} className="p-1 text-black hover:text-black rounded-lg hover:bg-slate-100 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-4 text-xs">
          <div>
            <label className="block font-semibold text-black mb-1">Task Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Review updated employment agreement"
              className="w-full px-3 py-2 rounded-xl bg-white/80 text-black hover:bg-white focus:bg-white/80 text-black border border-white/80 focus:border-violet-500 text-black placeholder-slate-400 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block font-semibold text-black mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide context or action items..."
              className="w-full px-3 py-2 rounded-xl bg-white/80 text-black hover:bg-white focus:bg-white/80 text-black border border-white/80 focus:border-violet-500 text-black placeholder-slate-400 focus:outline-none transition resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-black mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-xl bg-white/80 text-black border border-white/80 text-black focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-black mb-1">Due Date</label>
              <input
                type="text"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/80 text-black hover:bg-white focus:bg-white/80 text-black border border-white/80 focus:border-violet-500 text-black placeholder-slate-400 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-black mb-1">Assignee</label>
            <select
              value={assigneeId}
              onChange={e => setAssigneeId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/80 text-black border border-white/80 text-black focus:outline-none"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.roleTitle})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-black hover:text-black hover:bg-slate-100 rounded-xl font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 glass-liquid-cta rounded-xl font-bold text-black transition cursor-pointer"
            >
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. New Meeting Modal
export const NewMeetingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (meetingData: any) => void;
  users: UserType[];
}> = ({ isOpen, onClose, onSubmit, users }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dayLabel, setDayLabel] = useState('WED 18');
  const [date, setDate] = useState('2024-05-18');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [location, setLocation] = useState('Conference Room Alpha');
  const [colorBar, setColorBar] = useState('#8b5cf6');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title,
      description,
      dayLabel,
      date,
      startTime,
      endTime,
      location,
      colorBar,
      participants: ['Peter Malby', 'Arthur Adelk'],
      status: 'UPCOMING'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 select-none">
      <div className="glass-liquid-window bg-white/95 rounded-3xl p-6  shadow-[0_25px_60px_-15px_rgba(15,23,42,0.14),0_0_40px_rgba(119,56,255,0.08)] border border-white/20 text-black animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80">
          <h3 className="text-sm font-bold text-black flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400"></span>
            <span>Schedule Meeting</span>
          </h3>
          <button onClick={onClose} className="p-1 text-black hover:text-black rounded-lg hover:bg-slate-100 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-4 text-xs">
          <div>
            <label className="block font-semibold text-black mb-1">Meeting Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Directorate Planning Session"
              className="w-full px-3 py-2 rounded-xl bg-white/80 text-black hover:bg-white focus:bg-white/80 text-black border border-white/80 focus:border-violet-500 text-black placeholder-slate-400 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-black mb-1">Day Tag (e.g. MON 16)</label>
              <input
                type="text"
                value={dayLabel}
                onChange={e => setDayLabel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/80 text-black hover:bg-white focus:bg-white/80 text-black border border-white/80 focus:border-violet-500 text-black placeholder-slate-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block font-semibold text-black mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/80 text-black hover:bg-white focus:bg-white/80 text-black border border-white/80 focus:border-violet-500 text-black placeholder-slate-400 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-black mb-1">Start Time</label>
              <input
                type="text"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                placeholder="09:00"
                className="w-full px-3 py-2 rounded-xl bg-white/80 text-black hover:bg-white focus:bg-white/80 text-black border border-white/80 focus:border-violet-500 text-black placeholder-slate-400 focus:outline-none transition font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-black mb-1">End Time</label>
              <input
                type="text"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                placeholder="10:30"
                className="w-full px-3 py-2 rounded-xl bg-white/80 text-black hover:bg-white focus:bg-white/80 text-black border border-white/80 focus:border-violet-500 text-black placeholder-slate-400 focus:outline-none transition font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-black mb-1">Color Accent</label>
            <div className="flex items-center gap-3">
              {[
                { hex: '#8b5cf6', label: 'Violet' },
                { hex: '#3b82f6', label: 'Blue' },
                { hex: '#10b981', label: 'Emerald' },
                { hex: '#f59e0b', label: 'Amber' }
              ].map(c => (
                <button
                  type="button"
                  key={c.hex}
                  onClick={() => setColorBar(c.hex)}
                  className={`w-6 h-6 rounded-full transition cursor-pointer ${
                    colorBar === c.hex ? 'ring-2 ring-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.4)]' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  aria-label={c.label}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-black hover:text-black hover:bg-slate-100 rounded-xl font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 glass-liquid-cta rounded-xl font-bold text-black transition cursor-pointer"
            >
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 4. Upload Document Modal
export const UploadDocumentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [docName, setDocName] = useState('');
  const [category, setCategory] = useState<'Policy' | 'Onboarding' | 'Template' | 'Contract' | 'Grievance'>('Contract');
  const [folder, setFolder] = useState('Company Policies');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', docName || (selectedFile ? selectedFile.name : 'Document.pdf'));
    fd.append('category', category);
    fd.append('folder', folder);
    if (selectedFile) {
      fd.append('file', selectedFile);
    }
    onSubmit(fd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 select-none">
      <div className="glass-liquid-window bg-white/95 rounded-3xl p-6  shadow-[0_25px_60px_-15px_rgba(15,23,42,0.14),0_0_40px_rgba(119,56,255,0.08)] border border-white/20 text-black animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80">
          <h3 className="text-sm font-bold text-black flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400"></span>
            <span>Upload to Repository</span>
          </h3>
          <button onClick={onClose} className="p-1 text-black hover:text-black rounded-lg hover:bg-slate-100 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-4 text-xs">
          <div>
            <label className="block font-semibold text-black mb-1">Document Name</label>
            <input
              type="text"
              value={docName}
              onChange={e => setDocName(e.target.value)}
              placeholder="e.g. Arbitration_Settlement_Draft.doc"
              className="w-full px-3 py-2 rounded-xl bg-white/80 text-black hover:bg-white focus:bg-white/80 text-black border border-white/80 focus:border-violet-500 text-black placeholder-slate-400 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-black mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white/80 text-black border border-white/80 text-black focus:outline-none"
              >
                <option value="Policy">Policy</option>
                <option value="Contract">Contract</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Grievance">Grievance</option>
                <option value="Template">Template</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-black mb-1">Folder</label>
              <select
                value={folder}
                onChange={e => setFolder(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/80 text-black border border-white/80 text-black focus:outline-none"
              >
                <option value="Company Policies">Company Policies</option>
                <option value="Staff Records">Staff Records</option>
                <option value="Regional Deployments">Regional Deployments</option>
                <option value="Onboarding Packages">Onboarding Packages</option>
                <option value="Talent & Training">Talent & Training</option>
              </select>
            </div>
          </div>

          <div className="p-4 border-2 border-dashed border-violet-500/30 rounded-2xl bg-violet-950/20 text-center">
            <Upload className="w-6 h-6 text-violet-400 mx-auto mb-1" />
            <span className="text-xs font-semibold text-black block">
              {selectedFile ? selectedFile.name : 'Select or drag local file'}
            </span>
            <span className="text-[10px] text-black block mt-0.5">
              Supports .doc, .docx, .pdf, .xlsx up to 25MB
            </span>
            <input
              type="file"
              className="mt-2 text-xs text-black file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-violet-600/30 file:text-violet-200 hover:file:bg-violet-600/50"
              onChange={e => {
                if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
              }}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-black hover:text-black hover:bg-slate-100 rounded-xl font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 glass-liquid-cta rounded-xl font-bold text-black transition cursor-pointer"
            >
              Upload Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 5. LAN Information Modal
export const LanInfoModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  lanInfo: any;
}> = ({ isOpen, onClose, lanInfo }) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const url = lanInfo?.accessUrls?.[0] || 'http://192.168.1.100:3000';

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 select-none">
      <div className="glass-liquid-window bg-white/95 rounded-3xl p-6  shadow-[0_25px_60px_-15px_rgba(15,23,42,0.14),0_0_40px_rgba(119,56,255,0.08)] border border-white/20 text-black animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse"></span>
            <h3 className="text-sm font-bold text-black">Office LAN Server Active</h3>
          </div>
          <button onClick={onClose} className="p-1 text-black hover:text-black rounded-lg hover:bg-slate-100 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 pt-4 text-xs">
          <p className="text-black leading-relaxed">
            NYA HR Central is operating on the Ghana Youth Authority local network. Any authorized workstation or tablet connected to the Head Office or Regional Secretariat LAN can open the application:
          </p>

          <div className="p-3 bg-violet-950/30 rounded-2xl border border-violet-500/30 flex items-center justify-between">
            <span className="font-mono font-bold text-violet-300 text-sm">{url}</span>
            <button
              onClick={copyUrl}
              className="flex items-center gap-1 px-2.5 py-1 bg-white/[0.08] hover:bg-white/[0.15] border border-white/80 rounded-lg text-black font-medium transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-black" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <div className="space-y-1.5 text-[11px] text-black">
            <div>• Real-time: <strong className="text-black">Socket.IO LAN Engine</strong></div>
            <div>• Internet Requirement: <strong className="text-black">None (100% Offline Compatible)</strong></div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/[0.08] hover:bg-white/[0.15] text-black rounded-xl font-bold border border-white/80 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 6. New Announcement Modal
export const NewAnnouncementModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    content: string;
    category: Announcement['category'];
    priority: Priority;
    pinned: boolean;
    isDraft: boolean;
    expiryDate?: string;
  }) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Announcement['category']>('General');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [pinned, setPinned] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [expiryDate, setExpiryDate] = useState('2026-12-31');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSubmit({
      title,
      content,
      category,
      priority,
      pinned,
      isDraft,
      expiryDate: expiryDate || undefined
    });
    setTitle('');
    setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 select-none">
      <div className="glass-liquid-window bg-white/95 rounded-3xl p-6  shadow-[0_25px_60px_-15px_rgba(15,23,42,0.14),0_0_40px_rgba(119,56,255,0.08)] border border-white/20 text-black animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-black">Publish Departmental Notice</h3>
          </div>
          <button onClick={onClose} className="p-1 text-black hover:text-black rounded-lg hover:bg-slate-100 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-4 text-xs">
          <div>
            <label className="block font-semibold text-black mb-1">Notice Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. 2026 Promotion Cycle Schedule & Requirements"
              required
              className="w-full px-3 py-2 rounded-xl bg-white/80 text-black hover:bg-white focus:bg-white/80 text-black border border-white/80 focus:border-violet-500 text-black placeholder-slate-400 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-black mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white/80 text-black border border-white/80 text-black focus:outline-none"
              >
                <option value="General">General</option>
                <option value="Policy Update">Policy Update</option>
                <option value="Emergency">Emergency</option>
                <option value="Holiday">Holiday</option>
                <option value="Benefits">Benefits</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-black mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white/80 text-black border border-white/80 text-black focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-black mb-1">Expiry Date (Optional)</label>
            <input
              type="date"
              value={expiryDate}
              onChange={e => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/80 text-black hover:bg-white focus:bg-white/80 text-black border border-white/80 focus:border-violet-500 text-black placeholder-slate-400 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block font-semibold text-black mb-1">Content / Memo Text</label>
            <textarea
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Full details of the notice, guidelines, and compliance expectations..."
              required
              className="w-full px-3 py-2 rounded-xl bg-white/80 text-black hover:bg-white focus:bg-white/80 text-black border border-white/80 focus:border-violet-500 text-black placeholder-slate-400 focus:outline-none transition resize-none"
            />
          </div>

          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-black">
              <input
                type="checkbox"
                checked={pinned}
                onChange={e => setPinned(e.target.checked)}
                className="rounded text-violet-600 focus:ring-violet-500"
              />
              <span>Pin to top of bulletin</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-medium text-black">
              <input
                type="checkbox"
                checked={isDraft}
                onChange={e => setIsDraft(e.target.checked)}
                className="rounded text-violet-600 focus:ring-violet-500"
              />
              <span>Save as Draft (Don't broadcast yet)</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-black hover:text-black hover:bg-slate-100 rounded-xl font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 glass-liquid-cta rounded-xl font-bold text-black transition cursor-pointer"
            >
              {isDraft ? 'Save Draft' : 'Publish Notice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 7. New User Modal
export const NewUserModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: {
    name: string;
    email: string;
    username: string;
    initialPassword?: string;
    mustChangePassword?: boolean;
    role: UserRole;
    roleTitle: string;
    department: string;
    avatarText: string;
    avatarBg: string;
    status: 'ACTIVE' | 'INACTIVE';
  }) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [initialPassword, setInitialPassword] = useState('Staff@2026!NYA');
  const [mustChangePassword, setMustChangePassword] = useState(true);
  const [role, setRole] = useState<UserRole>('HR_OFFICER');
  const [roleTitle, setRoleTitle] = useState('Personnel Officer');
  const [department, setDepartment] = useState('Human Resources Directorate');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const initials = name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'NY';

    const colors = ['#7c3aed', '#6366f1', '#0ea5e9', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];
    const avatarBg = colors[Math.floor(Math.random() * colors.length)];

    const assignedUsername = username.trim() || email.split('@')[0] || name.toLowerCase().replace(/\s+/g, '.');

    onSubmit({
      name: name.trim(),
      email: email.trim(),
      username: assignedUsername,
      initialPassword: initialPassword || 'Staff@2026!NYA',
      mustChangePassword,
      role,
      roleTitle,
      department,
      avatarText: initials,
      avatarBg,
      status: 'ACTIVE'
    });

    setName('');
    setEmail('');
    setUsername('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 select-none">
      <div className="glass-liquid-window bg-white/95 rounded-3xl p-6  shadow-[0_25px_60px_-15px_rgba(15,23,42,0.14),0_0_40px_rgba(119,56,255,0.08)] border border-white/20 text-black animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-black">Provision Authorized Staff Account</h3>
          </div>
          <button onClick={onClose} className="p-1 text-black hover:text-black rounded-lg hover:bg-slate-100 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-4 text-xs">
          <div>
            <label className="block font-semibold text-black mb-1">Full Official Name</label>
            <input
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (!username) {
                  setUsername(e.target.value.toLowerCase().replace(/\s+/g, '.'));
                }
              }}
              placeholder="e.g. Nana Yaw Boateng"
              required
              className="w-full px-3 py-2 rounded-xl bg-white/80 text-black hover:bg-white focus:bg-white/80 text-black border border-white/80 focus:border-violet-500 text-black placeholder-slate-400 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-black mb-1">Official Email</label>
              <input
                type="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (!username && e.target.value.includes('@')) {
                    setUsername(e.target.value.split('@')[0]);
                  }
                }}
                placeholder="e.g. n.boateng@nya.gov.gh"
                required
                className="w-full px-3 py-2 rounded-xl bg-white/80 text-black hover:bg-white focus:bg-white/80 text-black border border-white/80 focus:border-violet-500 text-black placeholder-slate-400 focus:outline-none transition font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block font-semibold text-black mb-1">Assigned Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. n.boateng"
                required
                className="w-full px-3 py-2 rounded-xl bg-white/80 text-black hover:bg-white focus:bg-white/80 text-black border border-white/80 focus:border-violet-500 text-black placeholder-slate-400 focus:outline-none transition font-mono text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-black mb-1">Initial Temporary Password</label>
            <input
              type="text"
              value={initialPassword}
              onChange={e => setInitialPassword(e.target.value)}
              placeholder="e.g. Staff@2026!NYA"
              required
              className="w-full px-3 py-2 rounded-xl bg-white/80 text-black border border-white/80 text-emerald-700 font-mono font-bold focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-black mb-1">System Role</label>
              <select
                value={role}
                onChange={e => {
                  const r = e.target.value as UserRole;
                  setRole(r);
                  if (r === 'HR_ADMIN') setRoleTitle('Head of HR & Operations');
                  else if (r === 'HR_MANAGER') setRoleTitle('Principal HR Officer');
                  else if (r === 'HR_SPECIALIST') setRoleTitle('Regional HR Coordinator');
                  else if (r === 'HR_OFFICER') setRoleTitle('Senior Personnel Officer');
                  else if (r === 'HR_DIRECTOR') setRoleTitle('Director of Human Resources');
                }}
                className="w-full px-3 py-2 rounded-xl bg-white/80 text-black border border-white/80 text-black focus:outline-none"
              >
                <option value="HR_OFFICER">HR Officer</option>
                <option value="HR_SPECIALIST">HR Specialist</option>
                <option value="HR_MANAGER">HR Manager</option>
                <option value="HR_ADMIN">HR Administrator</option>
                <option value="HR_DIRECTOR">HR Director</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-black mb-1">Role Title</label>
              <input
                type="text"
                value={roleTitle}
                onChange={e => setRoleTitle(e.target.value)}
                placeholder="Job Designation"
                required
                className="w-full px-3 py-2 rounded-xl bg-white/80 text-black hover:bg-white focus:bg-white/80 text-black border border-white/80 focus:border-violet-500 text-black placeholder-slate-400 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-black mb-1">Directorate / Unit</label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/80 text-black border border-white/80 text-black focus:outline-none"
            >
              <option value="Human Resources Directorate">Human Resources Directorate</option>
              <option value="Talent & Youth Development">Talent & Youth Development</option>
              <option value="Regional Operations Directorate">Regional Operations Directorate</option>
              <option value="Staff Welfare & NSSP Coordination">Staff Welfare & NSSP Coordination</option>
              <option value="YLSTI Training Centers">YLSTI Training Centers</option>
              <option value="Legal & Compliance Directorate">Legal & Compliance Directorate</option>
              <option value="Executive Secretariat">Executive Secretariat</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer font-medium text-black pt-1">
            <input
              type="checkbox"
              checked={mustChangePassword}
              onChange={e => setMustChangePassword(e.target.checked)}
              className="rounded text-violet-600 focus:ring-violet-500"
            />
            <span>Require password change upon initial login</span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-black hover:text-black hover:bg-slate-100 rounded-xl font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 glass-liquid-cta rounded-xl font-bold text-black transition cursor-pointer"
            >
              Provision Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 8. New Conversation Modal
export const NewConversationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; isGroup: boolean; participantIds: string[] }) => void;
  users: UserType[];
  currentUserId: string;
}> = ({ isOpen, onClose, onSubmit, users, currentUserId }) => {
  const [name, setName] = useState('');
  const [isGroup, setIsGroup] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const otherUsers = users.filter(u => u.id !== currentUserId);

  const toggleUser = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    const convName = isGroup
      ? (name.trim() || 'Group Collaboration')
      : (otherUsers.find(u => u.id === selectedIds[0])?.name || 'Direct Chat');

    onSubmit({
      name: convName,
      isGroup,
      participantIds: selectedIds
    });
    setName('');
    setSelectedIds([]);
    setIsGroup(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 select-none">
      <div className="glass-liquid-window bg-white/95 rounded-3xl p-6  shadow-[0_25px_60px_-15px_rgba(15,23,42,0.14),0_0_40px_rgba(119,56,255,0.08)] border border-white/20 text-black animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-black">Start New LAN Conversation</h3>
          </div>
          <button onClick={onClose} className="p-1 text-black hover:text-black rounded-lg hover:bg-slate-100 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-4 text-xs">
          <div className="flex items-center gap-2 p-1.5 bg-white/80 text-black rounded-xl border border-white/80">
            <button
              type="button"
              onClick={() => setIsGroup(false)}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer text-center ${
                !isGroup ? 'bg-violet-600/30 text-black border border-violet-400/40 shadow-xs' : 'text-black hover:text-black'
              }`}
            >
              Direct Message
            </button>
            <button
              type="button"
              onClick={() => setIsGroup(true)}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer text-center ${
                isGroup ? 'bg-violet-600/30 text-black border border-violet-400/40 shadow-xs' : 'text-black hover:text-black'
              }`}
            >
              Group Channel
            </button>
          </div>

          {isGroup && (
            <div>
              <label className="block font-semibold text-black mb-1">Group Channel Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Promotions Taskforce 2026"
                required={isGroup}
                className="w-full px-3 py-2 rounded-xl bg-white/80 text-black hover:bg-white focus:bg-white/80 text-black border border-white/80 focus:border-violet-500 text-black placeholder-slate-400 focus:outline-none transition"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-black mb-1">
              Select Participants ({selectedIds.length} selected)
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1.5 border border-white/80 rounded-xl p-2 bg-white/80 text-black/50">
              {otherUsers.map(u => {
                const isSelected = selectedIds.includes(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      if (!isGroup) {
                        setSelectedIds([u.id]);
                      } else {
                        toggleUser(u.id);
                      }
                    }}
                    className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition ${
                      isSelected ? 'bg-violet-600/25 border border-violet-400/30' : 'hover:bg-white/80 text-black'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-black text-[10px] font-bold"
                      style={{ backgroundColor: u.avatarBg }}
                    >
                      {u.avatarText}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-black text-[11px] truncate">{u.name}</div>
                      <div className="text-[10px] text-black truncate">{u.roleTitle}</div>
                    </div>
                    <input
                      type={isGroup ? 'checkbox' : 'radio'}
                      checked={isSelected}
                      readOnly
                      className="text-violet-600 focus:ring-violet-500 rounded"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-black hover:text-black hover:bg-slate-100 rounded-xl font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedIds.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 text-black rounded-xl font-bold shadow-[0_0_18px_rgba(124,58,237,0.4)] border border-violet-400/30 transition cursor-pointer"
            >
              Start Conversation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 9. Document Preview Modal
export const DocumentPreviewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  onDownload: (doc: DocumentItem) => void;
}> = ({ isOpen, onClose, document: doc, onDownload }) => {
  if (!isOpen || !doc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 select-none">
      <div className="glass-liquid-window bg-white/95 rounded-3xl p-6  shadow-[0_25px_60px_-15px_rgba(15,23,42,0.14),0_0_40px_rgba(119,56,255,0.08)] border border-white/20 text-black animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-black truncate max-w-[340px]">{doc.name}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-black hover:text-black rounded-lg hover:bg-slate-100 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 pt-4 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-white/80 text-black rounded-2xl border border-white/80">
            <div>
              <span className="text-[11px] font-semibold text-black block">Category</span>
              <span className="font-bold text-black">{doc.category}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-black block">Folder</span>
              <span className="font-bold text-black">{doc.folder}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-black block">File Size & Version</span>
              <span className="font-bold text-violet-700 font-mono font-semibold">{doc.fileSize} ({doc.version})</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-black block">Uploaded By</span>
              <span className="font-bold text-black">{doc.uploadedBy} · {doc.uploadedAt}</span>
            </div>
          </div>

          <div className="p-3.5 border border-white/80 rounded-2xl bg-white/80 text-black/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-black text-[11px]">Authorized Access Policy</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-400/30 font-bold">
                Protected LAN Document
              </span>
            </div>
            <p className="text-[11px] text-black leading-relaxed">
              This document is classified under National Youth Authority internal administrative protocols. It is verified and stored in the departmental repository. Downloads are monitored and logged to the central audit trail.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
            <span className="text-[11px] text-black">
              Downloaded {doc.downloadCount} times
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-black hover:text-black hover:bg-slate-100 rounded-xl font-semibold transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onDownload(doc);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 glass-liquid-cta rounded-xl font-bold text-black transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Secure File</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 10. Change Password Modal (Self-service authenticated user)
export const ChangePasswordModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ isOpen, onClose, onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update password.");
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onSuccess();
      onClose();
    } catch (err) {
      setError("Network or LAN connection issue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 select-none">
      <div className="glass-liquid-window bg-white/95 rounded-3xl p-6  shadow-[0_25px_60px_-15px_rgba(15,23,42,0.14),0_0_40px_rgba(119,56,255,0.08)] border border-white/20 text-black animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-black">Change Account Security Password</h3>
          </div>
          <button onClick={onClose} className="p-1 text-black hover:text-black rounded-lg hover:bg-slate-100 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-4 text-xs">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-black mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 rounded-xl bg-white/80 text-black hover:bg-white focus:bg-white/80 text-black border border-white/80 focus:border-violet-500 text-black placeholder-slate-400 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block font-semibold text-black mb-1">New Password (min. 8 characters)</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 rounded-xl bg-white/80 text-black hover:bg-white focus:bg-white/80 text-black border border-white/80 focus:border-violet-500 text-black placeholder-slate-400 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block font-semibold text-black mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 rounded-xl bg-white/80 text-black hover:bg-white focus:bg-white/80 text-black border border-white/80 focus:border-violet-500 text-black placeholder-slate-400 focus:outline-none transition"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-black hover:text-black hover:bg-slate-100 rounded-xl font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 glass-liquid-cta rounded-xl font-bold text-black transition cursor-pointer disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 11. Admin Reset Password Modal
export const AdminResetPasswordModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  targetUser: UserType | null;
  onResetComplete: (tempPassword: string) => void;
}> = ({ isOpen, onClose, targetUser, onResetComplete }) => {
  const [temporaryPassword, setTemporaryPassword] = useState('Staff@' + Math.floor(1000 + Math.random() * 9000));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !targetUser) return null;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!temporaryPassword.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temporaryPassword: temporaryPassword.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
        return;
      }

      onResetComplete(temporaryPassword.trim());
      onClose();
    } catch (err) {
      setError("Network or LAN connection issue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 select-none">
      <div className="glass-liquid-window bg-white/95 rounded-3xl p-6  shadow-[0_25px_60px_-15px_rgba(15,23,42,0.14),0_0_40px_rgba(119,56,255,0.08)] border border-white/20 text-black animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-black">Administrator Password Reset</h3>
          </div>
          <button onClick={onClose} className="p-1 text-black hover:text-black rounded-lg hover:bg-slate-100 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleReset} className="space-y-3.5 pt-4 text-xs">
          <div className="p-3 bg-white/80 text-black border border-white/80 rounded-xl">
            <div className="font-bold text-black text-xs">{targetUser.name}</div>
            <div className="text-[11px] text-black font-mono">{targetUser.email}</div>
            <div className="text-[10px] text-violet-700 mt-1">
              Resetting credentials will clear any failed login lockouts and assign a new temporary password.
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-black mb-1">Temporary Assigned Password</label>
            <input
              type="text"
              value={temporaryPassword}
              onChange={e => setTemporaryPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-white/80 text-black border border-white/80 font-mono text-emerald-700 font-bold focus:outline-none"
            />
            <p className="text-[10px] text-black mt-1">
              Provide this temporary password securely to the employee via official internal channels.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-black hover:text-black hover:bg-slate-100 rounded-xl font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 glass-liquid-cta rounded-xl font-bold text-black transition cursor-pointer disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Issue Password Reset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
