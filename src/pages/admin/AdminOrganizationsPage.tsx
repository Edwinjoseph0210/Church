import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Organization } from '../../types';
import { Bookmark, Edit, Users, Clock, Phone, Mail, X, Save } from 'lucide-react';

export const AdminOrganizationsPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    coordinatorName: '',
    coordinatorPhone: '',
    coordinatorEmail: '',
    meetingSchedule: '',
    description: '',
  });

  const loadOrgs = async () => {
    try {
      const data = await apiRequest<Organization[]>('/organizations');
      setOrganizations(data);
    } catch (err) {
      console.error('Failed to load organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrgs();
  }, []);

  const openEdit = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      coordinatorName: org.coordinatorName,
      coordinatorPhone: org.coordinatorPhone,
      coordinatorEmail: org.coordinatorEmail,
      meetingSchedule: org.meetingSchedule,
      description: org.description,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;
    setSaving(true);
    try {
      await apiRequest<Organization>(`/organizations/${editingOrg.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setEditingOrg(null);
      loadOrgs();
    } catch (err: any) {
      alert(err.message || 'Failed to update organization');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
            Ministries & Guilds
          </span>
          <h1 className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
            Parish Organizations Management
          </h1>
          <p className="text-xs text-stone-500 font-editorial">
            Manage catechism, youth movement, choirs, altar servers guild, family units, and pious associations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-xs text-stone-500">
            Loading organizations...
          </div>
        ) : (
          organizations.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                      <Bookmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-serif text-lg font-bold text-stone-900">
                        {org.name}
                      </h2>
                      <span className="text-[10px] font-mono text-stone-400">
                        Slug: {org.slug}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => openEdit(org)}
                    className="p-1.5 text-stone-600 hover:text-amber-900 hover:bg-stone-100 rounded-md cursor-pointer"
                    title="Edit Details"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-stone-600 font-editorial leading-relaxed my-4">
                  {org.description}
                </p>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-amber-900" />
                    <span><strong>Coordinator:</strong> {org.coordinatorName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-900" />
                    <span><strong>Meeting:</strong> {org.meetingSchedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-amber-900" />
                    <span>{org.coordinatorPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-amber-900" />
                    <span>{org.coordinatorEmail}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span>Parish Ministry</span>
                <span className="text-stone-400 font-mono">ID: {org.id}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editingOrg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Edit {editingOrg.name}
              </h2>
              <button
                onClick={() => setEditingOrg(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Coordinator Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.coordinatorName}
                  onChange={(e) => setFormData({ ...formData, coordinatorName: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Coordinator Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.coordinatorPhone}
                    onChange={(e) => setFormData({ ...formData, coordinatorPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Coordinator Email
                  </label>
                  <input
                    type="email"
                    value={formData.coordinatorEmail}
                    onChange={(e) => setFormData({ ...formData, coordinatorEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Meeting Schedule
                </label>
                <input
                  type="text"
                  value={formData.meetingSchedule}
                  onChange={(e) => setFormData({ ...formData, meetingSchedule: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Ministry Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingOrg(null)}
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
                  <span>{saving ? 'Updating...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
