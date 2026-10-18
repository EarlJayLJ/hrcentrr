import React, { useState } from 'react';
import { Upload, Download, Folder, FileText, Search, Eye, Trash2, Edit2, Check, X } from 'lucide-react';
import { DocumentItem } from '../types.ts';

interface DocumentsViewProps {
  documents: DocumentItem[];
  onUploadDocument: () => void;
  onDownloadDocument: (doc: DocumentItem) => void;
  onPreviewDocument: (doc: DocumentItem) => void;
  onRenameDocument?: (id: string, newName: string) => void;
  onArchiveDocument?: (id: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
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

  const folders = [
    'ALL',
    'NYA HR Policies & Circulars',
    'NSP & Youth Corps Postings',
    'YLSTI Training Institutes',
    'Civil Service Promotions & Scheme',
    'Legal & Labor Relations'
  ];

  const filteredDocs = documents.filter((doc) => {
    if (selectedFolder !== 'ALL' && doc.folder !== selectedFolder) return false;
    if (searchDoc && !doc.name.toLowerCase().includes(searchDoc.toLowerCase())) return false;
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
          <h2 className="text-base font-bold text-black tracking-wide">
            Document Repository & Knowledge Library
          </h2>
          <p className="text-xs text-black mt-0.5">
            Official NYA policies, NSP deployment directives, YLSTI regulations, and civil service documentation
          </p>
        </div>

        <button
          onClick={onUploadDocument}
          className="flex items-center gap-2 px-4 py-2 glass-liquid-cta rounded-xl text-xs font-bold transition cursor-pointer self-start sm:self-auto"
        >
          <Upload className="w-4 h-4 stroke-[2.5]" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Folders and Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Folder pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {folders.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFolder(f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition cursor-pointer border ${
                selectedFolder === f
                  ? 'glass-liquid-nav-active font-bold'
                  : 'glass-liquid-pill text-black hover:text-black'
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-[#7738FF]" />
              <span>{f}</span>
            </button>
          ))}
        </div>

        {/* Quick search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7738FF]" />
          <input
            type="text"
            value={searchDoc}
            onChange={(e) => setSearchDoc(e.target.value)}
            placeholder="Search documents..."
            className="pl-8 pr-4 py-1.5 bg-white/80 text-black hover:bg-white/[0.07] focus:bg-white/[0.09] text-black placeholder-[#A6B0C8]/50 text-xs rounded-xl border border-white/80 focus:border-[#7738FF] focus:outline-none w-full sm:w-64 transition shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)]"
          />
        </div>
      </div>

      {/* Document Grid / Table */}
      <div className="glass-liquid-tile p-5 rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.05),inset_0_1.5px_2px_rgba(255,255,255,0.95)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-black text-[11px] border-b border-slate-200/80">
                <th className="pb-2.5 font-normal">File Name</th>
                <th className="pb-2.5 font-normal">Category</th>
                <th className="pb-2.5 font-normal">Folder</th>
                <th className="pb-2.5 font-normal">Size</th>
                <th className="pb-2.5 font-normal">Version</th>
                <th className="pb-2.5 font-normal">Uploaded By</th>
                <th className="pb-2.5 font-normal text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-white/[0.035] transition">
                  <td className="py-3 font-semibold text-black">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#7738FF] shrink-0" />
                      {editingId === doc.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="px-2 py-0.5 text-xs rounded border border-[#7738FF] bg-[#050816] text-black focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveRename(doc.id)}
                            className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 text-black hover:text-black cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="truncate max-w-[200px]" title={doc.name}>
                          {doc.name}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.06] text-[#7738FF] border border-slate-200/80">
                      {doc.category}
                    </span>
                  </td>

                  <td className="py-3 text-black">{doc.folder}</td>

                  <td className="py-3 text-black tabular-nums font-mono">{doc.fileSize}</td>

                  <td className="py-3 font-mono text-[11px] text-[#7738FF] font-semibold">
                    {doc.version}
                  </td>

                  <td className="py-3 text-black">
                    <div>{doc.uploadedBy}</div>
                    <div className="text-[10px] text-black font-mono">{doc.uploadedAt}</div>
                  </td>

                  <td className="py-3 text-right pr-2">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleStartRename(doc)}
                        className="p-1.5 text-black hover:text-black hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="Rename file"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onPreviewDocument(doc)}
                        className="p-1.5 text-black hover:text-black hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="Preview Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDownloadDocument(doc)}
                        className="flex items-center gap-1 px-2.5 py-1 glass-btn-secondary hover:border-[#7738FF] rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                        title="Download authorized file"
                      >
                        <Download className="w-3 h-3 text-[#7738FF]" />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => onArchiveDocument?.(doc.id)}
                        className="p-1.5 text-black hover:text-rose-400 hover:bg-rose-500/15 rounded-lg transition cursor-pointer"
                        title="Archive / Soft Delete"
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
            <div className="text-center py-8 text-xs text-black">
              No documents found in this directory.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
