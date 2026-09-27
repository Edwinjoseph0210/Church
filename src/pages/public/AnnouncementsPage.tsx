import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Announcement } from '../../types';
import { Search, AlertCircle, Calendar, User, X } from 'lucide-react';

interface AnnouncementsPageProps {
  navigate: (path: string) => void;
  selectedId?: string;
}

export const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({ navigate, selectedId }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [activeModalItem, setActiveModalItem] = useState<Announcement | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await apiRequest<Announcement[]>('/announcements');
        setAnnouncements(data);
        if (selectedId) {
          const match = data.find((a) => a.id === selectedId);
          if (match) setActiveModalItem(match);
        }
      } catch (err) {
        console.error('Failed to load announcements:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedId]);

  const categories = ['ALL', 'FEAST', 'LITURGY', 'CATECHISM', 'YOUTH', 'CHARITY', 'GENERAL'];

  const filtered = announcements.filter((item) => {
    if (category !== 'ALL' && item.category !== category) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.content.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-12 text-center">
        <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
          Parish Bulletin
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 mt-2 mb-4">
          Parish Announcements
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto font-editorial">
          Stay informed with official communications, liturgical celebrations, notices, and parish community news.
        </p>
        <div className="w-16 h-1 bg-amber-800 mx-auto mt-6 rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Search & Category Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  category === c
                    ? 'bg-amber-900 text-white font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Announcements List */}
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500 bg-white rounded-xl border border-stone-200">
            Loading parish announcements...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500 bg-white rounded-xl border border-stone-200">
            No announcements found matching the selected criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveModalItem(item)}
                className={`bg-white rounded-xl p-6 border shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                  item.isImportant ? 'border-amber-700/60 ring-1 ring-amber-700/20' : 'border-stone-200/90'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-3">
                    <span className="font-semibold text-amber-900">{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.publishDate}
                    </span>
                    {item.isImportant && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-red-700 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Important
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="font-serif text-xl font-bold text-stone-900 mb-3 hover:text-amber-900 transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed font-editorial mb-4">
                    {item.content}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-stone-400" />
                    {item.author}
                  </span>
                  <span className="text-amber-900 font-medium">Read Full Announcement →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Detail View */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                  <span className="font-semibold text-amber-900">{activeModalItem.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeModalItem.publishDate}</span>
                  {activeModalItem.isImportant && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-red-700 font-semibold">Important Notice</span>
                    </>
                  )}
                </div>
                <h2 className="font-serif text-2xl font-bold text-stone-900 leading-snug">
                  {activeModalItem.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="pt-4 border-t border-stone-100 font-editorial text-stone-700 text-sm leading-relaxed whitespace-pre-line">
              {activeModalItem.content}
            </div>

            <div className="pt-6 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span>Published by: {activeModalItem.author}</span>
              <button
                onClick={() => setActiveModalItem(null)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
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
