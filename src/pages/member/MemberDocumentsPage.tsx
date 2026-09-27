import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { ParishDocument } from '../../types';
import { FileText, Download, ShieldCheck, Lock, AlertCircle } from 'lucide-react';

export const MemberDocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<ParishDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDocs() {
      try {
        const data = await apiRequest<ParishDocument[]>('/documents');
        setDocuments(data);
      } catch (err) {
        console.error('Failed to load documents:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  }, []);

  const handleDownload = async (doc: ParishDocument) => {
    setDownloadingId(doc.id);
    setDownloadError(null);
    try {
      const token = localStorage.getItem('stm_parish_token');
      const res = await fetch(`/api/documents/${doc.id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Download failed due to authorization restriction.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setDownloadError(err.message || 'Unable to download document.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
            Parish Resource Archives
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            Parish Forms & Documents
          </h1>
          <p className="text-xs text-stone-500 font-editorial mt-0.5">
            Download authorized church forms, Sunday catechism enrollment materials, meeting summaries, and sacramental guidelines.
          </p>
        </div>
      </div>

      {downloadError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{downloadError}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-stone-500">
          Loading documents...
        </div>
      ) : documents.length === 0 ? (
        <div className="p-12 text-center text-xs text-stone-500">
          No documents available in this category.
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-800/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-sm font-bold text-stone-900">
                      {doc.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-stone-200 text-stone-600">
                      {doc.visibility}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 font-editorial">
                    {doc.description}
                  </p>
                  <div className="text-[11px] text-stone-400 font-mono pt-0.5">
                    {doc.fileName} · {doc.fileSize} · Uploaded: {doc.uploadDate}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  disabled={downloadingId === doc.id}
                  onClick={() => handleDownload(doc)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloadingId === doc.id ? 'Verifying...' : 'Download File'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
