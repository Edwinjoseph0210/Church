import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Church, Award, Heart, Compass, Calendar, MapPin, Phone, Navigation } from 'lucide-react';

interface AboutPageProps {
  navigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  const { settings } = useSettings();

  const churchName = settings?.churchName || 'St. Mariam Thresia Syro-Malabar Catholic Church';
  const tradition = settings?.tradition || 'Syro-Malabar Catholic Church';
  const diocese = settings?.diocese || 'Diocese of Hosur';
  const parishPriest = settings?.parishPriest && settings.parishPriest !== '[PARISH PRIEST NAME]' ? settings.parishPriest : 'Fr. Joshy N George';
  const assistantPriests = settings?.assistantPriests || '[ASSISTANT PRIEST NAME]';
  const address = settings?.address || '9, 1E, GST Road, J C K Nagar, Chengalpattu, Tamil Nadu 603002';
  const phone = settings?.phone || '+91 97421 62172';
  const historyText = settings?.aboutHistory || '[PARISH HISTORY TO BE ADDED]';

  const milestones = [
    {
      period: 'Foundation Era',
      title: 'Gathering of the Syro-Malabar Faithful',
      desc: 'Early families began gathering for communal rosary and Syro-Malabar liturgy, laying the spiritual foundation for a dedicated parish community.',
    },
    {
      period: 'Patronal Dedication',
      title: 'Consecration under Patronage of St. Mariam Thresia',
      desc: 'Formally dedicated to Saint Mariam Thresia, canonized apostle of families, with a divine call to bring peace and sanctity to every domestic church.',
    },
    {
      period: 'Parish Growth',
      title: 'Erection of Catechism & Youth Apostolates',
      desc: 'Establishment of Sunday catechism school, family units, and the St. Mariam Thresia Youth Movement (SMYM) to anchor youth in deep Catholic faith.',
    },
    {
      period: 'Present & Future',
      title: 'Modern Vibrant Liturgical & Charitable Community',
      desc: 'Expanding pastoral outreach, Eucharistic adoration, family apostolates, and digital parish connectivity to serve every generation.',
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      {/* Page Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-16 text-center">
        <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
          Ecclesiastical Heritage
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 mt-2 mb-4">
          About {churchName}
        </h1>
        <p className="text-sm uppercase tracking-wider text-stone-500 font-medium">
          {tradition} · {diocese}
        </p>
        <div className="w-16 h-1 bg-amber-800 mx-auto mt-6 rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Section 1: Parish Introduction */}
        <section className="bg-white rounded-2xl p-8 sm:p-12 border border-stone-200/90 shadow-xs">
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-4">
            Introduction to Our Parish Community
          </h2>
          <p className="font-editorial text-stone-700 text-base sm:text-lg leading-relaxed mb-6">
            {churchName} is a flourishing parish of the Syro-Malabar Catholic Church—an Eastern Catholic Major Archiepiscopal Church in full communion with the Apostolic See of Rome. Rooted in the rich apostolic tradition founded by Saint Thomas the Apostle in AD 52, our liturgical life is centered upon the holy mysteries of the Qurbana celebrated in the East Syriac rite.
          </p>
          <p className="font-editorial text-stone-700 text-base sm:text-lg leading-relaxed">
            Our parish draws deep inspiration from Saint Mariam Thresia Chiramel Mankidiyan (1876–1926), foundress of the Congregation of the Holy Family, who dedicated her life to intense prayer, mystical union with the Crucified Lord, and tireless visitation of families in difficulty.
          </p>
        </section>

        {/* Section 2: Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-stone-200/90 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-3">
              Our Parish Mission
            </h3>
            <p className="font-editorial text-stone-600 text-sm leading-relaxed">
              {settings?.missionStatement}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-stone-200/90 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center mb-4">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-3">
              Our Parish Vision
            </h3>
            <p className="font-editorial text-stone-600 text-sm leading-relaxed">
              {settings?.visionStatement}
            </p>
          </div>
        </div>

        {/* Section 3: Parish History with Visual Timeline */}
        <section className="bg-white rounded-2xl p-8 sm:p-12 border border-stone-200/90 shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-amber-900" />
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Parish History & Milestones
            </h2>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl mb-8">
            <p className="text-xs text-amber-950 font-editorial">
              <strong>Official Chronicle:</strong> {historyText}
            </p>
          </div>

          <div className="relative border-l-2 border-stone-200 ml-4 sm:ml-6 space-y-10 pl-6 sm:pl-8 py-2">
            {milestones.map((m, idx) => (
              <div key={idx} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-4 h-4 rounded-full bg-amber-800 border-4 border-white shadow-xs" />
                <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-800">
                  {m.period}
                </span>
                <h3 className="font-serif text-lg font-bold text-stone-900 mt-0.5 mb-1">
                  {m.title}
                </h3>
                <p className="text-xs text-stone-600 font-editorial leading-relaxed">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Parish Clergy & Pastoral Leadership */}
        <section className="bg-white rounded-2xl p-8 sm:p-12 border border-stone-200/90 shadow-xs">
          <div className="flex items-center gap-3 mb-8">
            <Award className="w-6 h-6 text-amber-900" />
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Pastoral Leadership & Clergy
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-amber-900 text-amber-100 flex items-center justify-center shrink-0">
                <Church className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                  Parish Vicar
                </span>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {parishPriest}
                </h3>
                <p className="text-xs text-stone-500 font-editorial mt-1">
                  Leading our parish in liturgical worship, spiritual direction, and pastoral administration.
                </p>
                <div className="mt-2 text-xs">
                  <span className="text-stone-500">Contact: </span>
                  <a href="tel:+919742162172" className="font-semibold text-amber-900 hover:underline">
                    +91 97421 62172
                  </a>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-stone-800 text-stone-200 flex items-center justify-center shrink-0">
                <Church className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-600 tracking-wider">
                  Assistant Clergy
                </span>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {assistantPriests}
                </h3>
                <p className="text-xs text-stone-500 font-editorial mt-1">
                  Assisting in sacramental celebrations, youth ministry, and home visits to our parish families.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Saint Mariam Thresia Devotion */}
        <section className="bg-stone-900 text-white rounded-2xl p-8 sm:p-12 shadow-md relative overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
              Our Patroness
            </span>
            <h2 className="font-serif text-3xl font-bold">
              Saint Mariam Thresia (1876–1926)
            </h2>
            <p className="font-editorial text-stone-300 text-sm sm:text-base leading-relaxed">
              Canonized by Pope Francis in Rome on October 13, 2019, Saint Mariam Thresia dedicated her entire earthly journey to prayer, mortification, and visiting needy and broken families. She sought out lonely homes, brought spouses to reconciliation, cared for sick and dying destitute, and established educational centers for girls.
            </p>
            <p className="font-editorial text-amber-200/90 text-sm italic pt-2">
              "Love Jesus, and you will find peace. Bear every hardship with joy for Christ."
            </p>
            <div className="pt-4">
              <button
                onClick={() => navigate('/contact')}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Inquire About Patronal Feasts
              </button>
            </div>
          </div>
        </section>

        {/* Section 6: Parish Location & Visiting Information */}
        <section className="bg-white rounded-2xl p-8 sm:p-10 border border-stone-200/90 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
                Visit St. Mariam Thresia Parish
              </span>
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                Parish Location & Pastoral Office
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-editorial max-w-xl">
                Located conveniently on GST Road in Chengalpattu under the pastoral care of the Diocese of Hosur.
              </p>
              <div className="pt-2 space-y-1.5 text-xs text-stone-700">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-900 shrink-0 mt-0.5" />
                  <span className="font-medium break-words">{address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-900 shrink-0" />
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="font-medium text-amber-900 hover:underline"
                  >
                    {phone}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Call Church</span>
              </a>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=9%2C+1E%2C+GST+Road%2C+J+C+K+Nagar%2C+Chengalpattu%2C+Tamil+Nadu+603002"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                <Navigation className="w-4 h-4 text-stone-950" />
                <span>Get Directions</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
