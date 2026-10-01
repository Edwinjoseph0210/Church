import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import {
  Users,
  Search,
  BookOpen,
  ArrowRight,
  Phone,
  CheckCircle2,
  Clock,
  Filter,
  Home,
  ChevronRight,
} from 'lucide-react';

interface PriestMembersPageProps {
  navigate: (path: string) => void;
}

interface MemberListItem {
  memberId: string;
  memberName: string;
  firstName: string;
  lastName: string;
  familyId: string;
  familyName: string;
  familyNumber: string;
  headOfFamilyName: string;
  mobile: string;
  email: string;
  status: string;
  userStatus: string;
  relationshipWithHead: string;
  dateRegistered: string;
  verificationStatus: string;
}

export const PriestMembersPage: React.FC<PriestMembersPageProps> = ({ navigate }) => {
  const [members, setMembers] = useState<MemberListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'REVIEW' | 'DRAFT'>('ALL');

  const fetchMembers = async () => {
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      const data = await apiRequest<MemberListItem[]>(`/priest/members${q}`);
      setMembers(data);
    } catch (err) {
      console.error('Failed to load parish families:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [search]);

  // Group by family ID or show family heads
  const filteredMembers = members.filter((m) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'VERIFIED') return m.verificationStatus === 'Approved' || m.verificationStatus === 'VERIFIED';
    if (statusFilter === 'REVIEW') return m.verificationStatus === 'Under Priest Review' || m.verificationStatus === 'Submitted';
    if (statusFilter === 'DRAFT') return m.verificationStatus === 'Draft' || m.verificationStatus === 'Changes Requested';
    return true;
  });

  // Filter to show primarily family heads or unique families, with fallback to members if head not explicit
  const familyUnits = filteredMembers.reduce((acc: MemberListItem[], m) => {
    const isHead = m.relationshipWithHead?.toLowerCase().includes('head') || !acc.some((item) => item.familyId === m.familyId);
    if (isHead) {
      const existingIdx = acc.findIndex((item) => item.familyId === m.familyId);
      if (existingIdx >= 0) {
        if (m.relationshipWithHead?.toLowerCase().includes('head')) {
          acc[existingIdx] = m;
        }
      } else {
        acc.push(m);
      }
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-amber-900 font-bold block">
            Parish Register · Family Directory
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-0.5">
            Parish Families & Heads
          </h1>
          <p className="text-xs text-stone-600 font-editorial mt-1">
            Click on any Family Head to inspect complete family census details, sacramental ledgers, and verification status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-stone-100 rounded-xl text-xs font-semibold text-stone-700">
            Total Families: {familyUnits.length}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Family Head Name, Family Name, or Family No..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="text-xs text-stone-500 font-medium shrink-0">Register Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="py-1.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Family Registers</option>
            <option value="VERIFIED">Approved / Verified</option>
            <option value="REVIEW">Under Priest Review</option>
            <option value="DRAFT">Draft / Incomplete</option>
          </select>
        </div>
      </div>

      {/* Family Units Table (Click Family Head to view details) */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500">
            Loading parish family registers...
          </div>
        ) : familyUnits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-[11px] font-bold text-stone-600 uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Family Head Name</th>
                  <th className="py-3 px-4">Family Name</th>
                  <th className="py-3 px-4">Family Number</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Register Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-editorial">
                {familyUnits.map((fam) => {
                  const headName = fam.headOfFamilyName || fam.memberName;
                  return (
                    <tr
                      key={fam.memberId || fam.familyId}
                      onClick={() => navigate(`/priest/members/${fam.memberId}`)}
                      className="hover:bg-amber-50/60 transition-colors cursor-pointer group"
                    >
                      {/* Family Head Name */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0">
                            <Home className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-serif font-bold text-stone-900 text-sm group-hover:text-amber-900 transition-colors block">
                              {headName}
                            </span>
                            <span className="text-[10px] text-stone-500 block">
                              Family Head · Click to inspect family details
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Family Name */}
                      <td className="py-4 px-4 font-sans font-semibold text-stone-900">
                        {fam.familyName || '—'}
                      </td>

                      {/* Family Number */}
                      <td className="py-4 px-4 font-mono font-bold text-stone-800">
                        {fam.familyNumber || 'REG-HSR-2024'}
                      </td>

                      {/* Contact Phone */}
                      <td className="py-4 px-4 font-mono text-stone-700">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-stone-400" />
                          <span>{fam.mobile || '+91 97421 62172'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          fam.verificationStatus === 'Approved' || fam.verificationStatus === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{fam.verificationStatus || 'Verified'}</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/priest/members/${fam.memberId}`);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          <span>View Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-stone-500">
            No family register records found.
          </div>
        )}
      </div>
    </div>
  );
};
