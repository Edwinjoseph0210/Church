import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Member, Family } from '../../types';
import { Search, Plus, Edit, UserX, UserCheck, X, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AdminMembersPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT' | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    relationshipToHead: Member['relationshipToHead'];
    phone: string;
    email: string;
    address: string;
    houseName: string;
    occupation: string;
    familyId: string;
  }>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'MALE',
    relationshipToHead: 'HEAD',
    phone: '',
    email: '',
    address: '',
    houseName: '',
    occupation: '',
    familyId: '',
  });

  const loadData = async () => {
    try {
      const [mRes, fRes] = await Promise.all([
        apiRequest<Member[]>('/members'),
        apiRequest<Family[]>('/families'),
      ]);
      setMembers(mRes);
      setFamilies(fRes);
    } catch (err: any) {
      console.error('Failed to load members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setSelectedMember(null);
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '1990-01-01',
      gender: 'MALE',
      relationshipToHead: 'HEAD',
      phone: '',
      email: '',
      address: '[PARISH RESIDENTIAL ADDRESS]',
      houseName: '',
      occupation: '',
      familyId: families[0]?.id || '',
    });
    setModalMode('CREATE');
    setFeedback(null);
  };

  const openEditModal = (m: Member) => {
    setSelectedMember(m);
    setFormData({
      firstName: m.firstName,
      lastName: m.lastName,
      dateOfBirth: m.dateOfBirth,
      gender: m.gender as any,
      relationshipToHead: m.relationshipToHead,
      phone: m.phone,
      email: m.email,
      address: m.address,
      houseName: m.houseName,
      occupation: m.occupation,
      familyId: m.familyId || '',
    });
    setModalMode('EDIT');
    setFeedback(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      if (modalMode === 'CREATE') {
        await apiRequest<Member>('/members', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        setFeedback({ type: 'success', message: 'New parishioner enrolled successfully.' });
      } else if (modalMode === 'EDIT' && selectedMember) {
        await apiRequest<Member>(`/members/${selectedMember.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        setFeedback({ type: 'success', message: 'Parishioner record updated.' });
      }
      setModalMode(null);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (m: Member) => {
    const nextStatus = m.membershipStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await apiRequest<Member>(`/members/${m.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    }
  };

  const filtered = members.filter((m) => {
    if (statusFilter !== 'ALL' && m.membershipStatus !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.id.toLowerCase().includes(q) ||
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
            Census & Registry
          </span>
          <h1 className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
            Member Management
          </h1>
          <p className="text-xs text-stone-500 font-editorial">
            Official database of baptized and enrolled parishioners of St. Mariam Thresia Church.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Member</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by ID, name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="text-stone-500 font-medium">Status:</span>
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                statusFilter === s
                  ? 'bg-amber-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Member ID</th>
                <th className="py-3 px-4">Name & Gender</th>
                <th className="py-3 px-4">Family Household</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-editorial">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-500">
                    Loading census roster...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-500">
                    No member records found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  const fam = families.find((f) => f.id === m.familyId);
                  return (
                    <tr key={m.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                        {m.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-sans font-semibold text-stone-900 block">
                          {m.firstName} {m.lastName}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {m.gender} · {m.relationshipToHead}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-700">
                        {fam ? `${fam.familyName} (${fam.houseName})` : 'Unassigned'}
                      </td>
                      <td className="py-3.5 px-4 text-stone-700 font-mono">
                        {m.phone}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        {m.email || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            m.membershipStatus === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {m.membershipStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(m)}
                          className="p-1.5 text-stone-600 hover:text-amber-900 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                          title="Edit Member"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(m)}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            m.membershipStatus === 'ACTIVE'
                              ? 'text-stone-400 hover:text-red-700 hover:bg-red-50'
                              : 'text-stone-400 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={m.membershipStatus === 'ACTIVE' ? 'Deactivate Member' : 'Restore Member'}
                        >
                          {m.membershipStatus === 'ACTIVE' ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
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

      {/* Add / Edit Member Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                {modalMode === 'CREATE' ? 'Add Parish Member' : `Edit Member: ${selectedMember?.id}`}
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
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Role in Family
                  </label>
                  <select
                    value={formData.relationshipToHead}
                    onChange={(e) => setFormData({ ...formData, relationshipToHead: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  >
                    <option value="HEAD">Head</option>
                    <option value="SPOUSE">Spouse</option>
                    <option value="CHILD">Child</option>
                    <option value="PARENT">Parent</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Telephone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    House Name / Tharavadu
                  </label>
                  <input
                    type="text"
                    value={formData.houseName}
                    onChange={(e) => setFormData({ ...formData, houseName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Parish Family Assignment
                  </label>
                  <select
                    value={formData.familyId}
                    onChange={(e) => setFormData({ ...formData, familyId: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  >
                    <option value="">-- No Family (Individual) --</option>
                    {families.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.familyName} ({f.houseName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Profession / Occupation
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Residential Address
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
                  <span>{saving ? 'Saving...' : 'Save Member Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
