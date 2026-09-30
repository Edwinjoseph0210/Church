import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { HolyQurbanaTiming } from '../../types';
import { Clock, Plus, Edit, Trash2, X, Save, CheckCircle2, ToggleLeft, ToggleRight } from 'lucide-react';

export const AdminHolyQurbanaPage: React.FC = () => {
  const [timings, setTimings] = useState<HolyQurbanaTiming[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT' | null>(null);
  const [selectedTiming, setSelectedTiming] = useState<HolyQurbanaTiming | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<{
    dayType: HolyQurbanaTiming['dayType'];
    dayName: string;
    time: string;
    language: string;
    description: string;
    notes: string;
    isActive: boolean;
    displayOrder: number;
  }>({
    dayType: 'WEEKDAY',
    dayName: '',
    time: '',
    language: 'Malayalam & English',
    description: '',
    notes: '',
    isActive: true,
    displayOrder: 1,
  });

  const loadTimings = async () => {
    try {
      const data = await apiRequest<HolyQurbanaTiming[]>('/holy-qurbana/all');
      setTimings(data);
    } catch (err) {
      console.error('Failed to load timings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimings();
  }, []);

  const openCreate = () => {
    setSelectedTiming(null);
    setFormData({
      dayType: 'SUNDAY',
      dayName: '',
      time: '07:00 AM',
      language: 'Malayalam & English',
      description: '',
      notes: '',
      isActive: true,
      displayOrder: timings.length + 1,
    });
    setModalMode('CREATE');
  };

  const openEdit = (t: HolyQurbanaTiming) => {
    setSelectedTiming(t);
    setFormData({
      dayType: t.dayType,
      dayName: t.dayName,
      time: t.time,
      language: t.language,
      description: t.description || '',
      notes: t.notes || '',
      isActive: t.isActive,
      displayOrder: t.displayOrder,
    });
    setModalMode('EDIT');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modalMode === 'CREATE') {
        await apiRequest<HolyQurbanaTiming>('/holy-qurbana', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      } else if (modalMode === 'EDIT' && selectedTiming) {
        await apiRequest<HolyQurbanaTiming>(`/holy-qurbana/${selectedTiming.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      }
      setModalMode(null);
      loadTimings();
    } catch (err: any) {
      alert(err.message || 'Failed to save timing');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (t: HolyQurbanaTiming) => {
    try {
      await apiRequest<HolyQurbanaTiming>(`/holy-qurbana/${t.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !t.isActive }),
      });
      loadTimings();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this liturgical timing entry?')) return;
    try {
      await apiRequest(`/holy-qurbana/${id}`, { method: 'DELETE' });
      loadTimings();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
            Liturgical Schedule Editor
          </span>
          <h1 className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
            Holy Qurbana Timings
          </h1>
          <p className="text-xs text-stone-500 font-editorial">
            Manage public Mass times, solemn celebrations, special devotions, and feast day liturgical orders.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Holy Qurbana Timing</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Day / Occasion</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Language & Rite</th>
                <th className="py-3 px-4">Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-editorial">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-500">
                    Loading liturgical schedule...
                  </td>
                </tr>
              ) : timings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-500">
                    No Holy Qurbana timings listed.
                  </td>
                </tr>
              ) : (
                timings.map((t) => (
                  <tr key={t.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-stone-400">
                      {t.displayOrder}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700">
                        {t.dayType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans font-semibold text-stone-900">
                      {t.dayName}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-900">
                      {t.time}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {t.language}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleActive(t)}
                        className={`inline-flex items-center gap-1 font-semibold text-xs cursor-pointer ${
                          t.isActive ? 'text-emerald-700' : 'text-stone-400'
                        }`}
                      >
                        {t.isActive ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                        <span>{t.isActive ? 'Published' : 'Hidden'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEdit(t)}
                        className="p-1.5 text-stone-600 hover:text-amber-900 hover:bg-stone-100 rounded-md cursor-pointer"
                        title="Edit Timing"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-md cursor-pointer"
                        title="Delete Timing"
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
      </div>

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                {modalMode === 'CREATE' ? 'Add Liturgical Schedule Entry' : 'Edit Schedule Entry'}
              </h2>
              <button
                onClick={() => setModalMode(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Day Classification
                  </label>
                  <select
                    value={formData.dayType}
                    onChange={(e) => setFormData({ ...formData, dayType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  >
                    <option value="SUNDAY">Sunday</option>
                    <option value="WEEKDAY">Weekday</option>
                    <option value="SPECIAL">Special Devotion</option>
                    <option value="FEAST">Patronal / Liturgical Feast</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Display Order Index
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Title / Day Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunday Morning Holy Qurbana"
                  value={formData.dayName}
                  onChange={(e) => setFormData({ ...formData, dayName: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Liturgy Timing *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 07:00 AM or 06:30 PM"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Language & Liturgical Rite
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Malayalam & English (Syro-Malabar)"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
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
                  placeholder="e.g. Solemn Qurbana preceded by Sapra..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Pastoral Notes (Confessions, Novena, etc.)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Confessions available 30 min prior"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                />
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
                  <span>{saving ? 'Saving...' : 'Save Timing'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
