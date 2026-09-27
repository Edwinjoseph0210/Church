import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { GalleryAlbum } from '../../types';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryPageProps {
  navigate: (path: string) => void;
  selectedId?: string;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ navigate, selectedId }) => {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [activeAlbum, setActiveAlbum] = useState<GalleryAlbum | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadAlbums() {
      try {
        const data = await apiRequest<GalleryAlbum[]>('/gallery');
        setAlbums(data);

        if (selectedId) {
          const detail = await apiRequest<GalleryAlbum>(`/gallery/${selectedId}`);
          setActiveAlbum(detail);
        }
      } catch (err) {
        console.error('Failed to load gallery albums:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAlbums();
  }, [selectedId]);

  const openAlbum = async (albumId: string) => {
    try {
      const detail = await apiRequest<GalleryAlbum>(`/gallery/${albumId}`);
      setActiveAlbum(detail);
      setLightboxIndex(null);
    } catch (err) {
      console.error('Failed to load album images:', err);
    }
  };

  const categories = ['ALL', 'Parish Feast', 'Liturgy', 'Community Activities'];

  const filtered = activeCategory === 'ALL'
    ? albums
    : albums.filter((a) => a.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-12 text-center">
        <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
          Parish Archives
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 mt-2 mb-4">
          Photo Gallery & Memory Album
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto font-editorial">
          Capturing sacred liturgical moments, patronal feast celebrations, catechism activities, and vibrant community fellowship.
        </p>
        <div className="w-16 h-1 bg-amber-800 mx-auto mt-6 rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Category Filter */}
        <div className="flex items-center justify-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => {
                setActiveCategory(c);
                setActiveAlbum(null);
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeCategory === c
                  ? 'bg-amber-900 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* If viewing a single album */}
        {activeAlbum ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <button
                  onClick={() => setActiveAlbum(null)}
                  className="text-xs font-semibold text-amber-900 hover:underline mb-1 cursor-pointer"
                >
                  ← Back to All Albums
                </button>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  {activeAlbum.title}
                </h2>
                <p className="text-xs text-stone-500 font-editorial mt-0.5">
                  {activeAlbum.description}
                </p>
              </div>
              <span className="text-xs text-stone-400 font-mono">
                {activeAlbum.images?.length || 0} Photos
              </span>
            </div>

            {activeAlbum.images && activeAlbum.images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {activeAlbum.images.map((img, idx) => (
                  <div
                    key={img.id}
                    onClick={() => setLightboxIndex(idx)}
                    className="group relative rounded-xl overflow-hidden shadow-xs border border-stone-200 bg-stone-900 aspect-4/3 cursor-pointer"
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.caption || activeAlbum.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-end">
                      <p className="text-xs text-stone-200 font-editorial">
                        {img.caption || 'Parish photograph'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-stone-500 bg-white rounded-xl border border-stone-200">
                This album does not have any photographs yet.
              </div>
            )}
          </div>
        ) : (
          /* Album Grid */
          <div>
            {loading ? (
              <div className="p-12 text-center text-xs text-stone-500 bg-white rounded-xl border border-stone-200">
                Loading photo albums...
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-xs text-stone-500 bg-white rounded-xl border border-stone-200">
                No albums found in this category.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {filtered.map((album) => (
                  <div
                    key={album.id}
                    onClick={() => openAlbum(album.id)}
                    className="group bg-white rounded-xl border border-stone-200/90 shadow-xs overflow-hidden hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="relative aspect-16/10 overflow-hidden bg-stone-900">
                      <img
                        src={album.coverImageUrl}
                        alt={album.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                      />
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono backdrop-blur-xs flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>{album.imageCount || 1}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <span className="text-[10px] uppercase font-semibold text-amber-800 tracking-wider">
                        {album.category}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-stone-900 mt-1 mb-1.5 group-hover:text-amber-900 transition-colors">
                        {album.title}
                      </h3>
                      <p className="text-xs text-stone-600 line-clamp-2 font-editorial">
                        {album.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && activeAlbum && activeAlbum.images && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 sm:p-8">
          <div className="w-full flex items-center justify-between text-white text-xs">
            <span className="font-serif font-semibold text-sm">
              {activeAlbum.title} ({lightboxIndex + 1} / {activeAlbum.images.length})
            </span>
            <button
              onClick={() => setLightboxIndex(null)}
              className="p-2 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative max-w-4xl max-h-[75vh] w-full flex items-center justify-center">
            <img
              src={activeAlbum.images[lightboxIndex].imageUrl}
              alt={activeAlbum.images[lightboxIndex].caption}
              referrerPolicy="no-referrer"
              className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
            />

            {lightboxIndex > 0 && (
              <button
                onClick={() => setLightboxIndex(lightboxIndex - 1)}
                className="absolute left-2 sm:-left-12 p-2 rounded-full bg-stone-900/80 text-white hover:bg-stone-800 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {lightboxIndex < activeAlbum.images.length - 1 && (
              <button
                onClick={() => setLightboxIndex(lightboxIndex + 1)}
                className="absolute right-2 sm:-right-12 p-2 rounded-full bg-stone-900/80 text-white hover:bg-stone-800 cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          <div className="text-center text-xs text-stone-300 font-editorial max-w-xl">
            {activeAlbum.images[lightboxIndex].caption || activeAlbum.title}
          </div>
        </div>
      )}
    </div>
  );
};
