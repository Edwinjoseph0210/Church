import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { GalleryAlbum } from '../../types';
import { Image as ImageIcon, Plus, Trash2, X, Save, Eye, EyeOff } from 'lucide-react';

export const AdminGalleryPage: React.FC = () => {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'CREATE_ALBUM' | 'ADD_IMAGE' | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null);
  const [saving, setSaving] = useState(false);

  const [albumForm, setAlbumForm] = useState({
    title: '',
    description: '',
    category: 'Parish Feast',
    coverImageUrl: '/images/hero_church_facade_1790490137085.jpg',
    isPublic: true,
    isPublished: true,
  });

  const [imageForm, setImageForm] = useState({
    imageUrl: '',
    caption: '',
  });

  const loadAlbums = async () => {
    try {
      const data = await apiRequest<GalleryAlbum[]>('/gallery');
      setAlbums(data);
    } catch (err) {
      console.error('Failed to load albums:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlbums();
  }, []);

  const openCreateAlbum = () => {
    setAlbumForm({
      title: '',
      description: '',
      category: 'Parish Feast',
      coverImageUrl: '/images/hero_church_facade_1790490137085.jpg',
      isPublic: true,
      isPublished: true,
    });
    setModalMode('CREATE_ALBUM');
  };

  const openAddImage = (a: GalleryAlbum) => {
    setSelectedAlbum(a);
    setImageForm({
      imageUrl: '',
      caption: '',
    });
    setModalMode('ADD_IMAGE');
  };

  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest<GalleryAlbum>('/gallery', {
        method: 'POST',
        body: JSON.stringify(albumForm),
      });
      setModalMode(null);
      loadAlbums();
    } catch (err: any) {
      alert(err.message || 'Failed to create album');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlbum) return;
    setSaving(true);
    try {
      await apiRequest(`/gallery/${selectedAlbum.id}/images`, {
        method: 'POST',
        body: JSON.stringify(imageForm),
      });
      setModalMode(null);
      loadAlbums();
    } catch (err: any) {
      alert(err.message || 'Failed to add image');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm('Are you sure you want to delete this album and its photos?')) return;
    try {
      await apiRequest(`/gallery/${id}`, { method: 'DELETE' });
      loadAlbums();
    } catch (err: any) {
      alert(err.message || 'Failed to delete album');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
            Media & Archives
          </span>
          <h1 className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
            Photo Gallery Management
          </h1>
          <p className="text-xs text-stone-500 font-editorial">
            Manage public and member-only photo albums, upload high-resolution images, and organize memories.
          </p>
        </div>

        <button
          onClick={openCreateAlbum}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Album</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 p-12 text-center text-xs text-stone-500">
            Loading albums...
          </div>
        ) : albums.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200">
            No albums created.
          </div>
        ) : (
          albums.map((album) => (
            <div
              key={album.id}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-16/10 bg-stone-900 overflow-hidden">
                  <img
                    src={album.coverImageUrl}
                    alt={album.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded text-[10px] text-white font-mono backdrop-blur-xs">
                    <ImageIcon className="w-3 h-3" />
                    <span>{album.imageCount || 0}</span>
                  </div>
                </div>

                <div className="p-5 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-amber-800 uppercase tracking-wider">
                      {album.category}
                    </span>
                    <span className="text-stone-400 font-mono">
                      {album.isPublic ? 'Public' : 'Members Only'}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    {album.title}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-2 font-editorial">
                    {album.description}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => openAddImage(album)}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Photo</span>
                </button>

                <button
                  onClick={() => handleDeleteAlbum(album.id)}
                  className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-md cursor-pointer"
                  title="Delete Album"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Album Modal */}
      {modalMode === 'CREATE_ALBUM' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Create Photo Album
              </h2>
              <button
                onClick={() => setModalMode(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAlbum} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Album Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parish Feast Procession"
                  value={albumForm.title}
                  onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Parish Feast / Easter / Youth"
                    value={albumForm.category}
                    onChange={(e) => setAlbumForm({ ...albumForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Visibility
                  </label>
                  <select
                    value={albumForm.isPublic ? 'true' : 'false'}
                    onChange={(e) => setAlbumForm({ ...albumForm, isPublic: e.target.value === 'true' })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                  >
                    <option value="true">Public (Everyone)</option>
                    <option value="false">Members Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={albumForm.coverImageUrl}
                  onChange={(e) => setAlbumForm({ ...albumForm, coverImageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={albumForm.description}
                  onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                />
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
                  <span>{saving ? 'Creating...' : 'Create Album'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Photo Modal */}
      {modalMode === 'ADD_IMAGE' && selectedAlbum && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Add Photo to "{selectedAlbum.title}"
              </h2>
              <button
                onClick={() => setModalMode(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveImage} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Image Path / URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="/images/... or image URL"
                  value={imageForm.imageUrl}
                  onChange={(e) => setImageForm({ ...imageForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Caption / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Solemn blessing of the faithful"
                  value={imageForm.caption}
                  onChange={(e) => setImageForm({ ...imageForm, caption: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
                />
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
                  <span>{saving ? 'Uploading...' : 'Save Photo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
