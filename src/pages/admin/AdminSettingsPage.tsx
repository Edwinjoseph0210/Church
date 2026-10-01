import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Settings, Save, CheckCircle2, AlertCircle, Church } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState({
    churchName: '',
    tradition: '',
    diocese: '',
    parishPriest: '',
    assistantPriests: '',
    address: '',
    phone: '',
    email: '',
    officeHours: '',
    website: '',
    heroTagline: '',
    heroImageUrl: '',
    aboutHistory: '',
    missionStatement: '',
    visionStatement: '',
  });

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData({
        churchName: settings.churchName || 'St. Mariam Thresia Syro-Malabar Catholic Church',
        tradition: settings.tradition || 'Syro-Malabar Catholic Church',
        diocese: settings.diocese || 'Diocese of Hosur',
        parishPriest: settings.parishPriest && settings.parishPriest !== '[PARISH PRIEST NAME]' ? settings.parishPriest : 'Fr. Joshy N George',
        assistantPriests: settings.assistantPriests && settings.assistantPriests !== '[ASSISTANT PRIEST NAME]' ? settings.assistantPriests : 'Msgr. Varghese Pereppadan',
        address: settings.address || '9, 1E, GST Road, J C K Nagar, Chengalpattu, Tamil Nadu 603002',
        phone: settings.phone || '+91 97421 62172',
        email: settings.email || 'stmariamthresiaparish@gmail.com',
        officeHours: settings.officeHours || 'Monday - Saturday: 9:00 AM - 1:00 PM, 4:00 PM - 7:00 PM',
        website: settings.website || 'https://stmariamthresia.church',
        heroTagline: settings.heroTagline || 'United in Faith. Growing in Love. Serving Together.',
        heroImageUrl: settings.heroImageUrl || '/images/holy_qurbana_altar_1790490159004.jpg',
        aboutHistory: settings.aboutHistory || '[PARISH HISTORY TO BE ADDED]',
        missionStatement: settings.missionStatement || '',
        visionStatement: settings.visionStatement || '',
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await updateSettings(formData);
      setFeedback('Parish settings and church identity updated successfully. Changes are live on public site.');
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-8">
      <div>
        <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
          Configuration & Identity
        </span>
        <h1 className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
          Parish Settings & Information Placeholders
        </h1>
        <p className="text-xs text-stone-500 font-editorial">
          All values configured here automatically populate the public website, liturgical header, footer, and member portal.
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Core Church Identity */}
        <div className="p-5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
            <Church className="w-4 h-4 text-amber-900" />
            <h2 className="font-serif text-sm font-bold text-stone-900">
              Canonical Identity
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Official Church Name *
              </label>
              <input
                type="text"
                required
                value={formData.churchName}
                onChange={(e) => setFormData({ ...formData, churchName: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800 font-serif font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Liturgical Tradition *
              </label>
              <input
                type="text"
                required
                value={formData.tradition}
                onChange={(e) => setFormData({ ...formData, tradition: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Diocese / Eparchy
              </label>
              <input
                type="text"
                value={formData.diocese}
                onChange={(e) => setFormData({ ...formData, diocese: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Parish Vicar / Pastor
              </label>
              <input
                type="text"
                value={formData.parishPriest}
                onChange={(e) => setFormData({ ...formData, parishPriest: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Assistant Priests
              </label>
              <input
                type="text"
                value={formData.assistantPriests}
                onChange={(e) => setFormData({ ...formData, assistantPriests: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
              />
            </div>
          </div>
        </div>

        {/* Contact & Hours */}
        <div className="p-5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-4">
          <h2 className="font-serif text-sm font-bold text-stone-900 pb-2 border-b border-stone-200">
            Parish Office Contact & Office Hours
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Telephone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Parish Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Official Website
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Parish Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Office Hours
              </label>
              <input
                type="text"
                value={formData.officeHours}
                onChange={(e) => setFormData({ ...formData, officeHours: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800"
              />
            </div>
          </div>
        </div>

        {/* Editorial Text: Tagline, History, Mission, Vision */}
        <div className="p-5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-4">
          <h2 className="font-serif text-sm font-bold text-stone-900 pb-2 border-b border-stone-200">
            Parish Narrative & Mission
          </h2>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Homepage Welcoming Tagline
            </label>
            <input
              type="text"
              value={formData.heroTagline}
              onChange={(e) => setFormData({ ...formData, heroTagline: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800 font-editorial text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Hero Section Background Image URL
            </label>
            <input
              type="text"
              value={formData.heroImageUrl}
              onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
              placeholder="/images/... or public image URL"
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800 font-mono text-xs"
            />
            {formData.heroImageUrl && (
              <div className="mt-2 relative w-48 h-24 rounded-lg overflow-hidden border border-stone-200 shadow-xs">
                <img
                  src={formData.heroImageUrl}
                  alt="Hero Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Parish History Text Placeholder
            </label>
            <textarea
              rows={3}
              value={formData.aboutHistory}
              onChange={(e) => setFormData({ ...formData, aboutHistory: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800 font-editorial"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Parish Mission Statement
              </label>
              <textarea
                rows={3}
                value={formData.missionStatement}
                onChange={(e) => setFormData({ ...formData, missionStatement: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800 font-editorial"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Parish Vision Statement
              </label>
              <textarea
                rows={3}
                value={formData.visionStatement}
                onChange={(e) => setFormData({ ...formData, visionStatement: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-800 font-editorial"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-amber-900 hover:bg-amber-950 text-white rounded-lg font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating...' : 'Save Parish Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
