import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Organization } from '../../types';
import { Users, Phone, Mail, Clock, ShieldCheck, ChevronRight } from 'lucide-react';

interface OrganizationsPageProps {
  navigate: (path: string) => void;
  selectedId?: string;
}

export const OrganizationsPage: React.FC<OrganizationsPageProps> = ({ navigate, selectedId }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  useEffect(() => {
    async function loadOrgs() {
      try {
        const data = await apiRequest<Organization[]>('/organizations');
        setOrganizations(data);
        if (selectedId) {
          const match = data.find((o) => o.id === selectedId || o.slug === selectedId);
          if (match) setSelectedOrg(match);
        }
      } catch (err) {
        console.error('Failed to load organizations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrgs();
  }, [selectedId]);

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-12 text-center">
        <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
          Ministries & Apostolates
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 mt-2 mb-4">
          Parish Organizations
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto font-editorial">
          Empowering every parishioner to participate actively in liturgy, faith formation, fraternal charity, and domestic church renewal.
        </p>
        <div className="w-16 h-1 bg-amber-800 mx-auto mt-6 rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500 bg-white rounded-xl border border-stone-200">
            Loading parish organizations...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-serif text-xl font-bold text-stone-900">
                        {org.name}
                      </h2>
                      <span className="text-[11px] text-amber-800 font-medium">
                        Active Parish Ministry
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 font-editorial leading-relaxed mb-6">
                    {org.description}
                  </p>

                  <div className="space-y-2 p-4 rounded-xl bg-stone-50 border border-stone-200/80 text-xs text-stone-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-900 shrink-0" />
                      <span><strong>Gathering:</strong> {org.meetingSchedule}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-900 shrink-0" />
                      <span><strong>Coordinator:</strong> {org.coordinatorName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-amber-900 shrink-0" />
                      <span>{org.coordinatorPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-amber-900 shrink-0" />
                      <span>{org.coordinatorEmail}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-400">Parish Membership Required</span>
                  <button
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center gap-1 font-semibold text-amber-900 hover:text-amber-700 cursor-pointer"
                  >
                    <span>Member Inquiries</span>
                    <ChevronRight className="w-3.5 h-3.5" />
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
