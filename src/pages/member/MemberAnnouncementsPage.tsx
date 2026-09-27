import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Announcement } from '../../types';
import { Megaphone, Search, AlertCircle, Calendar, Tag, ChevronDown, ChevronUp } from 'lucide-react';

export const MemberAnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const data = await apiRequest<Announcement[]>('/announcements');
        setAnnouncements(data);
      } catch (err) {
        console.error('Failed to load announcements:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnnouncements();
  }, []);

  const filtered = announcements.filter((a) => {
    if (categoryFilter !== 'ALL' && a.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories = ['ALL', 'GENERAL', 'LITURGY', 'FEAST', 'CATECHISM', 'YOUTH', 'CHARITY'];

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
            Parish Communications
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            Parish Notices & Bulletins
          </h1>
          <p className="text-xs text-stone-500 font-editorial mt-0.5">
            Official announcements, pastoral letters, and Sunday bulletins for parishioners.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search parish notices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-800"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-amber-900 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat === 'ALL' ? 'All Notices' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notices List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-stone-500">Loading parish notices...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-stone-500 bg-stone-50 rounded-xl border border-dashed border-stone-200">
          No announcements match your search criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="p-5 rounded-xl bg-stone-50 border border-stone-200/80 hover:border-amber-800/40 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                      {item.category}
                    </span>
                    {item.isImportant && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Important
                      </span>
                    )}
                    <span className="text-[11px] text-stone-400 font-mono">
                      {item.publishDate}
                    </span>
                  </div>

                  <span className="text-[11px] text-stone-500 font-editorial">
                    Published by {item.author || 'Parish Office'}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                    {item.title}
                  </h3>
                  <p
                    className={`text-xs text-stone-700 font-editorial mt-1 leading-relaxed ${
                      isExpanded ? '' : 'line-clamp-3'
                    }`}
                  >
                    {item.content}
                  </p>
                </div>

                {item.content.length > 180 && (
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="inline-flex items-center gap-1 text-xs text-amber-900 font-semibold hover:underline cursor-pointer"
                  >
                    <span>{isExpanded ? 'Show Less' : 'Read Full Bulletin'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
