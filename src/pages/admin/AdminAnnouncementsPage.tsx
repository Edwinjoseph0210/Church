import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Announcement } from '../../types';
import { Megaphone, Plus, Edit, Trash2, X, Save, AlertCircle, Calendar } from 'lucide-react';
import { ChurchImagePicker } from '../../components/common/ChurchImagePicker';

export const AdminAnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT' | null>(null);
  const [selectedItem, setSelectedItem] = useState<Announcement | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    category: Announcement['category'];
    priority: Announcement['priority'];
    isImportant: boolean;
    publishDate: string;
    expiryDate: string;
    audience: Announcement['audience'];
    organizationId: string;
    status: Announcement['status'];
    imageUrl: string;
  }>({
    title: '',
    content: '',
    category: 'GENERAL',
    priority: 'NORMAL',
    isImportant: false,
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    audience: 'PUBLIC',
    organizationId: '',
    status: 'PUBLISHED',
    imageUrl: '',
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const aRes = await apiRequest<Announcement[]>('/announcements');
      setAnnouncements(aRes);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setSelectedItem(null);
    setFormData({
      title: '',
      content: '',
      category: 'GENERAL',
      priority: 'NORMAL',
      isImportant: false,
      publishDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      audience: 'PUBLIC',
      organizationId: '',
      status: 'PUBLISHED',
      imageUrl: '',
    });
    setModalMode('CREATE');
  };

  const openEdit = (a: Announcement) => {
    setSelectedItem(a);
    setFormData({
      title: a.title,
      content: a.content,
      category: a.category,
      priority: a.priority,
      isImportant: a.isImportant,
      publishDate: a.publishDate,
      expiryDate: a.expiryDate || '',
      audience: a.audience,
      organizationId: a.organizationId || '',
      status: a.status,
      imageUrl: a.imageUrl || '',
    });
    setModalMode('EDIT');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modalMode === 'CREATE') {
        await apiRequest<Announcement>('/announcements', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      } else if (modalMode === 'EDIT' && selectedItem) {
        await apiRequest<Announcement>(`/announcements/${selectedItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      }
      setModalMode(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiRequest(`/announcements/${id}`, { method: 'DELETE' });
      setDeleteConfirmId(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
            Communications Center
          </span>
          <h1 className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
            Announcements & Bulletins
          </h1>
          <p className="text-xs text-stone-500 font-editorial">
            Create, schedule, and publish official announcements for public visitors, parish members, or specific organizations.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Audience</th>
                <th className="py-3 px-4">Published</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-editorial">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-500">
                    Loading announcements...
                  </td>
                </tr>
              ) : announcements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-500">
                    No announcements published.
                  </td>
                </tr>
              ) : (
                announcements.map((a) => (
                  <tr key={a.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-semibold text-stone-900">
                          {a.title}
                        </span>
                        {a.isImportant && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-800">
                            IMPORTANT
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-500 line-clamp-1">
                        {a.content}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-700 font-sans font-medium">
                      {a.category}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700">
                        {a.audience}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-600">
                      {a.publishDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        a.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {deleteConfirmId === a.id ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-[10px] text-red-600 font-semibold">Delete?</span>
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-semibold hover:bg-red-700 cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-0.5 bg-stone-200 text-stone-700 rounded text-[10px] font-semibold hover:bg-stone-300 cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(a)}
                            className="p-1.5 text-stone-600 hover:text-amber-900 hover:bg-stone-100 rounded-md cursor-pointer"
                            title="Edit Announcement"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(a.id)}
                            className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-md cursor-pointer"
                            title="Delete Announcement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                {modalMode === 'CREATE' ? 'Draft Parish Announcement' : 'Edit Announcement'}
              </h2>
              <button
                onClick={() => setModalMode(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parish Patronal Feast Celebrations"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  >
                    <option value="GENERAL">General Parish</option>
                    <option value="FEAST">Feast Celebrations</option>
                    <option value="LITURGY">Liturgy & Worship</option>
                    <option value="CATECHISM">Catechism</option>
                    <option value="YOUTH">Youth Movement</option>
                    <option value="CHARITY">Charity & Outreach</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Target Audience
                  </label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  >
                    <option value="PUBLIC">Public (All Visitors)</option>
                    <option value="MEMBERS">Parish Members Only</option>
                  </select>
                </div>
              </div>



              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Publish Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.publishDate}
                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Announcement Body *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Full text of the announcement..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                />
              </div>

              <div>
                <ChurchImagePicker
                  selectedImageUrl={formData.imageUrl}
                  onSelectImage={(url) => setFormData({ ...formData, imageUrl: url })}
                  label="Announcement Photo (Optional)"
                  helpText="Select a church photo from the 28-image library or choose No Photo for text-only."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isImportant"
                  checked={formData.isImportant}
                  onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                  className="rounded border-stone-300 text-amber-900 focus:ring-amber-800"
                />
                <label htmlFor="isImportant" className="font-semibold text-stone-700">
                  Mark as Important Announcement (Sends broadcast notification)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
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
                  <span>{saving ? 'Publishing...' : 'Publish Announcement'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
