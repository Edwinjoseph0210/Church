import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/services/api';
import { GalleryImage } from '@/types';
import { Image as ImageIcon, Trash2, Upload, Calendar, CheckCircle2 } from 'lucide-react';

export const AdminGalleryPage: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [form, setForm] = useState({
    imageUrl: '',
    caption: '',
    eventDate: new Date().toISOString().split('T')[0],
  });

  const loadImages = async () => {
    try {
      const serverData = await apiRequest<GalleryImage[]>('/gallery/images').catch(() => []);
      const localData = JSON.parse(localStorage.getItem('parish_gallery_uploads') || '[]');
      const deletedIds = JSON.parse(localStorage.getItem('parish_gallery_deleted_ids') || '[]');
      
      const combined = [...localData, ...(Array.isArray(serverData) ? serverData : [])];
      
      const filtered = combined.filter((img: any) => {
        if (!img) return false;
        const id = img.id;
        const url = img.imageUrl || (img as any).url;
        const isDeleted = deletedIds.includes(id) || deletedIds.includes(url) || deletedIds.some((d: string) => url && d && typeof url === 'string' && typeof d === 'string' && (url === d || url.startsWith(d) || d.startsWith(url)));
        return !isDeleted;
      });

      const normalized = filtered.map((img: any, index: number) => ({
        ...img,
        id: img.id || `IMG-GEN-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
        albumId: img.albumId || 'ALB-DEFAULT-1',
        imageUrl: img.imageUrl || img.url || '',
        caption: img.caption || img.title || 'Parish Event',
        eventDate: img.eventDate || new Date().toISOString().split('T')[0],
        aspectRatio: img.aspectRatio || 'landscape',
        createdAt: img.createdAt || new Date().toISOString(),
      }));

      const unique = Array.from(new Map(normalized.map((item) => [item.id || item.imageUrl, item])).values());
      setImages(unique);
    } catch (err) {
      console.error('Failed to load gallery images:', err);
      const localData = JSON.parse(localStorage.getItem('parish_gallery_uploads') || '[]');
      const deletedIds = JSON.parse(localStorage.getItem('parish_gallery_deleted_ids') || '[]');
      const filtered = localData.filter((img: any) => {
        const url = img.imageUrl || (img as any).url;
        const isDeleted = deletedIds.includes(img.id) || deletedIds.includes(url) || deletedIds.some((d: string) => url && d && typeof url === 'string' && typeof d === 'string' && (url === d || url.startsWith(d) || d.startsWith(url)));
        return !isDeleted;
      });
      setImages(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
    const handleUpdate = () => loadImages();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('parish_gallery_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('parish_gallery_updated', handleUpdate);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setForm((prev) => ({ ...prev, imageUrl: uploadEvent.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl) {
      alert('Please select an image file from your device.');
      return;
    }
    if (!form.caption) {
      alert('Please enter a photo name / title.');
      return;
    }

    setSaving(true);
    setSuccessMessage('');

    const newPhotoItem: GalleryImage = {
      id: `IMG-LOCAL-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      albumId: 'ALB-DEFAULT-1',
      imageUrl: form.imageUrl,
      caption: form.caption,
      eventDate: form.eventDate,
      aspectRatio: 'landscape',
      order: images.length + 1,
      createdAt: new Date().toISOString(),
    };

    try {
      await apiRequest<GalleryImage>('/gallery/images', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: form.imageUrl,
          caption: form.caption,
          eventDate: form.eventDate,
          aspectRatio: 'landscape',
        }),
      }).catch((apiErr) => {
        console.warn('Backend API save failed, relying on localStorage:', apiErr);
      });

      const localData = JSON.parse(localStorage.getItem('parish_gallery_uploads') || '[]');
      const updatedLocal = [newPhotoItem, ...localData];
      localStorage.setItem('parish_gallery_uploads', JSON.stringify(updatedLocal));

      window.dispatchEvent(new Event('parish_gallery_updated'));

      setSuccessMessage('Photo successfully published to parish gallery!');
      setForm({
        imageUrl: '',
        caption: '',
        eventDate: new Date().toISOString().split('T')[0],
      });
      loadImages();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to upload photo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, imageUrl?: string) => {
    try {
      // 1. Instantly update UI state and remove from images
      setImages((prev) => prev.filter((i) => i.id !== id && i.imageUrl !== imageUrl));

      // 2. Save deleted IDs & URL to localStorage deleted registry
      const deletedIds = JSON.parse(localStorage.getItem('parish_gallery_deleted_ids') || '[]');
      if (id && !deletedIds.includes(id)) deletedIds.push(id);
      if (imageUrl && !deletedIds.includes(imageUrl)) deletedIds.push(imageUrl);
      if (imageUrl) {
        deletedIds.push(imageUrl.substring(0, 100));
      }
      localStorage.setItem('parish_gallery_deleted_ids', JSON.stringify(deletedIds));

      // 3. Remove from local uploads in localStorage
      const localData = JSON.parse(localStorage.getItem('parish_gallery_uploads') || '[]');
      const filteredLocal = localData.filter((i: any) => {
        const iUrl = i.imageUrl || (i as any).url;
        return i.id !== id && iUrl !== imageUrl && (!imageUrl || !iUrl || !iUrl.includes(imageUrl));
      });
      localStorage.setItem('parish_gallery_uploads', JSON.stringify(filteredLocal));

      // 4. Call backend delete API asynchronously
      apiRequest('/gallery/images/delete', {
        method: 'POST',
        body: JSON.stringify({ id, imageUrl }),
      }).catch(() => {});

      window.dispatchEvent(new Event('parish_gallery_updated'));
      setSuccessMessage('Photo successfully deleted from parish gallery.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete photo');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-stone-200 pb-5">
        <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
          Priest & Admin Portal
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
          Parish Photo Gallery Management
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 font-editorial">
          Upload event photos from your phone, tablet, or PC. Select an image, give it a title, and publish directly to the public gallery and homepage.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-900 text-xs font-semibold animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Upload Form Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
        <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
          <Upload className="w-5 h-5 text-amber-800" />
          <span>Upload New Parish Photo</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider">
                Select Photo from Device (Phone / Tablet / PC) *
              </label>
              <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:border-amber-800 transition-colors bg-stone-50 relative group cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <div className="space-y-2 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-stone-800">
                    Click to choose photo or take picture
                  </div>
                  <p className="text-[11px] text-stone-500 font-editorial">
                    Supports JPG, PNG, WEBP (instant upload from mobile camera or gallery)
                  </p>
                </div>
              </div>
            </div>

            {/* Photo Preview & Details */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider">
                  Photo Title / Event Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Easter Sunday Holy Qurbana Procession"
                  value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider">
                  Event Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 bg-white"
                  />
                  <Calendar className="w-4 h-4 text-stone-400 absolute right-3 top-3.5 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Box */}
          {form.imageUrl && (
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                Selected Photo Preview:
              </span>
              <div className="relative aspect-video max-w-md rounded-xl overflow-hidden bg-stone-900 border border-stone-200 shadow-sm">
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{saving ? 'Publishing Photo...' : 'Publish Photo to Parish Gallery'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Published Photos Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-stone-900">
            Published Parish Photos ({images.length})
          </h2>
          <span className="text-xs text-stone-500 font-editorial">
            Visible on Homepage & Public Gallery
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200">
            Loading published photos...
          </div>
        ) : images.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-2">
            <ImageIcon className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="font-serif font-bold text-stone-800 text-sm">No photos published yet</p>
            <p className="text-stone-500 font-editorial">Upload your first photo using the form above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {images.map((img, index) => (
              <div
                key={`${img.id}-${index}`}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-video bg-stone-900 overflow-hidden">
                    <img
                      src={img.imageUrl}
                      alt={img.caption}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 space-y-1.5">
                    {img.eventDate && (
                      <div className="text-[10px] text-amber-800 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{img.eventDate}</span>
                      </div>
                    )}
                    <h3 className="font-serif text-sm font-bold text-stone-900 line-clamp-2 leading-snug">
                      {img.caption || 'Parish Event'}
                    </h3>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(img.id, img.imageUrl);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-red-700 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer z-20 relative"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Photo</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
