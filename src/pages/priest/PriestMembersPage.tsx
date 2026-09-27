import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import {
  Users,
  Search,
  BookOpen,
  ArrowRight,
  Phone,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
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
      console.error('Failed to load parish members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [search]);

  const filteredMembers = members.filter((m) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'VERIFIED') return m.verificationStatus === 'Approved' || m.verificationStatus === 'VERIFIED';
    if (statusFilter === 'REVIEW') return m.verificationStatus === 'Under Priest Review' || m.verificationStatus === 'Submitted';
    if (statusFilter === 'DRAFT') return m.verificationStatus === 'Draft' || m.verificationStatus === 'Changes Requested';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-amber-900 font-bold block">
            Parish Register · Directory
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-0.5">
            Parish Members
          </h1>
          <p className="text-xs text-stone-600 font-editorial mt-1">
            Complete census list of approved parish members and their corresponding family register records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-stone-100 rounded-xl text-xs font-semibold text-stone-700">
            Total Members: {members.length}
          </span>
        </div>
      </div>

      {/* Search and Filters (Requirement 14: Search by Member name, Family name, Family number, Member ID, Mobile number) */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Member Name, Family Name, Family No, Member ID, or Mobile..."
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
            <option value="ALL">All Registers</option>
            <option value="VERIFIED">Approved / Verified</option>
            <option value="REVIEW">Under Priest Review</option>
            <option value="DRAFT">Draft / Incomplete</option>
          </select>
        </div>
      </div>

      {/* Members Register Table (Requirement 14) */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500">
            Loading parishioner directory...
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-[11px] font-bold text-stone-600 uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Family Name</th>
                  <th className="py-3 px-4">Family Number</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Date Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredMembers.map((m) => (
                  <tr key={m.memberId} className="hover:bg-amber-50/40 transition-colors">
                    {/* Member Name & ID */}
                    <td className="py-3.5 px-4">
                      <div className="font-serif font-bold text-stone-900 text-sm">
                        {m.memberName}
                      </div>
                      <div className="text-[11px] text-stone-500 font-editorial">
                        ID: {m.memberId} · {m.relationshipWithHead}
                      </div>
                    </td>

                    {/* Family Name */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-stone-900">{m.familyName}</span>
                    </td>

                    {/* Family Number */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-stone-700">
                      {m.familyNumber}
                    </td>

                    {/* Mobile */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        <span>{m.mobile}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{m.status}</span>
                      </span>
                    </td>

                    {/* Date Registered */}
                    <td className="py-3.5 px-4 text-stone-500 font-editorial">
                      {m.dateRegistered !== '—'
                        ? new Date(m.dateRegistered).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>

                    {/* Action: Open Complete Family Register */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/priest/members/${m.memberId}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        title="Open Complete Family Register"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Open Register</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-2">
            <Users className="w-8 h-8 text-stone-400 mx-auto" />
            <h3 className="font-serif text-base font-bold text-stone-900">
              No Members Found
            </h3>
            <p className="text-xs text-stone-500 font-editorial">
              {search
                ? `No parish records match "${search}". Try searching by another keyword.`
                : 'No approved parish members in the database yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
