import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { PrayerRequest } from '../../types';
import { Heart, CheckCircle2, MessageSquare, Lock, X, Save } from 'lucide-react';

export const AdminPrayersPage: React.FC = () => {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PrayerRequest | null>(null);
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState<'NEW' | 'REVIEWED' | 'COMPLETED' | 'ARCHIVED'>('REVIEWED');
  const [priestNotes, setPriestNotes] = useState('');

  const loadRequests = async () => {
    try {
      const data = await apiRequest<PrayerRequest[]>('/prayer-requests');
      setRequests(data);
    } catch (err) {
      console.error('Failed to load prayer requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const openReview = (r: PrayerRequest) => {
    setSelectedRequest(r);
    setStatus(r.status);
    setPriestNotes(r.priestNotes || '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setSaving(true);
    try {
      await apiRequest<PrayerRequest>(`/prayer-requests/${selectedRequest.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, priestNotes }),
      });
      setSelectedRequest(null);
      loadRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to update prayer request');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
            Spiritual Ministry
          </span>
          <h1 className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
            Prayer Intentions Review
          </h1>
          <p className="text-xs text-stone-500 font-editorial">
            Pastoral review of personal prayer intentions submitted by parish members for Holy Qurbana.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Intention Text</th>
                <th className="py-3 px-4">Confidential</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-editorial">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-500">
                    Loading prayer requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-500">
                    No prayer intentions recorded.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-stone-500">
                      {r.createdAt.split('T')[0]}
                    </td>
                    <td className="py-3.5 px-4 font-sans font-semibold text-stone-900">
                      {r.memberName}
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">
                      {r.category.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-stone-700">
                      "{r.requestText}"
                    </td>
                    <td className="py-3.5 px-4">
                      {r.isPrivate ? (
                        <span className="flex items-center gap-1 text-[10px] text-amber-800 font-medium">
                          <Lock className="w-3 h-3" />
                          Confidential
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400">Normal</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        r.status === 'REVIEWED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'COMPLETED'
                          ? 'bg-stone-200 text-stone-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openReview(r)}
                        className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md text-xs font-semibold cursor-pointer"
                      >
                        Respond
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Respond Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Review Prayer Intention
              </h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-900">
                  {selectedRequest.memberName} ({selectedRequest.memberEmail})
                </span>
                <span className="text-stone-400 font-mono">
                  {selectedRequest.createdAt.split('T')[0]}
                </span>
              </div>
              <p className="text-stone-700 font-editorial italic text-sm">
                "{selectedRequest.requestText}"
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Intention Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                >
                  <option value="NEW">New</option>
                  <option value="REVIEWED">Reviewed & Offered at Altar</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Priest Pastoral Note / Blessing (Visible to Member)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Remembered at Friday Adoration and Holy Qurbana. God bless your family."
                  value={priestNotes}
                  onChange={(e) => setPriestNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
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
                  <span>{saving ? 'Saving...' : 'Update & Notify'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
