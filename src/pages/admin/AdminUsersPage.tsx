import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { SafeUser, UserRole, Organization } from '../../types';
import { ShieldCheck, Plus, UserX, UserCheck, X, Save, Lock } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PARISH_MEMBER' as UserRole,
    memberId: '',
    assignedOrganizationId: '',
  });

  const loadData = async () => {
    try {
      const [uRes, oRes] = await Promise.all([
        apiRequest<SafeUser[]>('/users'),
        apiRequest<Organization[]>('/organizations'),
      ]);
      setUsers(uRes);
      setOrganizations(oRes);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest<SafeUser>('/users', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setShowCreateModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create user account');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await apiRequest(`/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to change role');
    }
  };

  const toggleStatus = async (user: SafeUser) => {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await apiRequest(`/users/${user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to change status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-800" />
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
              Super Admin Privilege
            </span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
            System Users & Role-Based Access Control
          </h1>
          <p className="text-xs text-stone-500 font-editorial">
            Assign ecclesiastical roles, manage authentication credentials, and enforce authorization boundaries.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              email: '',
              password: '',
              role: 'PARISH_MEMBER',
              memberId: '',
              assignedOrganizationId: '',
            });
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create User Account</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Email / Identifier</th>
                <th className="py-3 px-4">Linked Member ID</th>
                <th className="py-3 px-4">System Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-editorial">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-500">
                    Loading system user accounts...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-semibold text-stone-900">
                      {u.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-600">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-500">
                      {u.memberId || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-md text-xs font-mono font-semibold text-stone-800"
                      >
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        <option value="PARISH_ADMIN">PARISH_ADMIN</option>
                        <option value="PRIEST">PRIEST</option>
                        <option value="ORGANIZATION_COORDINATOR">ORGANIZATION_COORDINATOR</option>
                        <option value="PARISH_MEMBER">PARISH_MEMBER</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => toggleStatus(u)}
                        className={`p-1.5 rounded-md cursor-pointer ${
                          u.status === 'ACTIVE'
                            ? 'text-stone-400 hover:text-red-700 hover:bg-red-50'
                            : 'text-stone-400 hover:text-emerald-700 hover:bg-emerald-50'
                        }`}
                        title={u.status === 'ACTIVE' ? 'Deactivate User' : 'Restore User'}
                      >
                        {u.status === 'ACTIVE' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Provision System User Account
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Email Identifier *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="user@church.org"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Initial Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    System Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800 font-mono"
                  >
                    <option value="PARISH_MEMBER">PARISH_MEMBER</option>
                    <option value="ORGANIZATION_COORDINATOR">ORGANIZATION_COORDINATOR</option>
                    <option value="PRIEST">PRIEST</option>
                    <option value="PARISH_ADMIN">PARISH_ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Linked Member ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. M-101"
                    value={formData.memberId}
                    onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Assigned Organization (For Coordinator)
                  </label>
                  <select
                    value={formData.assignedOrganizationId}
                    onChange={(e) => setFormData({ ...formData, assignedOrganizationId: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  >
                    <option value="">None</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
                  <span>{saving ? 'Creating...' : 'Provision User'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
