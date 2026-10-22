import React, { useState } from 'react';
import { Upload, Download, Folder, FileText, Search, Eye, Trash2, Edit2, Check, X, Clock, MessageSquare } from 'lucide-react';
import { DocumentItem } from '../types.ts';

interface DocumentsViewProps {
  documents: DocumentItem[];
  searchQuery?: string;
  onUploadDocument: () => void;
  onDownloadDocument: (doc: DocumentItem) => void;
  onPreviewDocument: (doc: DocumentItem) => void;
  onRenameDocument?: (id: string, newName: string) => void;
  onArchiveDocument?: (id: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  searchQuery = '',
  onUploadDocument,
  onDownloadDocument,
  onPreviewDocument,
  onRenameDocument,
  onArchiveDocument
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string>('ALL');
  const [searchDoc, setSearchDoc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Dynamically include default official folders plus any dynamic folders (e.g. Messages & Shared Files)
  const defaultFolders = [
    'ALL',
    'Messages & Shared Files',
    'NYA HR Policies & Circulars',
    'NSP & Youth Corps Postings',
    'YLSTI Training Institutes',
    'Civil Service Promotions & Scheme',
    'Legal & Labor Relations'
  ];

  const folders = Array.from(new Set([...defaultFolders, ...documents.map(d => d.folder).filter(Boolean)]));

  const effectiveSearch = (searchDoc || searchQuery || '').trim().toLowerCase();

  const filteredDocs = documents.filter((doc) => {
    if (selectedFolder !== 'ALL' && doc.folder !== selectedFolder) return false;
    if (effectiveSearch) {
      const match =
        doc.name.toLowerCase().includes(effectiveSearch) ||
        (doc.category && doc.category.toLowerCase().includes(effectiveSearch)) ||
        (doc.folder && doc.folder.toLowerCase().includes(effectiveSearch)) ||
        (doc.uploadedBy && doc.uploadedBy.toLowerCase().includes(effectiveSearch));
      if (!match) return false;
    }
    return true;
  });

  const handleStartRename = (doc: DocumentItem) => {
    setEditingId(doc.id);
    setEditingName(doc.name);
  };

  const handleSaveRename = (id: string) => {
    if (editingName.trim()) {
      onRenameDocument?.(id, editingName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-4 select-none text-black">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-liquid-tile p-4.5 rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.05),inset_0_1.5px_2px_rgba(255,255,255,0.95)]">
        <div>
          <h2 className="text-base font-bold text-black tracking-wide flex items-center gap-2">
            <span>Document Repository & Knowledge Library</span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              {documents.length} Files
            </span>
          </h2>
          <p className="text-xs text-black mt-0.5 font-medium">
            Official NYA policies, NSP deployment directives, sent dispatches, chat files, and staff documentation
          </p>
        </div>

        <button
          onClick={onUploadDocument}
          className="flex items-center gap-2 px-4 py-2 glass-liquid-cta rounded-xl text-xs font-bold transition cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Upload className="w-4 h-4 stroke-[2.5]" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Main Split Layout: Left Section (Folders & Sent Documents) + Main Table */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Left Section - Folders and Sent Documents Panel */}
        <div className="w-full lg:w-72 xl:w-80 shrink-0 space-y-4">
          {/* Folders List */}
          <div className="glass-liquid-tile p-4 rounded-2xl border border-white/80 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center justify-between">
              <span>Repository Folders</span>
              <Folder className="w-3.5 h-3.5 text-[#7738FF]" />
            </h3>
            <div className="space-y-1">
              {folders.map((f) => {
                const count = f === 'ALL' ? documents.length : documents.filter(d => d.folder === f).length;
                const isSelected = selectedFolder === f;
                return (
                  <button
                    key={f}
                    onClick={() => setSelectedFolder(f)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                      isSelected
                        ? 'glass-liquid-nav-active font-bold text-black scale-[1.01]'
                        : 'bg-transparent border-transparent hover:bg-white/80 text-black'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {f === 'Messages & Shared Files' ? (
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      ) : (
                        <Folder className="w-3.5 h-3.5 text-[#7738FF] shrink-0" />
                      )}
                      <span className="truncate">{f}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono shrink-0 ml-1.5 ${
                      isSelected ? 'bg-black text-white' : 'bg-slate-200 text-black'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Left Section: Recently Sent & Dispatched Documents */}
          <div className="glass-liquid-tile p-4 rounded-2xl border border-white/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#7738FF]" />
                <span>Sent Documents</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono">
                Live Sync
              </span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {documents.slice(0, 6).map((doc) => (
                <div
                  key={doc.id}
                  className="p-2.5 rounded-xl bg-white/70 hover:bg-white border border-slate-200/80 hover:border-[#7738FF]/40 transition space-y-1.5 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-xs text-black truncate" title={doc.name}>
                        {doc.name}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-600 shrink-0 bg-slate-100 px-1.5 py-0.5 rounded">
                      {doc.fileSize}
                    </span>
                  </div>

                  {/* Submitter & Time Details */}
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 min-w-0 text-black font-bold">
                      <div className="w-4 h-4 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center text-[8px] font-bold shrink-0">
                        {doc.uploadedBy ? doc.uploadedBy[0] : 'S'}
                      </div>
                      <span className="truncate">{doc.uploadedBy || 'Staff Member'}</span>
                    </div>
                    <div className="text-[9px] text-slate-700 font-semibold flex items-center gap-1 shrink-0 font-mono">
                      <Clock className="w-2.5 h-2.5 text-[#7738FF]" />
                      <span>{doc.uploadedAt || 'Just now'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-0.5">
                    <button
                      onClick={() => onPreviewDocument(doc)}
                      className="text-[10px] font-bold text-black hover:text-[#7738FF] px-2 py-0.5 rounded hover:bg-slate-100 transition cursor-pointer"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => onDownloadDocument(doc)}
                      className="text-[10px] font-bold text-[#7738FF] hover:text-violet-800 px-2 py-0.5 rounded bg-violet-50 hover:bg-violet-100 transition cursor-pointer flex items-center gap-1"
                    >
                      <Download className="w-2.5 h-2.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}

              {documents.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500 italic">
                  No documents sent yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Search and Full Documents Table */}
        <div className="flex-1 min-w-0 space-y-3 w-full">
          {/* Quick search & filter bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs text-black font-bold">
              Showing <span className="text-[#7738FF] font-mono">{filteredDocs.length}</span> of {documents.length} files
              {selectedFolder !== 'ALL' && <span className="ml-1 text-slate-600">in "{selectedFolder}"</span>}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7738FF]" />
              <input
                type="text"
                value={searchDoc}
                onChange={(e) => setSearchDoc(e.target.value)}
                placeholder="Search documents, submitter..."
                className="pl-8 pr-4 py-1.5 bg-white/80 text-black hover:bg-white focus:bg-white text-black placeholder-slate-500 text-xs rounded-xl border border-white/80 focus:border-[#7738FF] focus:outline-none w-full sm:w-64 transition shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]"
              />
            </div>
          </div>

          {/* Document Table */}
          <div className="glass-liquid-tile p-4 sm:p-5 rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.05),inset_0_1.5px_2px_rgba(255,255,255,0.95)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[640px]">
                <thead>
                  <tr className="text-black text-[11px] border-b border-slate-200/80">
                    <th className="pb-2.5 font-bold text-black">File Name</th>
                    <th className="pb-2.5 font-bold text-black">Category</th>
                    <th className="pb-2.5 font-bold text-black">Folder / Source</th>
                    <th className="pb-2.5 font-bold text-black">Size</th>
                    <th className="pb-2.5 font-bold text-black">Submitted By & Time</th>
                    <th className="pb-2.5 font-bold text-black text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-white/60 transition">
                      <td className="py-3 font-semibold text-black">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                            <FileText className="w-4 h-4 text-[#7738FF]" />
                          </div>
                          {editingId === doc.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="px-2 py-0.5 text-xs rounded border border-[#7738FF] bg-white text-black focus:outline-none"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveRename(doc.id)}
                                className="p-1 text-emerald-600 hover:text-emerald-700 cursor-pointer"
                                title="Save"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1 text-black hover:text-rose-600 cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="min-w-0">
                              <span className="truncate max-w-[220px] block font-bold text-black" title={doc.name}>
                                {doc.name}
                              </span>
                              <span className="text-[10px] text-slate-600 font-mono">
                                {doc.version || 'v1.0'}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-800 border border-violet-200">
                          {doc.category}
                        </span>
                      </td>

                      <td className="py-3 text-black">
                        {doc.folder === 'Messages & Shared Files' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            <MessageSquare className="w-3 h-3 text-blue-600" />
                            <span>Messages & Chat</span>
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-black">{doc.folder}</span>
                        )}
                      </td>

                      <td className="py-3 text-black tabular-nums font-mono font-semibold">{doc.fileSize}</td>

                      {/* SUBMITTED BY & TIME COLUMN */}
                      <td className="py-3 text-black">
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="w-7 h-7 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center text-[10px] font-bold shadow-xs shrink-0 ring-1 ring-white/80"
                            title={`Submitted by ${doc.uploadedBy}`}
                          >
                            {doc.uploadedBy ? doc.uploadedBy.split(' ').map((n: string) => n[0]).slice(0, 2).join('') : 'NY'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-black text-xs truncate leading-tight">
                              {doc.uploadedBy || 'Staff Member'}
                            </div>
                            <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mt-0.5 whitespace-nowrap font-mono">
                              <Clock className="w-3 h-3 text-[#7738FF] shrink-0" />
                              <span>{doc.uploadedAt || 'Just now'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 text-right pr-2">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleStartRename(doc)}
                            className="p-1.5 text-black hover:text-blue-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="Rename file"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onPreviewDocument(doc)}
                            className="p-1.5 text-black hover:text-blue-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="Preview Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDownloadDocument(doc)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 hover:border-[#7738FF] text-black rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
                            title="Download authorized file"
                          >
                            <Download className="w-3 h-3 text-[#7738FF]" />
                            <span>Download</span>
                          </button>
                          <button
                            onClick={() => onArchiveDocument?.(doc.id)}
                            className="p-1.5 text-black hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Archive / Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredDocs.length === 0 && (
                <div className="text-center py-10 text-xs text-black space-y-1">
                  <div className="font-bold text-sm text-slate-800">
                    {documents.length === 0 ? 'No documents uploaded yet.' : 'No documents match your filter.'}
                  </div>
                  <div className="text-slate-600">
                    Upload official directives or send attachments in messages to build the repository.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
