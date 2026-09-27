import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { PrayerRequest } from '../../types';
import { Heart, Plus, Send, CheckCircle2, AlertCircle, Lock, MessageSquare } from 'lucide-react';

export const MemberPrayersPage: React.FC = () => {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    requestText: '',
    category: 'SPECIAL_INTENTION' as const,
    isPrivate: false,
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);

    try {
      await apiRequest<PrayerRequest>('/prayer-requests', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      setSuccess('Your prayer intention has been placed in the pastoral prayer registry.');
      setForm({ requestText: '', category: 'SPECIAL_INTENTION', isPrivate: false });
      setShowForm(false);
      loadRequests();
    } catch (err) {
      console.error('Failed to submit prayer intention:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { value: 'HEALTH', label: 'Healing & Health' },
    { value: 'FAMILY', label: 'Family Peace & Unity' },
    { value: 'DECEASED', label: 'Eternal Repose of Deceased' },
    { value: 'THANKSGIVING', label: 'Thanksgiving & Favors Received' },
    { value: 'VOCATION', label: 'Spiritual Vocation & Studies' },
    { value: 'SPECIAL_INTENTION', label: 'Special Intention' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
            Spiritual Ministry
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            Prayer Intentions & Petitions
          </h1>
          <p className="text-xs text-stone-500 font-editorial mt-0.5">
            Submit personal prayer requests to be included in the Holy Qurbana intentions and the prayers of our clergy.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Cancel' : 'Submit New Intention'}</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Submission Form Modal/Expand */}
      {showForm && (
        <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-amber-900" />
            <h2 className="font-serif text-base font-bold text-stone-900">
              New Prayer Petition
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Intention Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Your Prayer Intention *
              </label>
              <textarea
                required
                rows={4}
                value={form.requestText}
                onChange={(e) => setForm({ ...form, requestText: e.target.value })}
                placeholder="Mention the person's name or intention for prayer..."
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPrivate"
                checked={form.isPrivate}
                onChange={(e) => setForm({ ...form, isPrivate: e.target.checked })}
                className="rounded border-stone-300 text-amber-900 focus:ring-amber-800"
              />
              <label htmlFor="isPrivate" className="text-xs text-stone-700 font-medium">
                Keep Intention Confidential (Vicar & Clergy Only)
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Submit Intention'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History of Submitted Intentions */}
      <div className="space-y-4">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-stone-700">
          Your Submitted Intentions ({requests.length})
        </h2>

        {loading ? (
          <div className="p-8 text-center text-xs text-stone-500">
            Loading your intentions...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-500 bg-stone-50 rounded-xl border border-stone-100">
            You have not submitted any prayer requests yet. Click above to submit an intention.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <div
                key={r.id}
                className="p-5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-amber-900">
                      {r.category.replace('_', ' ')}
                    </span>
                    {r.isPrivate && (
                      <span className="flex items-center gap-1 text-[10px] text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">
                        <Lock className="w-3 h-3" />
                        Confidential
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    r.status === 'REVIEWED' || r.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {r.status}
                  </span>
                </div>

                <p className="text-xs text-stone-700 font-editorial leading-relaxed">
                  "{r.requestText}"
                </p>

                {r.priestNotes && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200/60 text-xs text-amber-950 flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">Priest Response:</span>
                      <span className="font-editorial">{r.priestNotes}</span>
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-stone-400 font-mono pt-1">
                  Submitted: {r.createdAt.split('T')[0]}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
