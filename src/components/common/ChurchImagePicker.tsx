import React, { useState } from 'react';
import { CHURCH_IMAGE_LIBRARY, ChurchImageItem } from '../../data/churchImages';
import { Image as ImageIcon, X, Check, Search, EyeOff } from 'lucide-react';

interface ChurchImagePickerProps {
  selectedImageUrl: string;
  onSelectImage: (url: string) => void;
  label?: string;
  helpText?: string;
}

export const ChurchImagePicker: React.FC<ChurchImagePickerProps> = ({
  selectedImageUrl,
  onSelectImage,
  label = 'Select Announcement / Event Photo',
  helpText = 'Choose a church photo from the parish library, or leave unselected to display text-only.',
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    'ALL',
    'Altar & Sanctuary',
    'Eucharist & Liturgy',
    'Holy Bible & Word',
    'Church & Architecture',
    'Prayer & Devotion',
    'Feast & Season',
    'Prayer & Fellowship',
  ];

  const filteredImages = CHURCH_IMAGE_LIBRARY.filter((img) => {
    const matchesCategory = categoryFilter === 'ALL' || img.category === categoryFilter;
    const matchesSearch =
      searchTerm === '' ||
      img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedItem = CHURCH_IMAGE_LIBRARY.find((img) => img.url === selectedImageUrl);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-stone-700">
          {label}
        </label>
        {selectedImageUrl && (
          <button
            type="button"
            onClick={() => onSelectImage('')}
            className="text-[11px] text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>Remove Photo (No Photo)</span>
          </button>
        )}
      </div>

      {/* Selected Image Preview Box or Empty Placeholder */}
      <div className="border border-stone-200 rounded-xl p-3 bg-stone-50/70">
        {selectedImageUrl ? (
          <div className="flex items-center gap-3">
            <div className="w-20 h-16 rounded-lg overflow-hidden border border-stone-300 shrink-0 bg-stone-200 relative">
              <img
                src={selectedImageUrl}
                alt="Selected church"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider block">
                Selected Church Photo
              </span>
              <p className="text-xs font-semibold text-stone-900 truncate">
                {selectedItem ? selectedItem.title : 'Custom Selected Image'}
              </p>
              <p className="text-[11px] text-stone-500">
                {selectedItem ? selectedItem.category : 'Church Library'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-3 py-1.5 bg-white border border-stone-300 hover:border-amber-800 text-stone-700 hover:text-amber-900 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer shrink-0"
            >
              Change Photo
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 py-1">
            <div className="flex items-center gap-2.5 text-stone-500">
              <div className="w-8 h-8 rounded-lg bg-stone-200/80 flex items-center justify-center text-stone-500 shrink-0">
                <EyeOff className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-medium text-stone-700 block">
                  No Photo Selected
                </span>
                <span className="text-[11px] text-stone-500 block">
                  Announcement will be displayed cleanly without any photo.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-3 py-1.5 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1.5"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Choose Photo (28 Available)</span>
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-stone-500 font-editorial">
        {helpText}
      </p>

      {/* Modal: Library Selection */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Select Church Photo
                </h3>
                <p className="text-xs text-stone-500 font-editorial">
                  Choose from 28 high-resolution church & liturgical photos, or choose no photo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Controls Bar: Search & Categories */}
            <div className="px-6 py-3 border-b border-stone-100 bg-white space-y-2">
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search altar, chalice, bible, feast..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                {/* Option: No Photo Button */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectImage('');
                    setModalOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                    !selectedImageUrl
                      ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                      : 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Do Not Show Any Photo (Text Only)</span>
                </button>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1 overflow-x-auto text-[11px]">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-amber-900 text-white font-semibold'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Grid */}
            <div className="p-6 overflow-y-auto flex-1 bg-stone-50/50">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {/* First tile: Explicit "No Photo" tile */}
                <div
                  onClick={() => {
                    onSelectImage('');
                    setModalOpen(false);
                  }}
                  className={`border-2 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-4/3 ${
                    !selectedImageUrl
                      ? 'border-amber-800 bg-amber-50 text-amber-900 shadow-xs'
                      : 'border-dashed border-stone-300 bg-white hover:border-stone-400 text-stone-600'
                  }`}
                >
                  <EyeOff className="w-6 h-6 mb-2 text-stone-400" />
                  <strong className="text-xs block font-semibold">No Photo</strong>
                  <span className="text-[10px] text-stone-500 mt-0.5">
                    Display text only
                  </span>
                  {!selectedImageUrl && (
                    <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </div>

                {filteredImages.map((img) => {
                  const isSelected = selectedImageUrl === img.url;
                  return (
                    <div
                      key={img.id}
                      onClick={() => {
                        onSelectImage(img.url);
                        setModalOpen(false);
                      }}
                      className={`group relative rounded-xl overflow-hidden border-2 bg-white cursor-pointer transition-all aspect-4/3 flex flex-col justify-end ${
                        isSelected
                          ? 'border-amber-800 ring-2 ring-amber-700/30 shadow-md'
                          : 'border-stone-200 hover:border-amber-600 hover:shadow-xs'
                      }`}
                    >
                      <img
                        src={img.thumbnail}
                        alt={img.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-amber-900 text-white p-1 rounded-full shadow-sm">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div className="relative z-10 p-2.5 text-white">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-amber-300 block truncate">
                          {img.category}
                        </span>
                        <p className="text-xs font-serif font-bold text-stone-100 line-clamp-1 group-hover:text-amber-200 transition-colors">
                          {img.title}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-stone-200 bg-white flex items-center justify-between">
              <span className="text-xs text-stone-500">
                {selectedImageUrl ? '1 photo selected' : 'No photo selected'}
              </span>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
