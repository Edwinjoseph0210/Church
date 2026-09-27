import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { ParishEvent } from '../../types';
import { Calendar, Clock, MapPin, Phone, User, X } from 'lucide-react';

interface EventsPageProps {
  navigate: (path: string) => void;
  selectedId?: string;
}

export const EventsPage: React.FC<EventsPageProps> = ({ navigate, selectedId }) => {
  const [events, setEvents] = useState<ParishEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModalEvent, setActiveModalEvent] = useState<ParishEvent | null>(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await apiRequest<ParishEvent[]>('/events');
        setEvents(data);
        if (selectedId) {
          const match = data.find((e) => e.id === selectedId);
          if (match) setActiveModalEvent(match);
        }
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, [selectedId]);

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-12 text-center">
        <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
          Parish Calendar
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 mt-2 mb-4">
          Events & Liturgical Gatherings
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto font-editorial">
          Join our parish family in prayer, spiritual retreats, youth workshops, and fellowship gatherings.
        </p>
        <div className="w-16 h-1 bg-amber-800 mx-auto mt-6 rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500 bg-white rounded-xl border border-stone-200">
            Loading upcoming parish events...
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500 bg-white rounded-xl border border-stone-200">
            No upcoming events currently scheduled. Please check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.map((evt) => (
              <div
                key={evt.id}
                onClick={() => setActiveModalEvent(evt)}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {evt.imageUrl && (
                    <div className="h-48 overflow-hidden bg-stone-100">
                      <img
                        src={evt.imageUrl}
                        alt={evt.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between text-xs text-stone-500 mb-3">
                      <span className="font-semibold text-amber-900 uppercase tracking-wider">
                        {evt.status}
                      </span>
                      <span className="font-mono text-stone-600">{evt.date}</span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-stone-900 mb-2 leading-snug">
                      {evt.title}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-3 font-editorial leading-relaxed mb-4">
                      {evt.description}
                    </p>

                    <div className="space-y-1.5 text-xs text-stone-600 pt-3 border-t border-stone-100">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>
                          {evt.startTime} {evt.endTime ? `– ${evt.endTime}` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>Organizer: {evt.organizer}</span>
                  <span className="text-amber-900 font-semibold">View Details →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Detail View */}
      {activeModalEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-amber-900">
                  {activeModalEvent.status}
                </span>
                <h2 className="font-serif text-2xl font-bold text-stone-900 mt-1">
                  {activeModalEvent.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveModalEvent(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeModalEvent.imageUrl && (
              <div className="h-56 rounded-xl overflow-hidden bg-stone-100">
                <img
                  src={activeModalEvent.imageUrl}
                  alt={activeModalEvent.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs">
              <div className="flex items-center gap-2 text-stone-700">
                <Calendar className="w-4 h-4 text-amber-900" />
                <span><strong>Date:</strong> {activeModalEvent.date}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700">
                <Clock className="w-4 h-4 text-amber-900" />
                <span><strong>Time:</strong> {activeModalEvent.startTime} {activeModalEvent.endTime ? `– ${activeModalEvent.endTime}` : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700 col-span-2">
                <MapPin className="w-4 h-4 text-amber-900" />
                <span><strong>Location:</strong> {activeModalEvent.location}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700">
                <User className="w-4 h-4 text-amber-900" />
                <span><strong>Organizer:</strong> {activeModalEvent.organizer}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700">
                <Phone className="w-4 h-4 text-amber-900" />
                <span><strong>Contact:</strong> {activeModalEvent.contactInfo}</span>
              </div>
            </div>

            <div className="font-editorial text-stone-700 text-sm leading-relaxed whitespace-pre-line">
              {activeModalEvent.description}
            </div>

            {activeModalEvent.registrationInfo && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-950 font-editorial">
                <strong>Registration Note:</strong> {activeModalEvent.registrationInfo}
              </div>
            )}

            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setActiveModalEvent(null)}
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
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
