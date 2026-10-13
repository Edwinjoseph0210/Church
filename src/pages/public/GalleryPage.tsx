import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/services/api';
import { GalleryImage } from '@/types';
import { Calendar, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryPageProps {
  navigate: (path: string) => void;
  selectedId?: string;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ navigate }) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const getAspectClass = (ratio?: string) => {
    switch (ratio) {
      case 'square': return 'aspect-square';
      case 'portrait': return 'aspect-[3/4]';
      case 'landscape': return 'aspect-video';
      case 'natural': return 'h-auto min-h-[240px]';
      default: return 'aspect-video';
    }
  };

  useEffect(() => {
    const loadImages = async () => {
      try {
        const serverData = await apiRequest<GalleryImage[]>('/gallery/images').catch(() => []);
        const localData = JSON.parse(localStorage.getItem('parish_gallery_uploads') || '[]');
        const deletedIds = JSON.parse(localStorage.getItem('parish_gallery_deleted_ids') || '[]');

        const combined = [...localData, ...(Array.isArray(serverData) ? serverData : [])];

        const filtered = combined.filter((img: any) => {
          if (!img) return false;
          const url = typeof img === 'string' ? img : (img.imageUrl || img.url);
          const id = typeof img === 'object' ? img.id : undefined;
          return !deletedIds.includes(id) && !deletedIds.includes(url);
        });

        // Robustly normalize even if metadata is sparse or missing
        const normalized = filtered
          .map((img, index) => {
            if (typeof img === 'string') {
              return {
                id: `IMG-STR-${index}`,
                albumId: 'ALB-DEFAULT-1',
                imageUrl: img,
                caption: 'Parish Community Photo',
                eventDate: new Date().toISOString().split('T')[0],
                aspectRatio: 'landscape',
                order: index,
                createdAt: new Date().toISOString(),
              };
            }
            return {
              ...img,
              id: img.id || `IMG-GEN-${index}`,
              albumId: img.albumId || 'ALB-DEFAULT-1',
              imageUrl: img.imageUrl || (img as any).url || '',
              caption: img.caption || (img as any).title || 'Parish Community Photo',
              eventDate: img.eventDate || new Date().toISOString().split('T')[0],
              aspectRatio: img.aspectRatio || 'landscape',
              order: img.order ?? index,
              createdAt: img.createdAt || new Date().toISOString(),
            };
          });

        const unique = Array.from(new Map(normalized.map((item) => [item.id || item.imageUrl, item])).values());
        setImages(unique);
      } catch (err) {
        console.error('Failed to load gallery images:', err);
        const localData = JSON.parse(localStorage.getItem('parish_gallery_uploads') || '[]');
        const deletedIds = JSON.parse(localStorage.getItem('parish_gallery_deleted_ids') || '[]');
        const filtered = localData.filter((img: any) => !deletedIds.includes(img.id) && !deletedIds.includes(img.imageUrl));
        const normalized = filtered.map((img: any, index: number) => ({
          ...img,
          id: img.id || `IMG-GEN-${index}`,
          imageUrl: img.imageUrl || '',
          caption: img.caption || 'Parish Community Photo',
          eventDate: img.eventDate || new Date().toISOString().split('T')[0],
          aspectRatio: img.aspectRatio || 'landscape',
        }));
        setImages(normalized);
      } finally {
        setLoading(false);
      }
    };

    loadImages();

    const handleStorage = () => loadImages();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('parish_gallery_updated', handleStorage);
    window.addEventListener('focus', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('parish_gallery_updated', handleStorage);
      window.removeEventListener('focus', handleStorage);
    };
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-12 text-center">
        <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
          Parish Archives & Memories
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 mt-2 mb-4">
          Photo Gallery
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto font-editorial">
          Capturing sacred liturgical moments, patronal feast celebrations, catechism activities, and vibrant community fellowship.
        </p>
        <div className="w-16 h-1 bg-amber-800 mx-auto mt-6 rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500 bg-white rounded-xl border border-stone-200">
            Loading photo gallery...
          </div>
        ) : images.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500 bg-white rounded-xl border border-stone-200 shadow-xs">
            <ImageIcon className="w-8 h-8 text-amber-900/40 mx-auto mb-3" />
            <h3 className="font-serif text-base font-bold text-stone-900 mb-1">No Photographs Published Yet</h3>
            <p className="text-xs text-stone-500 font-editorial">
              Parish priests can publish event photos with calendar dates and descriptions directly from the Priest Portal.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {images.map((img, idx) => (
              <div
                key={img.id}
                onClick={() => setLightboxIndex(idx)}
                className={`group relative rounded-xl overflow-hidden shadow-xs border border-stone-200 bg-stone-900 ${getAspectClass(img.aspectRatio)} cursor-pointer`}
              >
                <img
                  src={img.imageUrl}
                  alt={img.caption || 'Parish photograph'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent p-5 flex flex-col justify-end">
                  {img.eventDate && (
                    <span className="text-[10px] text-amber-300 font-mono mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {img.eventDate}
                    </span>
                  )}
                  <h3 className="font-serif text-sm font-bold text-white line-clamp-1 leading-snug">
                    {img.caption || 'Parish Event'}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 sm:p-8">
          <div className="w-full flex items-center justify-between text-white text-xs">
            <span className="font-serif font-semibold text-sm">
              Parish Photo ({lightboxIndex + 1} / {images.length})
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
              src={images[lightboxIndex].imageUrl}
              alt={images[lightboxIndex].caption}
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

            {lightboxIndex < images.length - 1 && (
              <button
                onClick={() => setLightboxIndex(lightboxIndex + 1)}
                className="absolute right-2 sm:-right-12 p-2 rounded-full bg-stone-900/80 text-white hover:bg-stone-800 cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          <div className="text-center space-y-1 max-w-xl">
            {images[lightboxIndex].eventDate && (
              <div className="text-[11px] text-amber-400 font-mono flex items-center justify-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Date: {images[lightboxIndex].eventDate}</span>
              </div>
            )}
            <div className="text-xs text-stone-200 font-editorial">
              {images[lightboxIndex].caption || 'Parish Event Photograph'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
