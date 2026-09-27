import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { AppointmentRequest } from '../../types';
import { CalendarCheck, Clock, Phone, Mail, X, Save, MessageSquare } from 'lucide-react';

export const AdminAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApt, setSelectedApt] = useState<AppointmentRequest | null>(null);
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'RESCHEDULED' | 'COMPLETED'>('APPROVED');
  const [priestResponse, setPriestResponse] = useState('');

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

  const openManage = (apt: AppointmentRequest) => {
    setSelectedApt(apt);
    setStatus(apt.status);
    setPriestResponse(apt.priestResponse || '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApt) return;
    setSaving(true);
    try {
      await apiRequest<AppointmentRequest>(`/appointments/${selectedApt.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, priestResponse }),
      });
      setSelectedApt(null);
      loadAppointments();
    } catch (err: any) {
      alert(err.message || 'Failed to update appointment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
            Pastoral Encounters
          </span>
          <h1 className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
            Priest Appointments Management
          </h1>
          <p className="text-xs text-stone-500 font-editorial">
            Manage house blessing visits, confession requests, marriage preparation interviews, and pastoral counsel meetings.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Requested Date & Time</th>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Pastoral Reason</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Member Message</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-editorial">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-500">
                    Loading appointment requests...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-500">
                    No pastoral appointment requests.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      {apt.preferredDate} at {apt.preferredTime}
                    </td>
                    <td className="py-3.5 px-4 font-sans font-semibold text-stone-900">
                      {apt.memberName}
                    </td>
                    <td className="py-3.5 px-4 text-amber-900 font-medium">
                      {apt.reason.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 text-stone-700 font-mono">
                      {apt.memberPhone}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate">
                      {apt.message || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        apt.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : apt.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openManage(apt)}
                        className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md text-xs font-semibold cursor-pointer"
                      >
                        Action
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {selectedApt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Manage Appointment Request
              </h2>
              <button
                onClick={() => setSelectedApt(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-900">
                  {selectedApt.memberName}
                </span>
                <span className="text-stone-500 font-mono">
                  {selectedApt.memberPhone}
                </span>
              </div>
              <div className="text-amber-900 font-medium">
                Reason: {selectedApt.reason.replace('_', ' ')}
              </div>
              <div className="text-stone-600">
                Requested: {selectedApt.preferredDate} at {selectedApt.preferredTime}
              </div>
              {selectedApt.message && (
                <p className="text-stone-700 font-editorial italic pt-1 border-t border-stone-200">
                  "{selectedApt.message}"
                </p>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Pastoral Appointment Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                >
                  <option value="PENDING">Pending Review</option>
                  <option value="APPROVED">Approved & Confirmed</option>
                  <option value="RESCHEDULED">Rescheduled</option>
                  <option value="REJECTED">Declined / Unavailable</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Priest Response Message (Will notify parishioner)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Confirmed. Father will arrive at 04:30 PM. God bless your home."
                  value={priestResponse}
                  onChange={(e) => setPriestResponse(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setSelectedApt(null)}
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
                  <span>{saving ? 'Updating...' : 'Update & Notify Member'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
