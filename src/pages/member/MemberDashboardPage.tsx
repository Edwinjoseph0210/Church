import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { Member, Family, Announcement, ParishEvent } from '../../types';
import {
  User,
  Users,
  FileText,
  Megaphone,
  Calendar,
  Settings,
  ArrowRight,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

interface MemberDashboardPageProps {
  navigate: (path: string) => void;
}

export const MemberDashboardPage: React.FC<MemberDashboardPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<ParishEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        if (user?.memberId) {
          const mData = await apiRequest<Member & { family?: Family }>(`/members/${user.memberId}`);
          setMember(mData);
          if (mData.family) {
            setFamily(mData.family);
          }
        }
        const [annRes, evtRes] = await Promise.all([
          apiRequest<Announcement[]>('/announcements'),
          apiRequest<ParishEvent[]>('/events'),
        ]);
        setAnnouncements(annRes.slice(0, 3));
        setEvents(evtRes.slice(0, 2));
      } catch (err) {
        console.error('Error loading member dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-amber-950 text-white rounded-2xl p-6 sm:p-8 shadow-xs border border-stone-800">
        <span className="text-[11px] uppercase tracking-wider text-amber-300 font-semibold">
          Parish Member Portal
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold mt-1">
          Welcome, {user?.name}
        </h1>
        <p className="text-xs sm:text-sm text-stone-300 font-editorial mt-2 max-w-2xl">
          Welcome to your digital parish center. Access your official Parish Membership Register, view and update family census records, review parish bulletins and upcoming liturgical events, and download parish documents.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-white/10 text-stone-200 border border-white/10 font-mono">
            Member ID: {user?.memberId || 'N/A'}
          </span>
          {family && (
            <span className="px-2.5 py-1 rounded-md bg-white/10 text-stone-200 border border-white/10">
              Family: {family.familyName} ({family.houseName})
            </span>
          )}
          <span className="px-2.5 py-1 rounded-md bg-emerald-900/60 text-emerald-200 border border-emerald-700/40">
            Parish Status: Active
          </span>
          {family?.verificationStatus && (
            <span className={`px-2.5 py-1 rounded-md border text-[11px] font-medium ${
              family.verificationStatus === 'VERIFIED'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
            }`}>
              Register Status: {family.verificationStatus.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'My Family', desc: 'Parish register', path: '/member/family', icon: Users },
          { label: 'My Profile', desc: 'Personal record', path: '/member/profile', icon: User },
          { label: 'Announcements', desc: 'Parish circulars', path: '/member/announcements', icon: Megaphone },
          { label: 'Events', desc: 'Feasts & calendar', path: '/member/events', icon: Calendar },
          { label: 'Documents', desc: 'Official forms', path: '/member/documents', icon: FileText },
          { label: 'Settings', desc: 'Security & login', path: '/member/settings', icon: Settings },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs hover:border-amber-800/50 hover:shadow-xs transition-all text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-900 group-hover:bg-amber-900 group-hover:text-white transition-colors flex items-center justify-center mb-3">
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs text-stone-900 group-hover:text-amber-900">
                {item.label}
              </h3>
              <p className="text-[10px] text-stone-400 mt-0.5 truncate">
                {item.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Two Column Grid: Latest Announcements & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Announcements */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Parish Notices & Bulletins
            </h2>
            <button
              onClick={() => navigate('/announcements')}
              className="text-xs text-amber-900 font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>See All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((a) => (
              <div
                key={a.id}
                onClick={() => navigate(`/announcements`)}
                className="p-3.5 rounded-xl bg-stone-50 hover:bg-stone-100/70 border border-stone-200/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-1">
                  <span className="font-semibold text-amber-900">{a.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{a.publishDate}</span>
                  {a.isImportant && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-red-700 font-semibold flex items-center gap-0.5">
                        <AlertCircle className="w-3 h-3" />
                        Important
                      </span>
                    </>
                  )}
                </div>
                <h3 className="font-serif text-sm font-bold text-stone-900">
                  {a.title}
                </h3>
                <p className="text-xs text-stone-600 line-clamp-2 mt-1 font-editorial">
                  {a.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Parish Events */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Upcoming Parish Events
            </h2>
            <button
              onClick={() => navigate('/events')}
              className="text-xs text-amber-900 font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>See All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {events.map((e) => (
              <div
                key={e.id}
                onClick={() => navigate(`/events`)}
                className="p-3.5 rounded-xl bg-stone-50 hover:bg-stone-100/70 border border-stone-200/70 transition-colors cursor-pointer flex items-start gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex flex-col items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px] font-mono font-bold leading-none">
                    {e.date.split('-')[2]}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-0.5">
                    <span>{e.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>{e.startTime}</span>
                  </div>
                  <h3 className="font-serif text-sm font-bold text-stone-900 truncate">
                    {e.title}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-1 mt-0.5 font-editorial">
                    {e.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
