import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { ParishEvent } from '../../types';
import { Calendar, Clock, MapPin, User, Search, Tag } from 'lucide-react';

export const MemberEventsPage: React.FC = () => {
  const [events, setEvents] = useState<ParishEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await apiRequest<ParishEvent[]>('/events');
        setEvents(data);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const filtered = events.filter((e) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
            Liturgical & Parish Calendar
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            Parish Events & Celebrations
          </h1>
          <p className="text-xs text-stone-500 font-editorial mt-0.5">
            Feast day celebrations, family unit prayer meetings, catechism activities, and parish fellowships.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search events by title, venue, or coordinator..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-800"
        />
      </div>

      {/* Events List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-stone-500">Loading parish calendar...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-stone-500 bg-stone-50 rounded-xl border border-dashed border-stone-200">
          No upcoming events recorded matching your query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-stone-50 border border-stone-200/80 hover:border-amber-800/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl bg-amber-100 border border-amber-200 text-amber-900 flex flex-col items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 mb-0.5" />
                    <span className="text-xs font-mono font-bold leading-none">
                      {item.date.split('-')[2] || 'Day'}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-amber-800">
                      {item.date.split('-')[1] ? `M${item.date.split('-')[1]}` : ''}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-stone-200 text-stone-700 mb-1">
                      {item.status}
                    </span>
                    <h3 className="font-serif text-base font-bold text-stone-900 leading-snug">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-stone-600 font-editorial line-clamp-3">
                  {item.description}
                </p>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-stone-200/60 text-[11px] text-stone-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-900 shrink-0" />
                  <span>
                    {item.startTime} {item.endTime ? `– ${item.endTime}` : ''} ({item.date})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-900 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
                {item.organizer && (
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-amber-900 shrink-0" />
                    <span className="truncate">Organized by {item.organizer}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
