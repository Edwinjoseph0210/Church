import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { SacramentalRecord } from '../../types';
import { Scroll, Plus, Search, X, Save, Lock, AlertCircle } from 'lucide-react';

export const AdminSacramentalPage: React.FC = () => {
  const [records, setRecords] = useState<SacramentalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'BAPTISM' | 'CONFIRMATION' | 'MARRIAGE' | 'FUNERAL'>('ALL');

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<{
    type: SacramentalRecord['type'];
    recordNumber: string;
    personName: string;
    dateOfEvent: string;
    dateOfBirth: string;
    dateOfDeath: string;
    parents: string;
    godparentsOrSponsor: string;
    groomName: string;
    brideName: string;
    witnesses: string;
    church: string;
    priest: string;
    notes: string;
  }>({
    type: 'BAPTISM',
    recordNumber: '',
    personName: '',
    dateOfEvent: new Date().toISOString().split('T')[0],
    dateOfBirth: '',
    dateOfDeath: '',
    parents: '',
    godparentsOrSponsor: '',
    groomName: '',
    brideName: '',
    witnesses: '',
    church: 'St. Mariam Thresia Church',
    priest: 'Fr. Joshy N George',
    notes: '',
  });

  const loadRecords = async () => {
    try {
      const data = await apiRequest<SacramentalRecord[]>('/sacramental-records');
      setRecords(data);
    } catch (err) {
      console.error('Failed to load sacramental registers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const openCreate = (type: 'BAPTISM' | 'CONFIRMATION' | 'MARRIAGE' | 'FUNERAL') => {
    const year = new Date().getFullYear();
    const count = records.filter((r) => r.type === type).length + 1;
    const prefix = type.slice(0, 3);
    const code = `${prefix}-${year}-${String(count).padStart(3, '0')}`;

    setFormData({
      type,
      recordNumber: code,
      personName: '',
      dateOfEvent: new Date().toISOString().split('T')[0],
      dateOfBirth: '',
      dateOfDeath: '',
      parents: '',
      godparentsOrSponsor: '',
      groomName: '',
      brideName: '',
      witnesses: '',
      church: 'St. Mariam Thresia Church',
      priest: 'Fr. Joshy N George',
      notes: '',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest<SacramentalRecord>('/sacramental-records', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setShowModal(false);
      loadRecords();
    } catch (err: any) {
      alert(err.message || 'Failed to save sacramental record');
    } finally {
      setSaving(false);
    }
  };

  const filtered = records.filter((r) => {
    if (typeFilter !== 'ALL' && r.type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.recordNumber.toLowerCase().includes(q) ||
        r.personName.toLowerCase().includes(q) ||
        (r.parents && r.parents.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-red-600" />
            <span className="text-[10px] uppercase font-bold text-red-700 tracking-wider">
              Canonical & Confidential Register
            </span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
            Sacramental Registers (Baptism, Chrismation, Matrimony, Funerals)
          </h1>
          <p className="text-xs text-stone-500 font-editorial">
            Restricted pastoral archive. Every access, addition, and modification is logged in church audit trails.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => openCreate('BAPTISM')}
            className="px-3 py-1.5 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            + Baptism
          </button>
          <button
            onClick={() => openCreate('CONFIRMATION')}
            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            + Confirmation
          </button>
          <button
            onClick={() => openCreate('MARRIAGE')}
            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            + Marriage
          </button>
          <button
            onClick={() => openCreate('FUNERAL')}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            + Funeral
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search record number, recipient, parents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'BAPTISM', 'CONFIRMATION', 'MARRIAGE', 'FUNERAL'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                typeFilter === t
                  ? 'bg-amber-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Register Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Register Code</th>
                <th className="py-3 px-4">Sacrament</th>
                <th className="py-3 px-4">Person(s) / Recipient</th>
                <th className="py-3 px-4">Event Date</th>
                <th className="py-3 px-4">Parents / Sponsors / Witnesses</th>
                <th className="py-3 px-4">Officiating Clergy</th>
                <th className="py-3 px-4">Parish Sanctuary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-editorial">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-500">
                    Decrypting canonical register records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-500">
                    No sacramental records in this register view.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      {r.recordNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        r.type === 'BAPTISM'
                          ? 'bg-blue-100 text-blue-800'
                          : r.type === 'CONFIRMATION'
                          ? 'bg-amber-100 text-amber-800'
                          : r.type === 'MARRIAGE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-200 text-stone-800'
                      }`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans font-semibold text-stone-900">
                      {r.personName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-700">
                      {r.dateOfEvent}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {r.parents || r.godparentsOrSponsor || r.witnesses || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">
                      {r.priest}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500 font-sans text-[11px]">
                      {r.church}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Record Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-red-700 tracking-wider">
                  Canonical Registration
                </span>
                <h2 className="font-serif text-lg font-bold text-stone-900">
                  Enter {formData.type} Record
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Register Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.recordNumber}
                    onChange={(e) => setFormData({ ...formData, recordNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfEvent}
                    onChange={(e) => setFormData({ ...formData, dateOfEvent: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Full Name of Recipient(s) *
                </label>
                <input
                  type="text"
                  required
                  placeholder={formData.type === 'MARRIAGE' ? 'Groom & Bride Names' : 'Baptismal / Christian Name'}
                  value={formData.personName}
                  onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                />
              </div>

              {formData.type === 'BAPTISM' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Parents (Father & Mother)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Demo & Mary Demo"
                      value={formData.parents}
                      onChange={(e) => setFormData({ ...formData, parents: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                    />
                  </div>
                </div>
              )}

              {(formData.type === 'BAPTISM' || formData.type === 'CONFIRMATION') && (
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Godparents / Confirmation Sponsor
                  </label>
                  <input
                    type="text"
                    placeholder="Full legal names of godparents/sponsor"
                    value={formData.godparentsOrSponsor}
                    onChange={(e) => setFormData({ ...formData, godparentsOrSponsor: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
              )}

              {formData.type === 'MARRIAGE' && (
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Canonical Witnesses
                  </label>
                  <input
                    type="text"
                    placeholder="Two adult witnesses present at Matrimony"
                    value={formData.witnesses}
                    onChange={(e) => setFormData({ ...formData, witnesses: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
              )}

              {formData.type === 'FUNERAL' && (
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Date of Death
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfDeath}
                    onChange={(e) => setFormData({ ...formData, dateOfDeath: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Officiating Clergy *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.priest}
                    onChange={(e) => setFormData({ ...formData, priest: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Sanctuary / Church
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.church}
                    onChange={(e) => setFormData({ ...formData, church: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Canonical Notes & Annotations
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. First Communion, chrismation details, canonical dispensations..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  <span>{saving ? 'Recording...' : 'Register in Canonical Book'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
