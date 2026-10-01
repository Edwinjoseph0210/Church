import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { ParishEvent } from '../../types';
import { Calendar, Plus, Edit, Trash2, X, Save, Clock, MapPin } from 'lucide-react';
import { ChurchImagePicker } from '../../components/common/ChurchImagePicker';

export const AdminEventsPage: React.FC = () => {
  const [events, setEvents] = useState<ParishEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT' | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ParishEvent | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    imageUrl: string;
    organizer: string;
    registrationInfo: string;
    contactInfo: string;
    status: ParishEvent['status'];
  }>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    location: 'Main Church Sanctuary',
    imageUrl: '',
    organizer: 'Liturgical Committee',
    registrationInfo: '',
    contactInfo: '[PARISH OFFICE CONTACT]',
    status: 'UPCOMING',
  });

  const loadEvents = async () => {
    try {
      const data = await apiRequest<ParishEvent[]>('/events');
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const openCreate = () => {
    setSelectedEvent(null);
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00 AM',
      endTime: '11:00 AM',
      location: 'Main Church Sanctuary',
      imageUrl: '',
      organizer: 'Liturgical Committee',
      registrationInfo: '',
      contactInfo: '[PARISH OFFICE CONTACT]',
      status: 'UPCOMING',
    });
    setModalMode('CREATE');
  };

  const openEdit = (e: ParishEvent) => {
    setSelectedEvent(e);
    setFormData({
      title: e.title,
      description: e.description,
      date: e.date,
      startTime: e.startTime,
      endTime: e.endTime || '',
      location: e.location,
      imageUrl: e.imageUrl || '',
      organizer: e.organizer,
      registrationInfo: e.registrationInfo || '',
      contactInfo: e.contactInfo,
      status: e.status,
    });
    setModalMode('EDIT');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modalMode === 'CREATE') {
        await apiRequest<ParishEvent>('/events', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      } else if (modalMode === 'EDIT' && selectedEvent) {
        await apiRequest<ParishEvent>(`/events/${selectedEvent.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      }
      setModalMode(null);
      loadEvents();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await apiRequest(`/events/${id}`, { method: 'DELETE' });
      loadEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to delete event');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
            Liturgical & Community Programs
          </span>
          <h1 className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
            Event Management
          </h1>
          <p className="text-xs text-stone-500 font-editorial">
            Schedule retreats, youth activities, parish feasts, catechism workshops, and liturgical functions.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Event</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Event Date</th>
                <th className="py-3 px-4">Title & Description</th>
                <th className="py-3 px-4">Time & Location</th>
                <th className="py-3 px-4">Organizer</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-editorial">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-500">
                    Loading events...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-500">
                    No events scheduled.
                  </td>
                </tr>
              ) : (
                events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      {evt.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-sans font-semibold text-stone-900 block">
                        {evt.title}
                      </span>
                      <span className="text-[11px] text-stone-500 line-clamp-1">
                        {evt.description}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">
                      <div>{evt.startTime} {evt.endTime ? `– ${evt.endTime}` : ''}</div>
                      <div className="text-[11px] text-stone-400">{evt.location}</div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 font-sans">
                      {evt.organizer}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        evt.status === 'UPCOMING'
                          ? 'bg-emerald-100 text-emerald-800'
                          : evt.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {evt.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEdit(evt)}
                        className="p-1.5 text-stone-600 hover:text-amber-900 hover:bg-stone-100 rounded-md cursor-pointer"
                        title="Edit Event"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(evt.id)}
                        className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-md cursor-pointer"
                        title="Delete Event"
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
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                {modalMode === 'CREATE' ? 'Add Parish Event' : 'Edit Event'}
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
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solemn Raza & Adoration"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="09:00 AM"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    placeholder="11:30 AM"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Church Sanctuary"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                />
              </div>

              <div>
                <ChurchImagePicker
                  selectedImageUrl={formData.imageUrl}
                  onSelectImage={(url) => setFormData({ ...formData, imageUrl: url })}
                  label="Event Photo (Optional)"
                  helpText="Select a church photo from the 28-image library or choose No Photo for text-only."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Organizer Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Liturgical Commission"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Registration Information (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RSVP with Coordinator"
                    value={formData.registrationInfo}
                    onChange={(e) => setFormData({ ...formData, registrationInfo: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
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
                  <span>{saving ? 'Saving...' : 'Save Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
