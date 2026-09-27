import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { Member, Family, FamilyRegisterStatus } from '../../types';
import churchLogo from '../../assets/church_logo.svg';
import {
  Users,
  Home,
  Phone,
  Mail,
  MapPin,
  User,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Edit3,
  Save,
  Plus,
  Send,
  Printer,
  ChevronDown,
  ChevronUp,
  X,
  BookOpen,
  Calendar,
  Briefcase,
  Church,
  Trash2,
} from 'lucide-react';

interface ParishMembershipRegisterProps {
  memberIdOverride?: string;
  isPriestView?: boolean;
}

export const ParishMembershipRegister: React.FC<ParishMembershipRegisterProps> = ({
  memberIdOverride,
  isPriestView = false,
}) => {
  const { user } = useAuth();
  const effectiveMemberId = memberIdOverride || user?.memberId;

  const [family, setFamily] = useState<Family | null>(null);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Expanded mobile member cards
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  // Edit Family Info Mode
  const [isEditingFamily, setIsEditingFamily] = useState(false);
  const [familyForm, setFamilyForm] = useState({
    familyNumber: '',
    headOfFamilyName: '',
    familyName: '',
    familyUnitName: '',
    mobileNumber: '',
    landline: '',
    doorNumber: '',
    street: '',
    area: '',
    city: '',
    district: '',
    state: '',
    pinCode: '',
    wardNumber: '',
    transferredParish: '',
    transferDate: '',
    parishTransferRegisterNumber: '',
    dioceseInKerala: '',
    monthlySubscription: '',
    churchTradition: 'Syro Malabar',
  });

  // Modal: Add Family Member
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({
    fullName: '',
    relationshipWithHead: 'Son',
    dateOfBirth: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    baptismDate: '',
    baptismParish: '',
    firstHolyCommunionDate: '',
    confirmationDate: '',
    marriageOrdinationDate: '',
    marriageOrdinationDetails: '',
    profession: '',
    deathInfo: '',
  });

  // Modal: Edit Individual Family Member
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Modal: Request Changes to Verified Data
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
  const [changeReason, setChangeReason] = useState('');

  const loadRegister = async () => {
    if (!effectiveMemberId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const memberData = await apiRequest<Member & { family?: Family }>(`/members/${effectiveMemberId}`);
      setCurrentMember(memberData);

      let targetFamilyId = memberData.familyId;
      if (!targetFamilyId && memberData.family?.id) {
        targetFamilyId = memberData.family.id;
      }

      if (targetFamilyId) {
        const famData = await apiRequest<Family>(`/families/${targetFamilyId}`);
        setFamily(famData);
        populateFamilyForm(famData, memberData);
      } else {
        setFamily(null);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load Parish Register.' });
    } finally {
      setLoading(false);
    }
  };

  const populateFamilyForm = (fam: Family, headMem?: Member) => {
    setFamilyForm({
      familyNumber: fam.familyNumber || fam.registerFolioNumber || '',
      headOfFamilyName: fam.headOfFamilyName || headMem?.fullName || (headMem ? `${headMem.firstName} ${headMem.lastName}` : ''),
      familyName: fam.familyName || '',
      familyUnitName: fam.familyUnitName || fam.wardOrUnit || 'St. Thomas Unit 1',
      mobileNumber: fam.mobileNumber || fam.contactPhone || '',
      landline: fam.landline || '',
      doorNumber: fam.doorNumber || '',
      street: fam.street || '',
      area: fam.area || '',
      city: fam.city || '',
      district: fam.district || '',
      state: fam.state || '',
      pinCode: fam.pinCode || '',
      wardNumber: fam.wardNumber || '',
      transferredParish: fam.transferredParish || fam.nativeParish || '',
      transferDate: fam.transferDate || '',
      parishTransferRegisterNumber: fam.parishTransferRegisterNumber || '',
      dioceseInKerala: fam.dioceseInKerala || fam.nativeDiocese || '',
      monthlySubscription: fam.monthlySubscription ? String(fam.monthlySubscription) : '',
      churchTradition: fam.churchTradition || 'Syro Malabar',
    });
  };

  useEffect(() => {
    loadRegister();
  }, [effectiveMemberId]);

  // Save Draft (Requirement 12)
  const handleSaveDraft = async () => {
    if (!family) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await apiRequest<Family>(`/family-register/${family.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...familyForm,
          statusAction: 'SAVE_DRAFT',
        }),
      });
      setFamily(res);
      setIsEditingFamily(false);
      setFeedback({ type: 'success', message: 'Family Register draft saved successfully.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save register draft.' });
    } finally {
      setSaving(false);
    }
  };

  // Submit Family Information for Verification (Requirement 12)
  const handleSubmitInformation = async () => {
    if (!family) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await apiRequest<Family>(`/family-register/${family.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...familyForm,
          statusAction: 'SUBMIT_INFORMATION',
        }),
      });
      setFamily(res);
      setIsEditingFamily(false);
      setFeedback({
        type: 'success',
        message: 'Family information submitted to the Parish Priest for verification.',
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to submit family information.' });
    } finally {
      setSaving(false);
    }
  };

  // Add Family Member One by One (Requirement 8 & 9)
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!family) return;
    setSaving(true);
    setFeedback(null);

    try {
      const res = await apiRequest<{ members: Member[]; newMember: Member }>(
        `/family-register/${family.id}/members`,
        {
          method: 'POST',
          body: JSON.stringify(newMemberForm),
        }
      );
      setFamily((prev) => (prev ? { ...prev, members: res.members } : null));
      setShowAddMemberModal(false);
      setNewMemberForm({
        fullName: '',
        relationshipWithHead: 'Son',
        dateOfBirth: '',
        gender: 'MALE',
        baptismDate: '',
        baptismParish: '',
        firstHolyCommunionDate: '',
        confirmationDate: '',
        marriageOrdinationDate: '',
        marriageOrdinationDetails: '',
        profession: '',
        deathInfo: '',
      });
      setFeedback({
        type: 'success',
        message: `${newMemberForm.fullName || 'Member'} has been added to your Parish Register.`,
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to add family member.' });
    } finally {
      setSaving(false);
    }
  };

  // Update Individual Member
  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!family || !editingMember) return;
    setSaving(true);
    setFeedback(null);

    try {
      const res = await apiRequest<{ member: Member; members: Member[] }>(
        `/family-register/${family.id}/members/${editingMember.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(editingMember),
        }
      );
      setFamily((prev) => (prev ? { ...prev, members: res.members } : null));
      setEditingMember(null);
      setFeedback({ type: 'success', message: 'Family member record updated.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update member.' });
    } finally {
      setSaving(false);
    }
  };

  // Remove Member
  const handleDeleteMember = async (mId: string, name: string) => {
    if (!family) return;
    if (!confirm(`Are you sure you want to remove ${name} from this family register?`)) return;
    setSaving(true);
    try {
      const res = await apiRequest<{ members: Member[] }>(
        `/family-register/${family.id}/members/${mId}`,
        {
          method: 'DELETE',
        }
      );
      setFamily((prev) => (prev ? { ...prev, members: res.members } : null));
      setFeedback({ type: 'success', message: `${name} was removed from the register.` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to remove member.' });
    } finally {
      setSaving(false);
    }
  };

  // Request Changes to Verified Information
  const handleRequestChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!family) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await apiRequest<Family>(`/family-register/${family.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          statusAction: 'REQUEST_CHANGE',
          changeRequestReason: changeReason,
        }),
      });
      setFamily(res);
      setShowChangeRequestModal(false);
      setChangeReason('');
      setFeedback({
        type: 'success',
        message: 'Your correction request has been sent to the Parish Priest.',
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to request changes.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center shadow-xs">
        <div className="w-8 h-8 border-3 border-amber-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-stone-500 font-editorial">Loading Parish Membership Register...</p>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center space-y-4 shadow-xs">
        <BookOpen className="w-10 h-10 text-amber-900/60 mx-auto" />
        <h3 className="font-serif text-lg font-bold text-stone-900">
          Parish Register Not Yet Initialized
        </h3>
        <p className="text-xs text-stone-500 font-editorial max-w-md mx-auto">
          Your parishioner profile has been verified. Click below to begin entering your family details according to the Diocese of Hosur physical register format.
        </p>
        <button
          onClick={loadRegister}
          className="px-4 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
        >
          Initialize Family Register
        </button>
      </div>
    );
  }

  const rawStatus = (family.verificationStatus || family.registerStatus || 'Draft') as FamilyRegisterStatus;
  const isApproved = rawStatus === 'Approved' || rawStatus === 'VERIFIED';
  const isUnderReview = rawStatus === 'Under Priest Review' || rawStatus === 'Submitted' || rawStatus === 'PENDING_VERIFICATION';
  const isChangesRequested = rawStatus === 'Changes Requested' || rawStatus === 'CHANGE_REQUESTED';
  const members = family.members || [];

  return (
    <div className="space-y-6">
      {/* Action / Status Notification Bar */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 print:hidden ${
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

      {/* Priest Feedback Note (if changes requested) */}
      {family.priestReviewNotes && isChangesRequested && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-xs space-y-1 text-amber-950">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <Clock className="w-4 h-4" />
            <span>Note from Parish Priest:</span>
          </div>
          <p className="font-editorial italic">{family.priestReviewNotes}</p>
        </div>
      )}

      {/* Main Digital Register Paper Card (Diocese of Hosur reference) */}
      <div className="bg-[#fcfaf7] border-2 border-stone-300 rounded-2xl p-5 sm:p-8 shadow-xs space-y-8 font-serif">
        {/* Header */}
        <div className="text-center pb-6 border-b-2 border-stone-300 space-y-1">
          <div className="flex items-center justify-center gap-2 mb-1">
            <img src={churchLogo} alt="Logo" className="w-8 h-8 object-contain" />
            <span className="text-[11px] font-sans uppercase font-bold tracking-widest text-amber-900">
              Diocese of Hosur · Syro-Malabar Catholic Church
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-950">
            PARISH MEMBERSHIP REGISTER
          </h1>
          <p className="font-sans text-xs text-stone-600">
            St. Mariam Thresia Church, Chengalpattu
          </p>

          {/* Status Badge & Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3 font-sans print:hidden">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isApproved
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : isUnderReview
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : isChangesRequested
                  ? 'bg-orange-100 text-orange-900 border border-orange-300'
                  : 'bg-stone-200 text-stone-800 border border-stone-300'
              }`}
            >
              Status: {rawStatus}
            </span>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Ledger</span>
            </button>

            {isApproved && (
              <button
                onClick={() => setShowChangeRequestModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-medium cursor-pointer"
              >
                <span>Request Changes to Verified Data</span>
              </button>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* REQUIREMENT 6 & 7: FAMILY INFORMATION & FAMILY ADDRESS  */}
        {/* ======================================================== */}
        <section className="space-y-4 font-sans">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-amber-900" />
              <h2 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                Family Information (കുടുംബ വിവരങ്ങൾ)
              </h2>
            </div>

            {!isApproved && !isEditingFamily && (
              <button
                onClick={() => setIsEditingFamily(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-amber-50 hover:text-amber-900 text-stone-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Family Details</span>
              </button>
            )}
          </div>

          {isEditingFamily ? (
            <div className="bg-white p-5 rounded-xl border border-amber-900/20 space-y-4 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                Editing Physical Register Fields
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                {/* Family Number */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Family Number (കുടുംബ നമ്പർ)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 101/A"
                    value={familyForm.familyNumber}
                    onChange={(e) => setFamilyForm({ ...familyForm, familyNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                {/* Name of Head of Family */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Name of Head of Family (കുടുംബനാഥന്റെ പേര്) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Joseph P.C."
                    value={familyForm.headOfFamilyName}
                    onChange={(e) => setFamilyForm({ ...familyForm, headOfFamilyName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                {/* Family Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Family Name (കുടുംബപ്പേര്) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Palackal"
                    value={familyForm.familyName}
                    onChange={(e) => setFamilyForm({ ...familyForm, familyName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                {/* Family Unit Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Family Unit Name (കൂട്ടായ്മ യൂണിറ്റ്)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. St. Thomas Unit 1"
                    value={familyForm.familyUnitName}
                    onChange={(e) => setFamilyForm({ ...familyForm, familyUnitName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                {/* Ward Number */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Ward Number (വാർഡ് നമ്പർ)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ward 4"
                    value={familyForm.wardNumber}
                    onChange={(e) => setFamilyForm({ ...familyForm, wardNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                {/* Church Tradition / Rite (Default: Syro Malabar) */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Church Tradition / Rite (റീത്ത്)
                  </label>
                  <select
                    value={familyForm.churchTradition}
                    onChange={(e) => setFamilyForm({ ...familyForm, churchTradition: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800 cursor-pointer"
                  >
                    <option value="Syro Malabar">Syro Malabar (Default)</option>
                    <option value="Latin">Latin</option>
                    <option value="Syro Malankara">Syro Malankara</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Mobile Number (മൊബൈൽ നമ്പർ) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98401 23456"
                    value={familyForm.mobileNumber}
                    onChange={(e) => setFamilyForm({ ...familyForm, mobileNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                {/* Landline Number */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Landline Number (ലാൻഡ്‌ലൈൻ)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 044-27428844"
                    value={familyForm.landline}
                    onChange={(e) => setFamilyForm({ ...familyForm, landline: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                {/* Monthly Subscription */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Monthly Subscription (പ്രതിമാസ വരിസംഖ്യ)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹500"
                    value={familyForm.monthlySubscription}
                    onChange={(e) => setFamilyForm({ ...familyForm, monthlySubscription: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                {/* Transferred Parish */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Transferred Parish (മാതൃ ഇടവക)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. St. Mary Forane Church, Kuravilangad"
                    value={familyForm.transferredParish}
                    onChange={(e) => setFamilyForm({ ...familyForm, transferredParish: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                {/* Transfer Date */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Transfer Date (മാറിയ തീയതി)
                  </label>
                  <input
                    type="date"
                    value={familyForm.transferDate}
                    onChange={(e) => setFamilyForm({ ...familyForm, transferDate: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                {/* Parish Transfer Register Number */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Parish Transfer Register No. (കത്തു നമ്പർ)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TR-KVL-89/18"
                    value={familyForm.parishTransferRegisterNumber}
                    onChange={(e) => setFamilyForm({ ...familyForm, parishTransferRegisterNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                {/* Diocese in Kerala */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Diocese in Kerala (കേരളത്തിലെ രൂപത)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Eparchy of Palai"
                    value={familyForm.dioceseInKerala}
                    onChange={(e) => setFamilyForm({ ...familyForm, dioceseInKerala: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                  />
                </div>
              </div>

              {/* REQUIREMENT 7: FAMILY RESIDENCE ADDRESS (NOT CHURCH ADDRESS) */}
              <div className="pt-3 border-t border-stone-200">
                <span className="text-[11px] font-bold text-stone-800 block mb-1">
                  Family Residential Address (കുടുംബ വിലാസം - അംഗത്തിന്റെ താമസസ്ഥലം)
                </span>
                <p className="text-[10px] text-stone-500 mb-2">
                  Enter your family residence details. (The church address is not used as your home address).
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-stone-500 mb-0.5">House / Door No.</label>
                    <input
                      type="text"
                      placeholder="e.g. 9, 1E"
                      value={familyForm.doorNumber}
                      onChange={(e) => setFamilyForm({ ...familyForm, doorNumber: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-stone-500 mb-0.5">Street / Road</label>
                    <input
                      type="text"
                      placeholder="e.g. GST Road"
                      value={familyForm.street}
                      onChange={(e) => setFamilyForm({ ...familyForm, street: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-stone-500 mb-0.5">Area / Locality</label>
                    <input
                      type="text"
                      placeholder="e.g. J C K Nagar"
                      value={familyForm.area}
                      onChange={(e) => setFamilyForm({ ...familyForm, area: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-stone-500 mb-0.5">City / Town</label>
                    <input
                      type="text"
                      placeholder="e.g. Chengalpattu"
                      value={familyForm.city}
                      onChange={(e) => setFamilyForm({ ...familyForm, city: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-stone-500 mb-0.5">District</label>
                    <input
                      type="text"
                      placeholder="e.g. Chengalpattu"
                      value={familyForm.district}
                      onChange={(e) => setFamilyForm({ ...familyForm, district: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-stone-500 mb-0.5">State</label>
                    <input
                      type="text"
                      placeholder="e.g. Tamil Nadu"
                      value={familyForm.state}
                      onChange={(e) => setFamilyForm({ ...familyForm, state: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-stone-500 mb-0.5">PIN Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 603002"
                      value={familyForm.pinCode}
                      onChange={(e) => setFamilyForm({ ...familyForm, pinCode: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Form Controls */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsEditingFamily(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveDraft}
                  className="px-4 py-1.5 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Family Information'}
                </button>
              </div>
            </div>
          ) : (
            /* Read-Only Structured View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 text-xs bg-white p-5 rounded-xl border border-stone-200">
              <div>
                <span className="text-stone-500 block text-[11px]">Family Number:</span>
                <strong className="text-stone-900 font-mono text-sm">
                  {family.familyNumber || family.registerFolioNumber || '—'}
                </strong>
              </div>

              <div>
                <span className="text-stone-500 block text-[11px]">Name of Head of Family:</span>
                <strong className="text-stone-900 text-sm font-serif">
                  {family.headOfFamilyName || currentMember?.fullName || (currentMember ? `${currentMember.firstName} ${currentMember.lastName}` : '—')}
                </strong>
              </div>

              <div>
                <span className="text-stone-500 block text-[11px]">Family Name:</span>
                <strong className="text-stone-900 text-sm">{family.familyName || '—'}</strong>
              </div>

              <div>
                <span className="text-stone-500 block text-[11px]">Family Unit Name:</span>
                <span className="font-semibold text-stone-900">{family.familyUnitName || family.wardOrUnit || '—'}</span>
              </div>

              <div>
                <span className="text-stone-500 block text-[11px]">Ward Number:</span>
                <span className="font-semibold text-stone-900">{family.wardNumber || '—'}</span>
              </div>

              <div>
                <span className="text-stone-500 block text-[11px]">Church Tradition / Rite:</span>
                <span className="font-semibold text-amber-950 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {family.churchTradition || 'Syro Malabar'}
                </span>
              </div>

              <div>
                <span className="text-stone-500 block text-[11px]">Mobile Number:</span>
                <span className="font-medium text-stone-900">{family.mobileNumber || family.contactPhone || '—'}</span>
              </div>

              <div>
                <span className="text-stone-500 block text-[11px]">Landline Number:</span>
                <span className="font-medium text-stone-900">{family.landline || '—'}</span>
              </div>

              <div>
                <span className="text-stone-500 block text-[11px]">Monthly Subscription:</span>
                <span className="font-semibold text-stone-900">{family.monthlySubscription || '—'}</span>
              </div>

              <div>
                <span className="text-stone-500 block text-[11px]">Transferred Parish:</span>
                <span className="font-medium text-stone-900">{family.transferredParish || family.nativeParish || '—'}</span>
              </div>

              <div>
                <span className="text-stone-500 block text-[11px]">Transfer Date:</span>
                <span className="font-medium text-stone-900">{family.transferDate || '—'}</span>
              </div>

              <div>
                <span className="text-stone-500 block text-[11px]">Parish Transfer Register No:</span>
                <span className="font-medium text-stone-900">{family.parishTransferRegisterNumber || '—'}</span>
              </div>

              <div>
                <span className="text-stone-500 block text-[11px]">Diocese in Kerala:</span>
                <span className="font-medium text-stone-900">{family.dioceseInKerala || family.nativeDiocese || '—'}</span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-stone-500 block text-[11px]">Family Residence Address:</span>
                <span className="font-medium text-stone-900 leading-relaxed">
                  {family.address || (
                    [family.doorNumber, family.street, family.area, family.city, family.district, family.state, family.pinCode]
                      .filter(Boolean)
                      .join(', ') || 'No resident address recorded'
                  )}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* ======================================================== */}
        {/* REQUIREMENT 8, 9, 10 & 11: FAMILY MEMBERS REGISTER TABLE & CARDS */}
        {/* ======================================================== */}
        <section className="space-y-4 font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-900" />
                <h2 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                  Family Members (കുടുംബാംഗങ്ങൾ)
                </h2>
              </div>
              <p className="text-xs text-stone-500 font-editorial mt-0.5">
                Each family member has their own separate record. Add members one by one.
              </p>
            </div>

            {/* + Add Family Member Button (Requirement 8) */}
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer w-fit"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Family Member</span>
            </button>
          </div>

          {/* Desktop & Tablet View: Structured Physical Register Table (Requirement 10) */}
          <div className="hidden md:block overflow-x-auto border-2 border-stone-300 rounded-xl bg-white shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f5efe6] text-[11px] font-bold text-stone-800 uppercase tracking-wider border-b-2 border-stone-300">
                <tr>
                  <th className="py-3 px-3 border-r border-stone-300 text-center w-12">Sl. No.</th>
                  <th className="py-3 px-3 border-r border-stone-300 min-w-[140px]">Name of Family Member</th>
                  <th className="py-3 px-3 border-r border-stone-300 min-w-[90px]">Relationship</th>
                  <th className="py-3 px-3 border-r border-stone-300 min-w-[85px]">Date of Birth</th>
                  <th className="py-3 px-3 border-r border-stone-300 min-w-[85px]">Baptism</th>
                  <th className="py-3 px-3 border-r border-stone-300 min-w-[90px]">First Holy Communion</th>
                  <th className="py-3 px-3 border-r border-stone-300 min-w-[85px]">Confirmation</th>
                  <th className="py-3 px-3 border-r border-stone-300 min-w-[100px]">Marriage / Ordination</th>
                  <th className="py-3 px-3 border-r border-stone-300 min-w-[100px]">Profession</th>
                  <th className="py-3 px-3 border-r border-stone-300 min-w-[70px]">Death</th>
                  <th className="py-3 px-3 text-center print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {members.length > 0 ? (
                  members.map((m, idx) => {
                    const displayName = m.fullName || `${m.firstName} ${m.lastName}`.trim();
                    const relationship = m.relationshipWithHead || (m.relationshipToHead === 'HEAD' ? 'Family Head' : m.relationshipToHead);

                    return (
                      <tr key={m.id} className="hover:bg-amber-50/50 transition-colors">
                        <td className="py-3 px-3 border-r border-stone-200 text-center font-bold text-stone-600">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3 border-r border-stone-200 font-serif font-bold text-stone-900">
                          {displayName}
                        </td>
                        <td className="py-3 px-3 border-r border-stone-200 text-stone-700">
                          {relationship}
                        </td>
                        <td className="py-3 px-3 border-r border-stone-200 font-mono text-[11px] text-stone-800">
                          {m.dateOfBirth || '—'}
                        </td>
                        <td className="py-3 px-3 border-r border-stone-200 text-stone-700 text-[11px]">
                          {m.baptismDate || '—'}
                        </td>
                        <td className="py-3 px-3 border-r border-stone-200 text-stone-700 text-[11px]">
                          {m.firstHolyCommunionDate || m.firstCommunionConfirmationDate || '—'}
                        </td>
                        <td className="py-3 px-3 border-r border-stone-200 text-stone-700 text-[11px]">
                          {m.confirmationDate || '—'}
                        </td>
                        <td className="py-3 px-3 border-r border-stone-200 text-stone-700 text-[11px]">
                          {m.marriageOrdinationDate || m.marriageDate || '—'}
                        </td>
                        <td className="py-3 px-3 border-r border-stone-200 text-stone-800 text-[11px]">
                          {m.profession || m.occupation || '—'}
                        </td>
                        <td className="py-3 px-3 border-r border-stone-200 text-stone-600 text-[11px]">
                          {m.deathInfo || m.dateOfDeath || '—'}
                        </td>
                        <td className="py-3 px-3 text-center print:hidden space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => setEditingMember(m)}
                            className="p-1 text-stone-600 hover:text-amber-900 hover:bg-stone-100 rounded cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {m.relationshipToHead !== 'HEAD' && (
                            <button
                              onClick={() => handleDeleteMember(m.id, displayName)}
                              className="p-1 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                              title="Remove Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-xs text-stone-500 italic">
                      No family members added yet. Click "+ Add Family Member" above to begin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View: Expandable Cards (Requirement 11) */}
          <div className="md:hidden space-y-3">
            {members.length > 0 ? (
              members.map((m, idx) => {
                const displayName = m.fullName || `${m.firstName} ${m.lastName}`.trim();
                const relationship = m.relationshipWithHead || (m.relationshipToHead === 'HEAD' ? 'Family Head' : m.relationshipToHead);
                const isExpanded = expandedMemberId === m.id;

                return (
                  <div
                    key={m.id}
                    className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden"
                  >
                    <div
                      onClick={() => setExpandedMemberId(isExpanded ? null : m.id)}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-stone-50"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-stone-500">#{idx + 1}</span>
                          <strong className="font-serif text-sm font-bold text-stone-900">
                            {displayName}
                          </strong>
                        </div>
                        <span className="text-xs text-amber-900 font-semibold block">
                          {relationship}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-stone-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Expandable Sacramental & Census Information */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-stone-100 bg-stone-50/60 space-y-2 text-xs text-stone-700">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-stone-500 block">Date of Birth:</span>
                            <span className="font-mono">{m.dateOfBirth || '—'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-500 block">Profession:</span>
                            <span>{m.profession || m.occupation || '—'}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-200/60">
                          <div>
                            <span className="text-[10px] text-stone-500 block">Baptism:</span>
                            <span>{m.baptismDate || '—'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-500 block">First Holy Communion:</span>
                            <span>{m.firstHolyCommunionDate || m.firstCommunionConfirmationDate || '—'}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-200/60">
                          <div>
                            <span className="text-[10px] text-stone-500 block">Confirmation:</span>
                            <span>{m.confirmationDate || '—'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-500 block">Marriage / Ordination:</span>
                            <span>{m.marriageOrdinationDate || m.marriageDate || '—'}</span>
                          </div>
                        </div>

                        {m.deathInfo && m.deathInfo !== '—' && (
                          <div className="pt-1 border-t border-stone-200/60">
                            <span className="text-[10px] text-stone-500 block">Death Information:</span>
                            <span className="text-red-700 font-semibold">{m.deathInfo}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                          <button
                            onClick={() => setEditingMember(m)}
                            className="px-3 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            View / Edit
                          </button>
                          {m.relationshipToHead !== 'HEAD' && (
                            <button
                              onClick={() => handleDeleteMember(m.id, displayName)}
                              className="px-2.5 py-1 text-red-700 hover:bg-red-50 rounded-lg text-xs cursor-pointer"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-stone-500 bg-white rounded-xl border border-stone-200">
                No family members added yet. Click "+ Add Family Member" above.
              </div>
            )}
          </div>
        </section>

        {/* ======================================================== */}
        {/* REQUIREMENT 12: FAMILY REGISTER STATUS & ACTIONS         */}
        {/* Save Draft & Submit Family Information                    */}
        {/* ======================================================== */}
        <div className="pt-6 border-t-2 border-stone-300 font-sans flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <div className="text-xs text-stone-500 font-editorial text-center sm:text-left">
            <span>Current Status: </span>
            <strong className="text-stone-900">{rawStatus}</strong>
            <p className="text-[11px] text-stone-400 mt-0.5">
              You can continue completing your family register later if it is incomplete.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isApproved && (
              <>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveDraft}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  disabled={saving || isUnderReview}
                  onClick={handleSubmitInformation}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isUnderReview ? 'Submitted to Priest' : 'Submit Family Information'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: ADD FAMILY MEMBER ONE BY ONE (Requirement 8 & 9)  */}
      {/* ======================================================== */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                  Parish Register Enrollment
                </span>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  + Add Family Member (അംഗത്തെ ചേർക്കുക)
                </h3>
              </div>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 text-xs font-sans">
              {/* Basic Information */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-stone-800 uppercase tracking-wide block">
                  1. Basic Information (അടിസ്ഥാന വിവരങ്ങൾ)
                </span>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Full Name (പൂർണ്ണനാമം) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Haris Joseph"
                    value={newMemberForm.fullName}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Relationship with Head (കുടുംബനാഥനുമായുള്ള ബന്ധം) *
                    </label>
                    <select
                      value={newMemberForm.relationshipWithHead}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, relationshipWithHead: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800 cursor-pointer"
                    >
                      <option value="Wife">Wife (ഭാര്യ)</option>
                      <option value="Husband">Husband (ഭർത്താവ്)</option>
                      <option value="Son">Son (മകൻ)</option>
                      <option value="Daughter">Daughter (മകൾ)</option>
                      <option value="Father">Father (പിതാവ്)</option>
                      <option value="Mother">Mother (മാതാവ്)</option>
                      <option value="Brother">Brother (സഹോദരൻ)</option>
                      <option value="Sister">Sister (സഹോദരി)</option>
                      <option value="Other">Other Relative (മറ്റു ബന്ധു)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Date of Birth (ജനനത്തീയതി) *
                    </label>
                    <input
                      type="date"
                      required
                      value={newMemberForm.dateOfBirth}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                    />
                  </div>
                </div>
              </div>

              {/* Sacramental Information */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <span className="text-[11px] font-bold text-stone-800 uppercase tracking-wide block">
                  2. Sacramental Information (കൂദാശകൾ)
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">Baptism Date (മാമ്മോദീസ തീയതി)</label>
                    <input
                      type="date"
                      value={newMemberForm.baptismDate}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, baptismDate: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">First Holy Communion (ആദ്യകുർബാന)</label>
                    <input
                      type="date"
                      value={newMemberForm.firstHolyCommunionDate}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, firstHolyCommunionDate: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">Confirmation (സ്ഥൈര്യലേപനം)</label>
                    <input
                      type="date"
                      value={newMemberForm.confirmationDate}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, confirmationDate: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">Marriage / Ordination (വിവാഹം / പട്ടം)</label>
                    <input
                      type="date"
                      value={newMemberForm.marriageOrdinationDate}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, marriageOrdinationDate: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Other Information */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <span className="text-[11px] font-bold text-stone-800 uppercase tracking-wide block">
                  3. Other Information (മറ്റു വിവരങ്ങൾ)
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">Profession (തൊഴിൽ)</label>
                    <input
                      type="text"
                      placeholder="e.g. Engineer, Student, Business"
                      value={newMemberForm.profession}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, profession: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">Death (മരണം - എങ്കിൽ മാത്രം)</label>
                    <input
                      type="text"
                      placeholder="— or Date of Death"
                      value={newMemberForm.deathInfo}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, deathInfo: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Adding Member...' : 'Save Member to Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT INDIVIDUAL FAMILY MEMBER                    */}
      {/* ======================================================== */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Edit Member Record: {editingMember.fullName || `${editingMember.firstName} ${editingMember.lastName}`}
              </h3>
              <button onClick={() => setEditingMember(null)} className="text-stone-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateMember} className="space-y-3.5 text-xs font-sans">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingMember.fullName || `${editingMember.firstName} ${editingMember.lastName}`.trim()}
                  onChange={(e) => setEditingMember({ ...editingMember, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    value={editingMember.relationshipWithHead || editingMember.relationshipToHead}
                    onChange={(e) => setEditingMember({ ...editingMember, relationshipWithHead: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editingMember.dateOfBirth || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Baptism Date</label>
                  <input
                    type="date"
                    value={editingMember.baptismDate || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, baptismDate: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">First Holy Communion</label>
                  <input
                    type="date"
                    value={editingMember.firstHolyCommunionDate || editingMember.firstCommunionConfirmationDate || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, firstHolyCommunionDate: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Confirmation</label>
                  <input
                    type="date"
                    value={editingMember.confirmationDate || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, confirmationDate: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Marriage / Ordination</label>
                  <input
                    type="date"
                    value={editingMember.marriageOrdinationDate || editingMember.marriageDate || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, marriageOrdinationDate: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Profession</label>
                  <input
                    type="text"
                    value={editingMember.profession || editingMember.occupation || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, profession: e.target.value, occupation: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Death Information</label>
                  <input
                    type="text"
                    placeholder="— or Date of Death"
                    value={editingMember.deathInfo || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, deathInfo: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Save Member Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: REQUEST CHANGES TO VERIFIED DATA                  */}
      {/* ======================================================== */}
      {showChangeRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Request Correction to Verified Record
              </h3>
              <button onClick={() => setShowChangeRequestModal(false)} className="text-stone-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 font-editorial">
              Since this Parish Register has already been verified and locked by the Vicar, submit your requested corrections below for pastoral approval:
            </p>

            <form onSubmit={handleRequestChanges} className="space-y-4 font-sans">
              <textarea
                required
                rows={4}
                placeholder="e.g. Please update our present residence address to Door 42, Alagesan Nagar, Chengalpattu..."
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-800"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangeRequestModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  Submit Pastoral Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
