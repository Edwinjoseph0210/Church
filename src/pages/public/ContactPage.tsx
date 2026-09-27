import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { apiRequest } from '../../services/api';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle, Church, Navigation } from 'lucide-react';

interface ContactPageProps {
  navigate: (path: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = () => {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const churchName = settings?.churchName || 'St. Mariam Thresia Syro-Malabar Catholic Church';
  const tradition = settings?.tradition || 'Syro-Malabar Catholic Church';
  const diocese = settings?.diocese || 'Diocese of Hosur';
  const address = settings?.address || '9, 1E, GST Road, J C K Nagar, Chengalpattu, Tamil Nadu 603002';
  const phone = settings?.phone || '+91 97421 62172';
  const parishPriest = settings?.parishPriest && settings.parishPriest !== '[PARISH PRIEST NAME]' ? settings.parishPriest : 'Fr. Joshy N George';
  const email = settings?.email || 'stmariamthresiaparish@gmail.com';
  const officeHours = settings?.officeHours || 'Monday - Saturday: 9:00 AM - 1:00 PM, 4:00 PM - 7:00 PM';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await apiRequest<{ message: string }>('/contact', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      setSuccessMessage(res.message || 'Your inquiry has been sent to the parish office.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-12 text-center">
        <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
          Parish Administration
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 mt-2 mb-4">
          Contact the Parish Office
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto font-editorial">
          Whether you are requesting pastoral certificates, sacramental inquiries, house blessings, or parish enrollment, we are here to assist.
        </p>
        <div className="w-16 h-1 bg-amber-800 mx-auto mt-6 rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white rounded-2xl p-8 border border-stone-200/90 shadow-xs">
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">
            Send Pastoral Message
          </h2>
          <p className="text-xs text-stone-500 font-editorial mb-6">
            Please fill out your details and your inquiry will be directed to the vicar and parish trustees.
          </p>

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your full name"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Subject *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Mass Intentions / Baptism Certificate / General Inquiry"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Your Message *
              </label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your message here..."
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting Message...' : 'Send Message to Parish'}</span>
            </button>
          </form>
        </div>

        {/* Parish Directory & Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-8 border border-stone-200/90 shadow-xs space-y-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900">
                Parish Directory & Location
              </h2>
              <p className="text-xs text-stone-500 font-editorial mt-1">
                {churchName} · {tradition}
              </p>
            </div>

            <div className="space-y-4 text-xs text-stone-700">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
                <MapPin className="w-5 h-5 text-amber-900 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-semibold block text-stone-900">Church Location</span>
                  <span className="text-stone-700 font-editorial leading-relaxed block mt-0.5 break-words">
                    {address}
                  </span>
                  <span className="text-[11px] text-amber-900/80 font-medium block mt-1">
                    {diocese}
                  </span>
                </div>
              </div>

              {/* Parish Priest / Vicar */}
              <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-amber-900 text-amber-100 flex items-center justify-center shrink-0">
                    <Church className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider block">
                      Parish Priest / Vicar
                    </span>
                    <span className="font-serif font-bold text-stone-900 block truncate">
                      {parishPriest}
                    </span>
                    <a
                      href="tel:+919742162172"
                      className="text-amber-900 hover:text-amber-950 font-medium hover:underline text-xs block"
                    >
                      +91 97421 62172
                    </a>
                  </div>
                </div>

                <a
                  href="tel:+919742162172"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-900 hover:bg-amber-950 text-white font-semibold rounded-lg shadow-xs transition-colors shrink-0 text-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Priest</span>
                </a>
              </div>

              <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
                <div className="flex items-center gap-3 min-w-0">
                  <Phone className="w-5 h-5 text-amber-900 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold block text-stone-900">Parish Office Phone</span>
                    <a
                      href={`tel:${phone.replace(/\s+/g, '')}`}
                      className="text-amber-900 hover:text-amber-950 font-medium hover:underline block break-all"
                    >
                      {phone}
                    </a>
                  </div>
                </div>

                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white font-semibold rounded-lg shadow-xs transition-colors shrink-0 text-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Office</span>
                </a>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
                <Mail className="w-5 h-5 text-amber-900 shrink-0" />
                <div className="min-w-0">
                  <span className="font-semibold block text-stone-900">Parish Office Email</span>
                  <a
                    href={`mailto:${email}`}
                    className="text-stone-700 hover:text-amber-900 hover:underline block break-all"
                  >
                    {email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
                <Clock className="w-5 h-5 text-amber-900 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-semibold block text-stone-900">Office Working Hours</span>
                  <span className="text-stone-600 font-editorial block mt-0.5">{officeHours}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map Section with Real Map and Get Directions */}
          <div className="bg-stone-900 text-stone-200 rounded-2xl p-6 border border-stone-800 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold block">
                  Church Sanctuary & Map
                </span>
                <span className="text-[10px] text-stone-400 bg-stone-800 px-2 py-0.5 rounded-full border border-stone-700">
                  {diocese}
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-white mt-1">
                St. Mariam Thresia Syro-Malabar Catholic Church
              </h3>
              <p className="text-xs text-stone-300 font-editorial mt-0.5 leading-relaxed break-words">
                {address}
              </p>
            </div>

            {/* Embedded Google Map */}
            <div className="w-full h-48 sm:h-52 rounded-xl overflow-hidden border border-stone-700/80 bg-stone-800 relative my-2">
              <iframe
                title="St. Mariam Thresia Syro-Malabar Catholic Church Map"
                src="https://maps.google.com/maps?q=9,+1E,+GST+Road,+J+C+K+Nagar,+Chengalpattu,+Tamil+Nadu+603002&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-[11px] text-stone-400 pt-3 mt-2 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span>Visitor parking available on campus</span>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg border border-stone-700 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Call Church</span>
                </a>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=9%2C+1E%2C+GST+Road%2C+J+C+K+Nagar%2C+Chengalpattu%2C+Tamil+Nadu+603002"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-lg shadow-xs transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-stone-950" />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
