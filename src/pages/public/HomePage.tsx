import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { apiRequest } from '../../services/api';
import { HolyQurbanaTiming, Announcement, ParishEvent, Organization, GalleryAlbum } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  ChevronDown,
  Church,
  Users,
  Compass,
  AlertCircle,
  Phone,
  Navigation,
  ExternalLink,
} from 'lucide-react';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const { settings } = useSettings();
  const [timings, setTimings] = useState<HolyQurbanaTiming[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<ParishEvent[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [timingsRes, annRes, evtRes, orgRes, albRes] = await Promise.all([
          apiRequest<HolyQurbanaTiming[]>('/holy-qurbana'),
          apiRequest<Announcement[]>('/announcements'),
          apiRequest<ParishEvent[]>('/events'),
          apiRequest<Organization[]>('/organizations'),
          apiRequest<GalleryAlbum[]>('/gallery'),
        ]);
        setTimings(timingsRes.slice(0, 4));
        setAnnouncements(annRes.slice(0, 3));
        setEvents(evtRes.slice(0, 3));
        setOrganizations(orgRes.slice(0, 6));
        setAlbums(albRes.slice(0, 3));
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const churchName = settings?.churchName || 'St. Mariam Thresia Syro-Malabar Catholic Church';
  const tradition = settings?.tradition || 'Syro-Malabar Catholic Church';
  const parishPriestName = settings?.parishPriest && settings.parishPriest !== '[PARISH PRIEST NAME]' ? settings.parishPriest : 'Fr. Joshy N George';
  const churchAddress = settings?.address || '9, 1E, GST Road, J C K Nagar, Chengalpattu, Tamil Nadu 603002';
  const churchPhone = settings?.phone || '+91 97421 62172';
  const churchEmail = settings?.email || 'stmariamthresiaparish@gmail.com';
  const churchDiocese = settings?.diocese || 'Diocese of Hosur';
  const heroImage = settings?.heroImageUrl || '/src/assets/images/hero_church_facade_1790490137085.jpg';

  return (
    <div className="min-h-screen bg-stone-50">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-stone-950 text-white">
        {/* Background Image with Deep Contrast Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="St. Mariam Thresia Church sanctuary facade"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-45 scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/65 to-stone-950/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center py-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] uppercase tracking-widest text-amber-300 font-semibold mb-6">
            <Church className="w-3.5 h-3.5" />
            <span>{tradition}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 uppercase leading-tight">
            {churchName}
          </h1>

          <p className="font-editorial text-lg sm:text-2xl text-stone-200 max-w-3xl mx-auto font-light leading-relaxed mb-10 text-balance">
            "{settings?.heroTagline || 'United in Faith. Growing in Love. Serving Together.'}"
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/about')}
              className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              Explore Our Parish
            </button>
            <button
              onClick={() => navigate('/events')}
              className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/25 rounded-lg backdrop-blur-md transition-all cursor-pointer"
            >
              Upcoming Events
            </button>
          </div>

          {/* Quick Schedule Micro Strip */}
          <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-stone-300">
            <div>
              <span className="block text-stone-400 uppercase tracking-widest text-[10px]">Patroness</span>
              <span className="font-medium text-stone-100">St. Mariam Thresia</span>
            </div>
            <div>
              <span className="block text-stone-400 uppercase tracking-widest text-[10px]">Diocese</span>
              <span className="font-medium text-stone-100">{churchDiocese}</span>
            </div>
            <div>
              <span className="block text-stone-400 uppercase tracking-widest text-[10px]">Parish Vicar</span>
              <span className="font-medium text-stone-100">{parishPriestName}</span>
            </div>
            <div>
              <span className="block text-stone-400 uppercase tracking-widest text-[10px]">Sunday Worship</span>
              <span className="font-medium text-amber-300">Holy Qurbana</span>
            </div>
          </div>

          {/* Scroll cue */}
          <div className="mt-12 flex justify-center">
            <ChevronDown className="w-5 h-5 text-stone-400 animate-bounce" />
          </div>
        </div>
      </section>

      {/* 2. WELCOME & PARISH CHARISM */}
      <section className="py-20 bg-stone-50 border-b border-stone-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
            The Domestic Church
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-2 mb-6">
            Welcome to {churchName}
          </h2>
          <div className="w-12 h-1 bg-amber-800 mx-auto mb-8 rounded-full" />

          <p className="font-editorial text-stone-700 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto mb-10 text-balance">
            {settings?.missionStatement ||
              'A home of prayer, family sanctification, and Eucharistic renewal in the ancient Syro-Malabar tradition. We invite all faithful and visitors to experience the living presence of Christ in word and sacrament.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-12">
            <div className="p-6 bg-white rounded-xl border border-stone-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center mb-4">
                <Church className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">
                Apostolic Heritage
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-editorial">
                Rooted in the ancient Syrian liturgical tradition instituted by Saint Thomas the Apostle, celebrating the sacred Raza and mysteries of our redemption.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-stone-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">
                Family & Community
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-editorial">
                Walking in the footsteps of St. Mariam Thresia, Apostle of the Family, strengthening Christian marriage, domestic prayer, and youth formation.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-stone-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">
                Charitable Service
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-editorial">
                Reaching out with compassionate hearts to the sick, elderly, and distressed, demonstrating faith through active Works of Mercy and solidarity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PARISH PRIEST SECTION */}
      <section className="py-20 bg-stone-100/60 border-b border-stone-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden p-8 sm:p-12 flex flex-col md:flex-row items-center gap-10">
            {/* Pastoral Portrait / Avatar */}
            <div className="w-44 h-44 rounded-2xl bg-gradient-to-br from-stone-200 to-amber-100 border border-stone-300 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
              <div className="text-center p-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-amber-900 text-amber-100 flex items-center justify-center mb-2">
                  <Church className="w-7 h-7" />
                </div>
                <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider">
                  Pastoral Office
                </span>
              </div>
            </div>

            <div className="space-y-4 text-center md:text-left">
              <div>
                <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
                  Parish Vicar
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  {parishPriestName}
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  Vicar & Pastor · {churchName}
                </p>
                <div className="pt-1 flex items-center justify-center md:justify-start gap-2">
                  <span className="text-[11px] text-stone-600 font-medium">Pastoral Mobile:</span>
                  <a
                    href="tel:+919742162172"
                    className="text-xs font-bold text-amber-900 hover:text-amber-950 hover:underline"
                  >
                    +91 97421 62172
                  </a>
                </div>
              </div>

              <p className="font-editorial text-sm sm:text-base text-stone-700 leading-relaxed italic">
                "May the peace of Christ and the tender protection of Saint Mariam Thresia dwell in your homes. Our parish is a welcoming family of families, ready to accompany you in prayer, the sacraments, and fellowship. Come, let us worship the Lord in holiness."
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                <button
                  onClick={() => navigate('/contact')}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Contact Parish Office
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Request Pastoral Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOLY QURBANA TIMINGS */}
      <section className="py-20 bg-stone-50 border-b border-stone-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
                Divine Liturgy
              </span>
              <h2 className="font-serif text-3xl font-bold text-stone-900 mt-1">
                Holy Qurbana Timings
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                All schedules are managed dynamically by the parish office
              </p>
            </div>
            <button
              onClick={() => navigate('/holy-qurbana')}
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-xs font-semibold text-amber-900 hover:text-amber-700 transition-colors"
            >
              <span>View Full Schedule & Notes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {timings.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-xl p-6 border border-stone-200/80 shadow-xs hover:border-amber-700/40 transition-colors"
              >
                <div className="flex items-center justify-between text-xs text-stone-400 mb-3">
                  <span className="uppercase tracking-wider font-semibold text-amber-900">
                    {t.dayType}
                  </span>
                  <Clock className="w-4 h-4 text-stone-400" />
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-900 mb-1">
                  {t.dayName}
                </h3>
                <div className="text-base font-semibold text-stone-800 mb-2 font-mono">
                  {t.time}
                </div>
                <div className="text-xs text-stone-500 font-editorial mb-3">
                  {t.language}
                </div>
                {t.description && (
                  <p className="text-xs text-stone-600 line-clamp-2 pt-2 border-t border-stone-100">
                    {t.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LATEST ANNOUNCEMENTS */}
      <section className="py-20 bg-stone-100/50 border-b border-stone-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
                Parish Bulletin
              </span>
              <h2 className="font-serif text-3xl font-bold text-stone-900 mt-1">
                Latest Announcements
              </h2>
            </div>
            <button
              onClick={() => navigate('/announcements')}
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-xs font-semibold text-amber-900 hover:text-amber-700"
            >
              <span>View All Announcements</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                onClick={() => navigate(`/announcements`)}
                className="bg-white rounded-xl border border-stone-200/90 shadow-xs hover:shadow-md transition-all p-6 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-3">
                    <span className="font-semibold text-amber-900">{ann.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{ann.publishDate}</span>
                    {ann.isImportant && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-red-700 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Important
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 mb-2 leading-snug hover:text-amber-900 transition-colors">
                    {ann.title}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed font-editorial">
                    {ann.content}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>By: {ann.author}</span>
                  <span className="text-amber-900 font-medium">Read More →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. UPCOMING EVENTS */}
      <section className="py-20 bg-stone-50 border-b border-stone-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
                Calendar & Programs
              </span>
              <h2 className="font-serif text-3xl font-bold text-stone-900 mt-1">
                Upcoming Parish Events
              </h2>
            </div>
            <button
              onClick={() => navigate('/events')}
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-xs font-semibold text-amber-900 hover:text-amber-700"
            >
              <span>View All Events</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map((evt) => (
              <div
                key={evt.id}
                onClick={() => navigate(`/events`)}
                className="bg-white rounded-xl border border-stone-200/90 shadow-xs overflow-hidden hover:shadow-md transition-all cursor-pointer"
              >
                {evt.imageUrl && (
                  <div className="h-44 overflow-hidden bg-stone-200">
                    <img
                      src={evt.imageUrl}
                      alt={evt.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-amber-900 font-semibold mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{evt.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>{evt.startTime}</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-editorial mb-4">
                    {evt.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 pt-3 border-t border-stone-100">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span className="truncate">{evt.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PARISH ORGANIZATIONS */}
      <section className="py-20 bg-stone-100/60 border-b border-stone-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
            Active Ministries
          </span>
          <h2 className="font-serif text-3xl font-bold text-stone-900 mt-1 mb-4">
            Parish Organizations & Pious Associations
          </h2>
          <p className="text-xs text-stone-600 max-w-2xl mx-auto mb-12 font-editorial">
            Nurturing spirituality, leadership, and fraternity through active parish groups.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {organizations.map((org) => (
              <div
                key={org.id}
                onClick={() => navigate('/organizations')}
                className="bg-white p-6 rounded-xl border border-stone-200/80 shadow-xs hover:border-amber-700/50 transition-colors cursor-pointer"
              >
                <h3 className="font-serif text-base font-bold text-stone-900 mb-1">
                  {org.name}
                </h3>
                <p className="text-xs text-stone-600 line-clamp-2 font-editorial mb-4 leading-relaxed">
                  {org.description}
                </p>
                <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-500 flex items-center justify-between">
                  <span>Coordinator: {org.coordinatorName}</span>
                  <span className="text-amber-900 font-medium">Learn More →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. GALLERY SPOTLIGHT */}
      <section className="py-20 bg-stone-50 border-b border-stone-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
                Parish Memories
              </span>
              <h2 className="font-serif text-3xl font-bold text-stone-900 mt-1">
                Photo Gallery
              </h2>
            </div>
            <button
              onClick={() => navigate('/gallery')}
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-xs font-semibold text-amber-900 hover:text-amber-700"
            >
              <span>Explore All Albums</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {albums.map((album) => (
              <div
                key={album.id}
                onClick={() => navigate('/gallery')}
                className="group relative rounded-xl overflow-hidden shadow-xs border border-stone-200 bg-stone-900 cursor-pointer aspect-4/3"
              >
                <img
                  src={album.coverImageUrl}
                  alt={album.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-6 flex flex-col justify-end">
                  <span className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold">
                    {album.category}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-white mb-1">
                    {album.title}
                  </h3>
                  <p className="text-xs text-stone-300 line-clamp-1 font-editorial">
                    {album.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. PARISH INFORMATION & MAP SECTION */}
      <section className="py-20 bg-stone-100/70 border-t border-stone-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-start">
            {/* Contact details */}
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
                  Visit Our Church
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                  Parish Information & Office Hours
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-2 font-editorial">
                  Our church and pastoral office welcome parishioners, visitors, and all seeking prayer and fellowship under the Diocese of Hosur.
                </p>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="p-4 bg-white rounded-xl border border-stone-200/80 flex items-start gap-3.5 shadow-xs">
                  <MapPin className="w-5 h-5 text-amber-900 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="block font-semibold text-stone-900">Church Address</span>
                    <span className="text-stone-700 leading-relaxed block mt-0.5 break-words">
                      {churchAddress}
                    </span>
                    <span className="text-[11px] text-amber-900/80 font-medium block mt-1">
                      {churchDiocese}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-stone-200/80 flex items-start gap-3.5 shadow-xs">
                  <Clock className="w-5 h-5 text-amber-900 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="block font-semibold text-stone-900">Office Working Hours</span>
                    <span className="text-stone-600 block mt-0.5">{settings?.officeHours}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 bg-white rounded-xl border border-stone-200/80 shadow-xs">
                    <span className="block font-semibold text-stone-900 mb-1">Telephone</span>
                    <a
                      href={`tel:${churchPhone.replace(/\s+/g, '')}`}
                      className="text-amber-900 hover:text-amber-950 font-semibold hover:underline flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                      <span className="break-all">{churchPhone}</span>
                    </a>
                    <span className="text-[10px] text-stone-500 block mt-1">Tap to call from mobile</span>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-stone-200/80 shadow-xs">
                    <span className="block font-semibold text-stone-900 mb-1">Parish Email</span>
                    <a
                      href={`mailto:${churchEmail}`}
                      className="text-stone-700 hover:text-amber-900 hover:underline break-all block"
                    >
                      {churchEmail}
                    </a>
                    <span className="text-[10px] text-stone-500 block mt-1">Pastoral inquiries</span>
                  </div>
                </div>
              </div>

              {/* Action buttons including clear Call Church and Send Message */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href={`tel:${churchPhone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-amber-900 hover:bg-amber-950 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Church</span>
                </a>

                <button
                  onClick={() => navigate('/contact')}
                  className="inline-flex items-center justify-center px-5 py-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Send Us a Message
                </button>
              </div>
            </div>

            {/* Interactive Church Map & Location Card */}
            <div className="bg-stone-900 text-stone-200 rounded-2xl p-6 sm:p-7 border border-stone-800 shadow-md flex flex-col justify-between overflow-hidden">
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                    <MapPin className="w-4 h-4" />
                    <span>Church Location</span>
                  </div>
                  <span className="text-[11px] text-stone-400 bg-stone-800 px-2 py-0.5 rounded-full border border-stone-700">
                    {churchDiocese}
                  </span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  St. Mariam Thresia Syro-Malabar Catholic Church
                </h3>
                <p className="text-xs text-stone-300 font-editorial leading-relaxed">
                  9, 1E, GST Road, J C K Nagar, Chengalpattu, Tamil Nadu 603002
                </p>
              </div>

              {/* Embedded Google Map */}
              <div className="w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-stone-700/80 bg-stone-800 relative my-2">
                <iframe
                  title="St. Mariam Thresia Syro-Malabar Catholic Church Location Map"
                  src="https://maps.google.com/maps?q=9,+1E,+GST+Road,+J+C+K+Nagar,+Chengalpattu,+Tamil+Nadu+603002&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Map Footer & Direct Navigation Trigger */}
              <div className="pt-4 mt-2 border-t border-stone-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="text-[11px] text-stone-400">
                  <span className="text-amber-400 font-medium block">GST Road Sanctuary Access</span>
                  <span>Ample parking & wheelchair accessible</span>
                </div>

                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=9%2C+1E%2C+GST+Road%2C+J+C+K+Nagar%2C+Chengalpattu%2C+Tamil+Nadu+603002"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  <Navigation className="w-4 h-4 text-stone-950" />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
