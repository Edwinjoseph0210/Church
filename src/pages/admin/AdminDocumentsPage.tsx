import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { ParishDocument, Organization } from '../../types';
import { FileText, Plus, Trash2, X, Save, Lock, Download, ShieldCheck } from 'lucide-react';

export const AdminDocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<ParishDocument[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'PARISH_DOCS' | 'MEMBER_UPLOADS'>('PARISH_DOCS');

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: ParishDocument['category'];
    fileName: string;
    fileSize: string;
    visibility: ParishDocument['visibility'];
    organizationId: string;
  }>({
    title: '',
    description: '',
    category: 'PARISH_NOTICE',
    fileName: '',
    fileSize: '450 KB',
    visibility: 'PUBLIC',
    organizationId: '',
  });

  const loadData = async () => {
    try {
      const [dRes, oRes] = await Promise.all([
        apiRequest<ParishDocument[]>('/documents'),
        apiRequest<Organization[]>('/organizations'),
      ]);
      setDocuments(dRes);
      setOrganizations(oRes);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setFormData({
      title: '',
      description: '',
      category: 'PARISH_NOTICE',
      fileName: 'parish_document.pdf',
      fileSize: '520 KB',
      visibility: 'PUBLIC',
      organizationId: '',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest<ParishDocument>('/documents', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to upload document');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this document?')) return;
    try {
      await apiRequest(`/documents/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to archive');
    }
  };

  const handleVerify = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await apiRequest(`/documents/${id}/verify`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update verification status');
    }
  };

  const parishDocs = documents.filter((d) => !d.memberId && !d.category?.startsWith('BAPTISM'));
  const memberUploads = documents.filter((d) => d.memberId || d.category?.startsWith('BAPTISM') || d.category?.startsWith('MARRIAGE') || d.category === 'MEMBER_SUBMISSION');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
            File & Document Repository
          </span>
          <h1 className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
            Parish Documents & Member Uploads
          </h1>
          <p className="text-xs text-stone-500 font-editorial">
            Manage official forms, sacramental certificates, and review member-submitted records for register inclusion.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Official Document</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('PARISH_DOCS')}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'PARISH_DOCS'
              ? 'border-amber-900 text-amber-950'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Official Parish Documents</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-stone-100 text-stone-700 font-mono">
            {parishDocs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('MEMBER_UPLOADS')}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'MEMBER_UPLOADS'
              ? 'border-amber-900 text-amber-950'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Member Uploads & Submissions</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 font-mono font-bold">
            {memberUploads.length}
          </span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        {activeTab === 'PARISH_DOCS' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Title & Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Visibility Level</th>
                  <th className="py-3 px-4">Upload Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-editorial">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-500">
                      Loading document index...
                    </td>
                  </tr>
                ) : parishDocs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-500">
                      No official documents listed.
                    </td>
                  </tr>
                ) : (
                  parishDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-sans font-semibold text-stone-900 block">
                          {doc.title}
                        </span>
                        <span className="text-[11px] text-stone-500 line-clamp-1">
                          {doc.description}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-sans text-stone-700">
                        {doc.category.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-stone-600">
                        {doc.fileName} ({doc.fileSize})
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          doc.visibility === 'PUBLIC'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.visibility === 'MEMBERS_ONLY'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {doc.visibility}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-stone-500">
                        {doc.uploadDate}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleArchive(doc.id)}
                          className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-md cursor-pointer"
                          title="Archive Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* MEMBER UPLOADS TAB */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Submitted By</th>
                  <th className="py-3 px-4">Document Title & Notes</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">File Details</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-editorial">
                {memberUploads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-500">
                      No member-uploaded documents pending review.
                    </td>
                  </tr>
                ) : (
                  memberUploads.map((doc) => (
                    <tr key={doc.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-sans font-semibold text-stone-900 block">
                          {doc.memberName || doc.uploadedBy}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          ID: {doc.memberId || 'Parishioner'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-sans font-semibold text-stone-900 block">
                          {doc.title}
                        </span>
                        <span className="text-[11px] text-stone-500 line-clamp-2">
                          {doc.description || doc.notes || 'No remarks provided'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-sans text-stone-700">
                        <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 text-[10px] font-semibold">
                          {doc.category.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-stone-600">
                        <div>{doc.fileName}</div>
                        <div className="text-[10px] text-stone-400">{doc.fileSize} · {doc.uploadDate}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {doc.verificationStatus === 'VERIFIED' ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Pending Verification
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {doc.verificationStatus !== 'VERIFIED' && (
                          <button
                            onClick={() => handleVerify(doc.id, 'VERIFIED')}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold cursor-pointer"
                          >
                            Verify / Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleArchive(doc.id)}
                          className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-md cursor-pointer"
                          title="Remove Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Upload Official Parish Document
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parish General Body Minutes"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Document Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  >
                    <option value="PARISH_NOTICE">Parish Notice</option>
                    <option value="FORM">Registration / Sacramental Form</option>
                    <option value="CATECHISM">Catechetical Study Material</option>
                    <option value="MEETING_MINUTES">Meeting Minutes & Records</option>
                    <option value="SACRAMENTAL_GUIDE">Sacramental Guide</option>
                    <option value="FINANCIAL">Finance & Accounts</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Access Permission (Visibility) *
                  </label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  >
                    <option value="PUBLIC">Public (Available to All)</option>
                    <option value="MEMBERS_ONLY">Parish Members Only</option>
                    <option value="ADMIN_ONLY">Admin & Priest Only</option>
                    <option value="ORGANIZATION_ONLY">Specific Organization Only</option>
                  </select>
                </div>
              </div>

              {formData.visibility === 'ORGANIZATION_ONLY' && (
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Restricted Organization
                  </label>
                  <select
                    value={formData.organizationId}
                    onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  >
                    <option value="">Select organization...</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    File Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="document_name.pdf"
                    value={formData.fileName}
                    onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    File Size Estimate
                  </label>
                  <input
                    type="text"
                    value={formData.fileSize}
                    onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of document contents..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Uploading...' : 'Save Document'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
