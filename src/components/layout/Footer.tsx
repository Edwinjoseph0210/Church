import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { MapPin, Phone, Mail, Clock, ExternalLink, Navigation } from 'lucide-react';
import churchLogo from '../../assets/church_logo.svg';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { settings } = useSettings();

  const churchName = settings?.churchName || 'St. Mariam Thresia Syro-Malabar Catholic Church';
  const tradition = settings?.tradition || 'Syro-Malabar Catholic Church';
  const diocese = settings?.diocese || 'Diocese of Hosur';
  const address = settings?.address || '9, 1E, GST Road, J C K Nagar, Chengalpattu, Tamil Nadu 603002';
  const phone = settings?.phone || '+91 97421 62172';
  const parishPriest = settings?.parishPriest && settings.parishPriest !== '[PARISH PRIEST NAME]' ? settings.parishPriest : 'Fr. Joshy N George';
  const email = settings?.email || 'stmariamthresiaparish@gmail.com';
  const officeHours = settings?.officeHours || 'Monday - Saturday: 9:00 AM - 1:00 PM, 4:00 PM - 7:00 PM';

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Col 1: Identity */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 p-1 rounded-full bg-amber-500/10 border border-amber-500/20 mt-1">
                <img
                  src={churchLogo}
                  alt="St. Mariam Thresia Church Logo"
                  className="w-8 h-8 object-contain"
                  width="32"
                  height="32"
                />
              </div>
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide leading-tight">
                  {churchName}
                </h2>
                <p className="text-xs uppercase tracking-widest text-amber-400 mt-1 font-medium">
                  {tradition}
                </p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {diocese} · Chengalpattu
                </p>
              </div>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed font-editorial">
              Dedicated to prayer, family sanctification, and charitable fellowship in the apostolic heritage of Saint Thomas Christians under the patronal intercession of Saint Mariam Thresia.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={settings?.socialLinks?.facebook || 'https://facebook.com'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-amber-900 flex items-center justify-center text-xs text-stone-300 transition-colors"
                aria-label="Facebook"
              >
                FB
              </a>
              <a
                href={settings?.socialLinks?.youtube || 'https://youtube.com'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-amber-900 flex items-center justify-center text-xs text-stone-300 transition-colors"
                aria-label="YouTube"
              >
                YT
              </a>
              <a
                href={settings?.socialLinks?.instagram || 'https://instagram.com'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-amber-900 flex items-center justify-center text-xs text-stone-300 transition-colors"
                aria-label="Instagram"
              >
                IG
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-stone-100 font-semibold">
              Parish Life
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  About the Parish
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/holy-qurbana')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  Holy Qurbana Timings
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/announcements')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  Parish Announcements
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/events')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  Liturgical & Parish Events
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/gallery')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  Photo Gallery & Archives
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/organizations')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  Parish Organizations & Pious Associations
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Holy Qurbana Quick Schedule */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-stone-100 font-semibold">
              Liturgical Worship
            </h3>
            <div className="space-y-2 text-xs text-stone-400">
              <p className="font-medium text-stone-200">Sunday Holy Qurbana</p>
              <p>Morning & Evening celebrations in Malayalam & English.</p>
              <div className="pt-2 border-t border-stone-800">
                <p className="font-medium text-stone-200">Daily Celebrations</p>
                <p>Morning Mass, First Friday Adoration, and Saturday Novena.</p>
              </div>
              <button
                onClick={() => navigate('/holy-qurbana')}
                className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 pt-1 text-xs font-medium cursor-pointer"
              >
                <span>View Full Liturgical Calendar</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Col 4: Parish Office & Contact */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-stone-100 font-semibold">
              Parish Office
            </h3>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="text-stone-300">
                <span className="font-semibold text-amber-300 block text-[11px] uppercase tracking-wider">Parish Priest / Vicar</span>
                <span>{parishPriest}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="break-words">{address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="hover:text-amber-300 transition-colors hover:underline"
                >
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="hover:text-amber-300 transition-colors hover:underline break-all"
                >
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{officeHours}</span>
              </li>
            </ul>
            <div className="pt-2 flex flex-col gap-2">
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="w-full text-center py-2 px-3 bg-amber-900 hover:bg-amber-950 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Church</span>
              </a>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=9%2C+1E%2C+GST+Road%2C+J+C+K+Nagar%2C+Chengalpattu%2C+Tamil+Nadu+603002"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                <span>Get Directions</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>
            © {new Date().getFullYear()} {churchName} · {tradition}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/about')} className="hover:text-stone-300">
              Parish History
            </button>
            <span>·</span>
            <button onClick={() => navigate('/holy-qurbana')} className="hover:text-stone-300">
              Liturgical Schedule
            </button>
            <span>·</span>
            <button onClick={() => navigate('/login')} className="hover:text-amber-400">
              Parish Portal Access
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
