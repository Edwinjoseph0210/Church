import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { HolyQurbanaTiming } from '../../types';
import { Clock, Calendar, Info, HeartHandshake, ShieldCheck } from 'lucide-react';

interface HolyQurbanaPageProps {
  navigate: (path: string) => void;
}

export const HolyQurbanaPage: React.FC<HolyQurbanaPageProps> = ({ navigate }) => {
  const [timings, setTimings] = useState<HolyQurbanaTiming[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'SUNDAY' | 'WEEKDAY' | 'FEAST'>('ALL');

  useEffect(() => {
    async function loadTimings() {
      try {
        const data = await apiRequest<HolyQurbanaTiming[]>('/holy-qurbana');
        setTimings(data);
      } catch (err) {
        console.error('Failed to load timings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTimings();
  }, []);

  const filtered = activeTab === 'ALL'
    ? timings
    : timings.filter((t) => t.dayType === activeTab || (activeTab === 'FEAST' && t.dayType === 'SPECIAL'));

  const sundayTimings = timings.filter((t) => t.dayType === 'SUNDAY');
  const weekdayTimings = timings.filter((t) => t.dayType === 'WEEKDAY');
  const feastTimings = timings.filter((t) => t.dayType === 'FEAST' || t.dayType === 'SPECIAL');

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-12 text-center">
        <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
          Divine Liturgy Schedule
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 mt-2 mb-4">
          Holy Qurbana Timings
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto font-editorial">
          "For as often as you eat this bread and drink the cup, you proclaim the death of the Lord until he comes." (1 Cor 11:26). All timings are dynamically synced with parish records.
        </p>
        <div className="w-16 h-1 bg-amber-800 mx-auto mt-6 rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Interactive Segmented Filter Control */}
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1 bg-stone-200/80 rounded-xl">
            {(['ALL', 'SUNDAY', 'WEEKDAY', 'FEAST'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab === 'ALL' ? 'All Liturgies' : tab === 'SUNDAY' ? 'Sunday Celebrations' : tab === 'WEEKDAY' ? 'Weekday Schedule' : 'Feasts & Special'}
              </button>
            ))}
          </div>
        </div>

        {/* Liturgical Cards List */}
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500 bg-white rounded-xl border border-stone-200">
            Loading Holy Qurbana schedules...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500 bg-white rounded-xl border border-stone-200">
            No celebrations currently listed in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((timing) => (
              <div
                key={timing.id}
                className="bg-white rounded-xl p-6 border border-stone-200/90 shadow-xs hover:border-amber-800/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-400 mb-3">
                    <span className="font-semibold text-amber-900 uppercase tracking-wider">
                      {timing.dayType}
                    </span>
                    <Clock className="w-4 h-4 text-stone-400" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-stone-900 mb-1">
                    {timing.dayName}
                  </h3>
                  <div className="text-xl font-semibold text-amber-900 mb-2 font-mono">
                    {timing.time}
                  </div>
                  <p className="text-xs font-medium text-stone-700 mb-2">
                    Rite & Language: <span className="font-editorial text-stone-600">{timing.language}</span>
                  </p>
                  {timing.description && (
                    <p className="text-xs text-stone-600 leading-relaxed font-editorial mb-3">
                      {timing.description}
                    </p>
                  )}
                </div>

                {timing.notes && (
                  <div className="pt-3 border-t border-stone-100 flex items-start gap-2 text-xs text-stone-500 bg-amber-50/50 p-2.5 rounded-lg">
                    <Info className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5" />
                    <span className="font-editorial">{timing.notes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Liturgical Guidance & Sacraments Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          <div className="bg-white rounded-xl p-8 border border-stone-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center mb-2">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Sacrament of Reconciliation (Confession)
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-editorial">
              Confessions are heard thirty minutes prior to every Sunday Holy Qurbana, during the First Friday Eucharistic Adoration, or at any time upon personal request to the parish priest.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/login')}
                className="text-xs font-semibold text-amber-900 hover:text-amber-700"
              >
                Schedule Private Appointment with Father →
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 border border-stone-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Holy Communion & Liturgical Reverence
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-editorial">
              Practicing Catholics in state of grace who have observed the Eucharistic fast of at least one hour are invited to receive Holy Communion with reverence in the Syro-Malabar tradition.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/about')}
                className="text-xs font-semibold text-amber-900 hover:text-amber-700"
              >
                Learn About Syro-Malabar Liturgy →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
