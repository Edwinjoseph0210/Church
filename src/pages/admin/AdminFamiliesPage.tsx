import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Family, Member } from '../../types';
import { Home, Plus, Edit, Users, X, Save, Search, UserPlus, Trash2, ShieldCheck, Check } from 'lucide-react';

export const AdminFamiliesPage: React.FC = () => {
  const [families, setFamilies] = useState<Family[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT' | 'VIEW_MEMBERS' | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    familyName: '',
    houseName: '',
    wardOrUnit: 'St. Thomas Unit 1',
    address: '[PARISH RESIDENTIAL ADDRESS]',
    contactPhone: '',
    contactEmail: '',
  });

  const loadData = async () => {
    try {
      const [fRes, mRes] = await Promise.all([
        apiRequest<Family[]>('/families'),
        apiRequest<Member[]>('/members'),
      ]);
      setFamilies(fRes);
      setAllMembers(mRes);
    } catch (err) {
      console.error('Failed to load families:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setSelectedFamily(null);
    setFormData({
      familyName: '',
      houseName: '',
      wardOrUnit: 'St. Thomas Unit 1',
      address: '[PARISH RESIDENTIAL ADDRESS]',
      contactPhone: '',
      contactEmail: '',
    });
    setModalMode('CREATE');
  };

  const openEditModal = (f: Family) => {
    setSelectedFamily(f);
    setFormData({
      familyName: f.familyName,
      houseName: f.houseName,
      wardOrUnit: f.wardOrUnit || 'St. Thomas Unit 1',
      address: f.address,
      contactPhone: f.contactPhone,
      contactEmail: f.contactEmail,
    });
    setModalMode('EDIT');
  };

  const openMembersModal = (f: Family) => {
    setSelectedFamily(f);
    setModalMode('VIEW_MEMBERS');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modalMode === 'CREATE') {
        await apiRequest<Family>('/families', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      } else if (modalMode === 'EDIT' && selectedFamily) {
        await apiRequest<Family>(`/families/${selectedFamily.id}`, {
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

  const assignMemberToFamily = async (memberId: string) => {
    if (!selectedFamily) return;
    try {
      await apiRequest(`/members/${memberId}`, {
        method: 'PUT',
        body: JSON.stringify({ familyId: selectedFamily.id }),
      });
      loadData();
      // Update selectedFamily members in place
      const updatedFam = await apiRequest<Family>(`/families/${selectedFamily.id}`);
      setSelectedFamily(updatedFam);
    } catch (err: any) {
      alert(err.message || 'Failed to assign member');
    }
  };

  const removeMemberFromFamily = async (memberId: string) => {
    if (!selectedFamily) return;
    try {
      await apiRequest(`/members/${memberId}`, {
        method: 'PUT',
        body: JSON.stringify({ familyId: '' }),
      });
      loadData();
      const updatedFam = await apiRequest<Family>(`/families/${selectedFamily.id}`);
      setSelectedFamily(updatedFam);
    } catch (err: any) {
      alert(err.message || 'Failed to remove member');
    }
  };

  const verifyFamilyRegister = async (f: Family) => {
    try {
      await apiRequest(`/family-register/${f.id}`, {
        method: 'PUT',
        body: JSON.stringify({ statusAction: 'ADMIN_VERIFY' }),
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to verify register');
    }
  };

  const filtered = families.filter((f) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      f.id.toLowerCase().includes(q) ||
      f.familyName.toLowerCase().includes(q) ||
      f.houseName.toLowerCase().includes(q) ||
      (f.wardOrUnit && f.wardOrUnit.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
            Domestic Church Registry
          </span>
          <h1 className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
            Family Units Management
          </h1>
          <p className="text-xs text-stone-500 font-editorial">
            Parish family households, house names (Tharavadu), wards, and registered family members.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Family Record</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by family name, house, or unit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Family ID</th>
                <th className="py-3 px-4">Family Name</th>
                <th className="py-3 px-4">House Name</th>
                <th className="py-3 px-4">Ward / Unit</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Members</th>
                <th className="py-3 px-4">Register Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-editorial">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-500">
                    Loading family units...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-500">
                    No family records found.
                  </td>
                </tr>
              ) : (
                filtered.map((f) => {
                  const memberCount = f.members?.length || 0;
                  const vStatus = f.verificationStatus || 'VERIFIED';
                  return (
                    <tr key={f.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                        {f.id}
                      </td>
                      <td className="py-3.5 px-4 font-sans font-semibold text-stone-900">
                        {f.familyName}
                      </td>
                      <td className="py-3.5 px-4 text-stone-700 font-editorial">
                        {f.houseName}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        {f.wardOrUnit || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-stone-700">
                        {f.contactPhone}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => openMembersModal(f)}
                          className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-semibold cursor-pointer"
                        >
                          {memberCount} Members
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              vStatus === 'VERIFIED'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : vStatus === 'PENDING_VERIFICATION'
                                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                : vStatus === 'CHANGE_REQUESTED'
                                ? 'bg-purple-50 text-purple-900 border border-purple-200'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {vStatus.replace('_', ' ')}
                          </span>
                          {vStatus !== 'VERIFIED' && (
                            <button
                              onClick={() => verifyFamilyRegister(f)}
                              className="px-2 py-0.5 rounded bg-emerald-800 hover:bg-emerald-900 text-white text-[10px] font-semibold transition-colors cursor-pointer"
                              title="Verify Register"
                            >
                              Verify
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(f)}
                          className="p-1.5 text-stone-600 hover:text-amber-900 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                          title="Edit Family"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Family Modal */}
      {(modalMode === 'CREATE' || modalMode === 'EDIT') && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                {modalMode === 'CREATE' ? 'Add Parish Family Unit' : `Edit Family: ${selectedFamily?.id}`}
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
                  Family Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Joseph Family"
                  value={formData.familyName}
                  onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    House Name / Tharavadu *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bethlehem House"
                    value={formData.houseName}
                    onChange={(e) => setFormData({ ...formData, houseName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Ward / Prayer Unit
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. St. Thomas Unit 1"
                    value={formData.wardOrUnit}
                    onChange={(e) => setFormData({ ...formData, wardOrUnit: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Household Address
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                  <span>{saving ? 'Saving...' : 'Save Family'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View & Manage Family Members Modal */}
      {modalMode === 'VIEW_MEMBERS' && selectedFamily && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 max-h-[85vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-stone-100">
              <div>
                <h2 className="font-serif text-lg font-bold text-stone-900">
                  {selectedFamily.familyName} Household Roster
                </h2>
                <p className="text-xs text-stone-500 font-editorial">
                  House: {selectedFamily.houseName} · ID: {selectedFamily.id}
                </p>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Currently Assigned Members */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-700">
                Current Registered Members ({selectedFamily.members?.length || 0})
              </span>

              {selectedFamily.members && selectedFamily.members.length > 0 ? (
                <div className="space-y-2">
                  {selectedFamily.members.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-lg bg-stone-50 border border-stone-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="text-stone-900">{m.firstName} {m.lastName}</strong>
                        <span className="text-stone-400 ml-2">({m.relationshipToHead})</span>
                        <span className="block text-[10px] text-stone-500 font-mono">
                          ID: {m.id} · DOB: {m.dateOfBirth}
                        </span>
                      </div>
                      <button
                        onClick={() => removeMemberFromFamily(m.id)}
                        className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-md cursor-pointer"
                        title="Remove member from this family"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-stone-500 bg-stone-50 rounded-lg">
                  No members currently registered under this family.
                </div>
              )}
            </div>

            {/* Add an Unassigned Member to this family */}
            <div className="pt-4 border-t border-stone-100 space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-700">
                Enroll Existing Member to Household
              </span>
              <div className="flex gap-2">
                <select
                  id="enrollSelect"
                  className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                >
                  <option value="">Select unassigned parish member...</option>
                  {allMembers
                    .filter((m) => m.familyId !== selectedFamily.id)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.firstName} {m.lastName} ({m.id})
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const sel = (document.getElementById('enrollSelect') as HTMLSelectElement)?.value;
                    if (sel) assignMemberToFamily(sel);
                  }}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Assign</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setModalMode(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
