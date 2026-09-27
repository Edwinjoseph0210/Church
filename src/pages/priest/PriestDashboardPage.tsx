import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Calendar,
  Phone,
  Mail,
  ArrowRight,
  Shield,
  Search,
  BookOpen,
} from 'lucide-react';

interface PriestDashboardPageProps {
  navigate: (path: string) => void;
}

interface PendingApplicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  status: string;
}

interface PendingFamily {
  id: string;
  familyName: string;
  familyNumber?: string;
  headOfFamilyName?: string;
  unitName?: string;
  contactPhone?: string;
  membersCount: number;
  status: string;
  updatedAt: string;
}

interface SummaryData {
  pendingRegistrationsCount: number;
  approvedMembersCount: number;
  totalFamiliesCount: number;
  totalApprovedFamiliesCount: number;
  pendingFamilyReviewsCount: number;
  pendingRegistrations: PendingApplicant[];
  pendingFamilies: PendingFamily[];
}

export const PriestDashboardPage: React.FC<PriestDashboardPageProps> = ({ navigate }) => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected applicant for detailed modal view before approval
  const [selectedApplicant, setSelectedApplicant] = useState<PendingApplicant | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchSummary = async () => {
    try {
      const data = await apiRequest<SummaryData>('/priest/dashboard-summary');
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load Priest Dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleApprove = async (applicantId: string) => {
    setActionLoading(applicantId);
    setFeedback(null);
    try {
      const res = await apiRequest<{ message: string }>(`/priest/registrations/${applicantId}/approve`, {
        method: 'POST',
      });
      setFeedback({ message: res.message, type: 'success' });
      setSelectedApplicant(null);
      await fetchSummary();
    } catch (err: any) {
      setFeedback({ message: err.message || 'Failed to approve registration.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (applicantId: string, reason?: string) => {
    setActionLoading(applicantId);
    setFeedback(null);
    try {
      const res = await apiRequest<{ message: string }>(`/priest/registrations/${applicantId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason: reason || 'Declined by Parish Priest.' }),
      });
      setFeedback({ message: res.message, type: 'success' });
      setSelectedApplicant(null);
      await fetchSummary();
    } catch (err: any) {
      setFeedback({ message: err.message || 'Failed to reject registration.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 shadow-xs">
        <div className="w-8 h-8 border-3 border-amber-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-stone-500 font-editorial">Loading Priest administrative console...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[11px] uppercase tracking-wider text-amber-900 font-bold">
              Diocese of Hosur · Parish Administration
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full border border-amber-300">
              Vicar: Fr. Joshy N George (+91 97421 62172)
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-0.5">
            Priest Portal & Approvals
          </h1>
          <p className="text-xs text-stone-600 font-editorial mt-1">
            Review new parishioner access requests, verify digital Parish Membership Registers, and oversee parish family records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/priest/members')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>View Parish Members</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-red-50 border border-red-200 text-red-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between text-amber-900 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Pending Registrations
            </span>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
              <Clock className="w-4 h-4 text-amber-800" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900">
            {summary?.pendingRegistrationsCount || 0}
          </div>
          <p className="text-[10px] text-stone-500 mt-1">Awaiting priest verification</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Approved Members
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <UserCheck className="w-4 h-4 text-emerald-700" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900">
            {summary?.approvedMembersCount || 0}
          </div>
          <p className="text-[10px] text-stone-500 mt-1">Active parish members</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between text-blue-800 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Parish Families
            </span>
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200">
              <FileSpreadsheet className="w-4 h-4 text-blue-700" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900">
            {summary?.totalFamiliesCount || 0}
          </div>
          <p className="text-[10px] text-stone-500 mt-1">
            {summary?.totalApprovedFamiliesCount || 0} verified registers
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between text-purple-800 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Pending Register Reviews
            </span>
            <div className="p-2 rounded-xl bg-purple-50 border border-purple-200">
              <BookOpen className="w-4 h-4 text-purple-700" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900">
            {summary?.pendingFamilyReviewsCount || 0}
          </div>
          <p className="text-[10px] text-stone-500 mt-1">Family censuses submitted</p>
        </div>
      </div>

      {/* SECTION 1: PENDING MEMBER REQUESTS (Requirement 3 & 13) */}
      <section className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Pending Member Registration Requests
              </h2>
            </div>
            <p className="text-xs text-stone-500 font-editorial mt-0.5">
              Review and authorize newly registered parish members before granting portal access.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 w-fit">
            {summary?.pendingRegistrations.length || 0} Pending
          </span>
        </div>

        {summary?.pendingRegistrations && summary.pendingRegistrations.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {summary.pendingRegistrations.map((applicant) => (
              <div
                key={applicant.id}
                className="p-5 sm:p-6 hover:bg-stone-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-serif text-base font-bold text-stone-900">
                      {applicant.name}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      PENDING
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-stone-600 font-editorial">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{applicant.phone || 'No phone provided'}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-stone-400" />
                      <span>{applicant.email}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-stone-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Applied: {new Date(applicant.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </span>
                  </div>
                </div>

                {/* Actions: View, Approve, Reject (Requirement 3 & 13) */}
                <div className="flex items-center gap-2 pt-2 md:pt-0 shrink-0">
                  <button
                    onClick={() => setSelectedApplicant(applicant)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <button
                    disabled={actionLoading === applicant.id}
                    onClick={() => handleApprove(applicant.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>

                  <button
                    disabled={actionLoading === applicant.id}
                    onClick={() => handleReject(applicant.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-serif text-base font-bold text-stone-900">
              No Pending Registration Requests
            </h3>
            <p className="text-xs text-stone-500 font-editorial max-w-sm mx-auto">
              All member account applications have been processed. New requests will appear here immediately upon submission.
            </p>
          </div>
        )}
      </section>

      {/* SECTION 2: PENDING FAMILY REGISTERS TO REVIEW (Requirement 12 & 17) */}
      <section className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Family Registers Awaiting Priest Review
            </h2>
            <p className="text-xs text-stone-500 font-editorial mt-0.5">
              Head of Family records submitted in the physical Diocese of Hosur Parish Membership Register format.
            </p>
          </div>
          <button
            onClick={() => navigate('/priest/members')}
            className="text-xs font-semibold text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>All Parish Families</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {summary?.pendingFamilies && summary.pendingFamilies.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {summary.pendingFamilies.map((fam) => (
              <div
                key={fam.id}
                className="p-5 sm:p-6 hover:bg-stone-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-serif text-base font-bold text-stone-900">
                      {fam.familyName}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                      {fam.status}
                    </span>
                  </div>
                  <div className="text-xs text-stone-600 font-editorial flex flex-wrap gap-x-4 gap-y-1">
                    <span>Head: <strong>{fam.headOfFamilyName || '—'}</strong></span>
                    <span>Family No: <strong>{fam.familyNumber || '—'}</strong></span>
                    <span>Unit: <strong>{fam.unitName || '—'}</strong></span>
                    <span>Members: <strong>{fam.membersCount}</strong></span>
                    <span>Phone: {fam.contactPhone || '—'}</span>
                  </div>
                </div>

                <div className="shrink-0 pt-2 md:pt-0">
                  <button
                    onClick={() => navigate(`/priest/members/${fam.id}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    <span>Open Complete Family Register</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-stone-500 font-editorial">
            No family registers currently pending verification.
          </div>
        )}
      </section>

      {/* APPLICANT DETAILS MODAL (Requirement 3: Priest can open applicant's registration details before approving) */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800">
                  Applicant Review
                </span>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {selectedApplicant.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="text-stone-400 hover:text-stone-700 text-sm p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-200/60">
                <span className="text-stone-500">Applicant Full Name:</span>
                <strong className="text-stone-900">{selectedApplicant.name}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200/60">
                <span className="text-stone-500">Mobile Number:</span>
                <strong className="text-stone-900">{selectedApplicant.phone || '—'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200/60">
                <span className="text-stone-500">Email Address:</span>
                <strong className="text-stone-900">{selectedApplicant.email}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200/60">
                <span className="text-stone-500">Registration Date:</span>
                <strong className="text-stone-900">
                  {new Date(selectedApplicant.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-500">Current Status:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  PENDING VERIFICATION
                </span>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 font-editorial leading-relaxed">
              Upon approval, the member's account status becomes <strong>ACTIVE / APPROVED</strong>, enabling them to log in to the portal and enter their family details in the Diocese of Hosur Parish Membership Register.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                disabled={actionLoading === selectedApplicant.id}
                onClick={() => handleReject(selectedApplicant.id)}
                className="px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 cursor-pointer disabled:opacity-50"
              >
                Reject Request
              </button>

              <button
                type="button"
                disabled={actionLoading === selectedApplicant.id}
                onClick={() => handleApprove(selectedApplicant.id)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
              >
                Approve & Activate Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
