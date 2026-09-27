import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { AppointmentRequest } from '../../types';
import { CalendarCheck, Plus, Calendar, Clock, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

export const MemberAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    preferredDate: '',
    preferredTime: '',
    reason: 'HOUSE_VISIT' as const,
    message: '',
    memberPhone: '',
  });

  const loadAppointments = async () => {
    try {
      const data = await apiRequest<AppointmentRequest[]>('/appointments');
      setAppointments(data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);

    try {
      await apiRequest<AppointmentRequest>('/appointments', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      setSuccess('Your pastoral appointment request has been transmitted to Father.');
      setForm({ preferredDate: '', preferredTime: '', reason: 'HOUSE_VISIT', message: '', memberPhone: '' });
      setShowForm(false);
      loadAppointments();
    } catch (err) {
      console.error('Failed to request appointment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const reasons = [
    { value: 'HOUSE_VISIT', label: 'House Blessing / Family Visit' },
    { value: 'CONFESSION', label: 'Sacrament of Confession' },
    { value: 'SPIRITUAL_DIRECTION', label: 'Spiritual Direction / Pastoral Counsel' },
    { value: 'FAMILY_BLESSING', label: 'Special Family Blessing / Anniversary' },
    { value: 'MARRIAGE_CONSULTATION', label: 'Marriage Preparation / Matrimony' },
    { value: 'GENERAL', label: 'General Pastoral Inquiry' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
            Pastoral Encounters
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            Priest Appointment Requests
          </h1>
          <p className="text-xs text-stone-500 font-editorial mt-0.5">
            Request home visits, house blessings, spiritual counsel, or private confession with our parish priest.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Cancel' : 'Request Appointment'}</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-4">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-amber-900" />
            <h2 className="font-serif text-base font-bold text-stone-900">
              Request a Meeting with the Parish Priest
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  required
                  value={form.preferredDate}
                  onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Preferred Time *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 04:30 PM or Morning after Mass"
                  value={form.preferredTime}
                  onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Pastoral Reason *
                </label>
                <select
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                >
                  {reasons.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Best Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={form.memberPhone}
                  onChange={(e) => setForm({ ...form, memberPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Additional Notes / Household Location
              </label>
              <textarea
                rows={3}
                placeholder="Share any special instructions or family details for Father..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
              />
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
                className="px-5 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold"
              >
                {submitting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Appointment History */}
      <div className="space-y-4">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-stone-700">
          Your Appointment Requests ({appointments.length})
        </h2>

        {loading ? (
          <div className="p-8 text-center text-xs text-stone-500">
            Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-500 bg-stone-50 rounded-xl border border-stone-100">
            No appointment requests recorded. Click above to request a meeting with Father.
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-amber-900">
                      {apt.reason.replace('_', ' ')}
                    </span>
                    <span className="text-stone-300">·</span>
                    <span className="text-stone-600 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {apt.preferredDate} at {apt.preferredTime}
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                    apt.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : apt.status === 'REJECTED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {apt.status}
                  </span>
                </div>

                {apt.message && (
                  <p className="text-xs text-stone-600 font-editorial">
                    "{apt.message}"
                  </p>
                )}

                {apt.priestResponse && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200/70 text-xs text-amber-950 flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">Vicar's Response:</span>
                      <span className="font-editorial">{apt.priestResponse}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
