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
    <div className="space-y-4">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Document Repository & Knowledge Library
          </h2>
          <p className="text-xs text-slate-500">
            Official NYA policies, NSP deployment directives, YLSTI regulations, and civil service files
          </p>
        </div>

        <button
          onClick={onUploadDocument}
          className="flex items-center gap-2 px-4 py-2 bg-[#006b3f] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer self-start sm:self-auto"
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedFolder === f
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-emerald-700" />
              <span>{f}</span>
            </button>
          ))}
        </div>

        {/* Quick search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchDoc}
            onChange={(e) => setSearchDoc(e.target.value)}
            placeholder="Search documents..."
            className="pl-8 pr-4 py-1.5 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Document Grid / Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 text-[11px] border-b border-slate-100">
                <th className="pb-2.5 font-normal">File Name</th>
                <th className="pb-2.5 font-normal">Category</th>
                <th className="pb-2.5 font-normal">Folder</th>
                <th className="pb-2.5 font-normal">Size</th>
                <th className="pb-2.5 font-normal">Version</th>
                <th className="pb-2.5 font-normal">Uploaded By</th>
                <th className="pb-2.5 font-normal text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                      {editingId === doc.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="px-2 py-0.5 text-xs rounded border border-emerald-400 focus:outline-none"
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
                            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
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
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {doc.category}
                    </span>
                  </td>

                  <td className="py-3 text-slate-500">{doc.folder}</td>

                  <td className="py-3 text-slate-400 tabular-nums">{doc.fileSize}</td>

                  <td className="py-3 font-mono text-[11px] text-slate-600">
                    {doc.version}
                  </td>

                  <td className="py-3 text-slate-500">
                    <div>{doc.uploadedBy}</div>
                    <div className="text-[10px] text-slate-400">{doc.uploadedAt}</div>
                  </td>

                  <td className="py-3 text-right pr-2">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleStartRename(doc)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="Rename file"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onPreviewDocument(doc)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="Preview Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDownloadDocument(doc)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-800 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                        title="Download authorized file"
                      >
                        <Download className="w-3 h-3 text-emerald-700" />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => onArchiveDocument?.(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
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
            <div className="text-center py-8 text-xs text-slate-400">
              No documents found in this directory.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
