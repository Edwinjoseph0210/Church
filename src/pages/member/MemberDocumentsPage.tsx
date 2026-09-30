import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../services/api';
import { ParishDocument } from '../../types';
import {
  FileText,
  Download,
  Upload,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  AlertCircle,
  FileCheck,
  FolderOpen,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export const MemberDocumentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'MY_UPLOADS' | 'PARISH_FORMS'>('MY_UPLOADS');
  const [parishForms, setParishForms] = useState<ParishDocument[]>([]);
  const [myDocuments, setMyDocuments] = useState<ParishDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<string>('BAPTISM_CERTIFICATE');
  const [uploadNotes, setUploadNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [formsData, myDocsData] = await Promise.all([
        apiRequest<ParishDocument[]>('/documents').catch(() => []),
        apiRequest<ParishDocument[]>('/member/documents/my').catch(() => []),
      ]);
      setParishForms(formsData.filter((d) => !d.category?.startsWith('BAPTISM') && !d.memberId));
      setMyDocuments(myDocsData);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!uploadTitle) {
        // Auto fill title from file name
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setUploadTitle(cleanName);
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = () => {
        setFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      alert('Please enter a document title');
      return;
    }
    if (!selectedFile && !fileBase64) {
      alert('Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadSuccess(null);
    try {
      const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
      };

      await apiRequest<ParishDocument>('/member/documents/upload', {
        method: 'POST',
        body: JSON.stringify({
          title: uploadTitle,
          category: uploadCategory,
          fileName: selectedFile?.name || `${uploadTitle.replace(/\s+/g, '_')}.pdf`,
          fileSize: selectedFile ? formatSize(selectedFile.size) : '1.2 MB',
          notes: uploadNotes,
          fileData: fileBase64,
        }),
      });

      setUploadSuccess('Document successfully uploaded and submitted for Parish verification.');
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadNotes('');
      setSelectedFile(null);
      setFileBase64('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteUpload = async (docId: string) => {
    if (!confirm('Are you sure you want to remove this uploaded document?')) return;
    try {
      await apiRequest(`/member/documents/${docId}`, { method: 'DELETE' });
      setMyDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete document');
    }
  };

  const handleDownload = async (doc: ParishDocument) => {
    setDownloadingId(doc.id);
    setDownloadError(null);
    try {
      if (doc.fileData && doc.fileData.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = doc.fileData;
        a.download = doc.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

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

  const formatCategoryName = (cat: string) => {
    switch (cat) {
      case 'BAPTISM_CERTIFICATE':
        return 'Baptism Certificate';
      case 'MARRIAGE_CERTIFICATE':
        return 'Marriage Certificate';
      case 'FIRST_COMMUNION':
        return 'First Holy Communion';
      case 'CONFIRMATION_CERTIFICATE':
        return 'Confirmation Certificate';
      case 'PARISH_TRANSFER_LETTER':
        return 'Parish Transfer Letter';
      case 'FAMILY_RECORD':
        return 'Family Census Record';
      case 'ID_PROOF':
        return 'Identity Proof / Government ID';
      case 'MEMBER_SUBMISSION':
        return 'General Parish Submission';
      default:
        return cat.replace(/_/g, ' ');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
            Parish Document Center
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            Documents & Certificates
          </h1>
          <p className="text-xs text-stone-500 font-editorial mt-0.5">
            Upload sacramental certificates and family records for parish verification, and download authorized church guidelines.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {uploadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
          <button onClick={() => setUploadSuccess(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {downloadError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{downloadError}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-stone-200 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('MY_UPLOADS')}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'MY_UPLOADS'
              ? 'border-amber-900 text-amber-950'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>My Uploaded Documents</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-stone-100 text-stone-700 font-mono">
            {myDocuments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('PARISH_FORMS')}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'PARISH_FORMS'
              ? 'border-amber-900 text-amber-950'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span>Parish Forms & Guidelines</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-stone-100 text-stone-700 font-mono">
            {parishForms.length}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-stone-500">
          Loading documents...
        </div>
      ) : activeTab === 'MY_UPLOADS' ? (
        /* MY UPLOADED DOCUMENTS */
        myDocuments.length === 0 ? (
          <div className="text-center py-14 px-4 border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-serif text-base font-bold text-stone-900">
                No Documents Uploaded Yet
              </h3>
              <p className="text-xs text-stone-500 font-editorial">
                Upload your Baptism certificate, Marriage certificate, family record, or transfer letter for verification by the Parish Vicar.
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Document Now</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-800/40 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif text-sm font-bold text-stone-900 truncate">
                        {doc.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-200/70 text-stone-800">
                        {formatCategoryName(doc.category)}
                      </span>
                      {doc.verificationStatus === 'VERIFIED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified by Vicar</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" />
                          <span>Pending Verification</span>
                        </span>
                      )}
                    </div>
                    {doc.description && (
                      <p className="text-xs text-stone-600 font-editorial">
                        {doc.description}
                      </p>
                    )}
                    <div className="text-[11px] text-stone-400 font-mono">
                      {doc.fileName} · {doc.fileSize} · Submitted: {doc.uploadDate}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    disabled={downloadingId === doc.id}
                    onClick={() => handleDownload(doc)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => handleDeleteUpload(doc.id)}
                    className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                    title="Remove Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* PARISH RESOURCES & FORMS FOR DOWNLOAD */
        <div className="space-y-3">
          {parishForms.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500">
              No official forms currently listed for download.
            </div>
          ) : (
            parishForms.map((doc) => (
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
                    <span>{downloadingId === doc.id ? 'Verifying...' : 'Download Form'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-stone-900 leading-tight">
                    Upload Parish Document
                  </h2>
                  <p className="text-[11px] text-stone-500 font-editorial">
                    Submit certificates or records to the Parish Vicar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Document Category *
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                >
                  <option value="BAPTISM_CERTIFICATE">Baptism Certificate</option>
                  <option value="MARRIAGE_CERTIFICATE">Marriage Certificate</option>
                  <option value="FIRST_COMMUNION">First Holy Communion Certificate</option>
                  <option value="CONFIRMATION_CERTIFICATE">Confirmation Certificate</option>
                  <option value="PARISH_TRANSFER_LETTER">Parish Transfer Certificate</option>
                  <option value="FAMILY_RECORD">Family Census / Registry Record</option>
                  <option value="ID_PROOF">Government Identity Proof (Aadhaar / Voter ID)</option>
                  <option value="MEMBER_SUBMISSION">General Letter / Request to Vicar</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Baptism Certificate - Eldest Child"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                />
              </div>

              {/* File Attachment Input */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Select File (PDF, Image, or DOC) *
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-200 hover:border-amber-800/60 rounded-xl p-4 text-center cursor-pointer transition-colors bg-stone-50/50"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2 text-stone-800 font-medium">
                      <FileCheck className="w-5 h-5 text-emerald-600" />
                      <span className="font-semibold text-xs">{selectedFile.name}</span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        ({(selectedFile.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-5 h-5 mx-auto text-stone-400" />
                      <div className="text-xs text-stone-600 font-medium">
                        Click to select document file
                      </div>
                      <div className="text-[10px] text-stone-400">
                        Supports PDF, PNG, JPG, DOC up to 10MB
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Notes / Explanation to the Parish Priest
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Enclosing certificate issued by native parish for register update..."
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? 'Uploading...' : 'Submit Document'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
