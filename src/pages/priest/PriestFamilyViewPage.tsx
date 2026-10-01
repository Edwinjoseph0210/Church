import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Member, Family } from '../../types';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Printer,
  Download,
  ShieldCheck,
  UserCheck,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Home,
  MessageSquare,
  Eye,
  X,
  Church,
} from 'lucide-react';

interface PriestFamilyViewPageProps {
  memberId: string;
  navigate: (path: string) => void;
}

export const PriestFamilyViewPage: React.FC<PriestFamilyViewPageProps> = ({
  memberId,
  navigate,
}) => {
  const [data, setData] = useState<{
    member?: Member;
    family?: Family;
    members?: Member[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review states
  const [reviewing, setReviewing] = useState(false);
  const [showRequestChangesModal, setShowRequestChangesModal] = useState(false);
  const [changesNotes, setChangesNotes] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Detailed family member inspection modal
  const [inspectingMember, setInspectingMember] = useState<Member | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<{
        member: Member;
        family?: Family;
        members: Member[];
      }>(`/priest/members/${memberId}`);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load family register.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [memberId]);

  const handleApproveRegister = async () => {
    if (!data?.family) return;
    setReviewing(true);
    setFeedback(null);
    try {
      const res = await apiRequest<{ message: string; family: Family }>(
        `/priest/families/${data.family.id}/review`,
        {
          method: 'POST',
          body: JSON.stringify({ action: 'APPROVE', notes: 'Verified and approved by Parish Priest.' }),
        }
      );
      setFeedback({ message: res.message, type: 'success' });
      await loadData();
    } catch (err: any) {
      setFeedback({ message: err.message || 'Failed to approve register.', type: 'error' });
    } finally {
      setReviewing(false);
    }
  };

  const handleRequestChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.family) return;
    setReviewing(true);
    setFeedback(null);
    try {
      const res = await apiRequest<{ message: string; family: Family }>(
        `/priest/families/${data.family.id}/review`,
        {
          method: 'POST',
          body: JSON.stringify({ action: 'REQUEST_CHANGES', notes: changesNotes }),
        }
      );
      setFeedback({ message: res.message, type: 'success' });
      setShowRequestChangesModal(false);
      setChangesNotes('');
      await loadData();
    } catch (err: any) {
      setFeedback({ message: err.message || 'Failed to submit changes request.', type: 'error' });
    } finally {
      setReviewing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadFamilyDetails = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for this website to print / export the PDF register.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Parish Membership Register - ${fam?.familyName || 'Family'} - Diocese of Hosur</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 9.5pt;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 10px;
            line-height: 1.3;
          }
          .form-container {
            border: 2px solid #000;
            padding: 16px;
            max-width: 1120px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
            margin-bottom: 12px;
            position: relative;
          }
          .diocese-title {
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .register-title {
            font-size: 11pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 2px;
          }
          .form-no-box {
            position: absolute;
            top: 0;
            right: 0;
            border: 1px solid #000;
            padding: 3px 10px;
            font-weight: bold;
            font-size: 9.5pt;
          }
          .sub-box {
            position: absolute;
            top: 30px;
            right: 0;
            border: 1px solid #000;
            padding: 3px 10px;
            font-size: 8.5pt;
          }
          .row {
            display: flex;
            margin-bottom: 6px;
            border-bottom: 1px dotted #555;
            padding-bottom: 3px;
            font-size: 9pt;
          }
          .field {
            flex: 1;
            margin-right: 12px;
          }
          .field label {
            font-weight: bold;
            margin-right: 4px;
          }
          .field span {
            border-bottom: 1px solid #000;
            padding-bottom: 1px;
          }
          .checkbox-group {
            display: flex;
            gap: 12px;
            align-items: center;
            margin: 8px 0;
            font-size: 9pt;
          }
          .checkbox {
            display: inline-block;
            width: 11px;
            height: 11px;
            border: 1px solid #000;
            text-align: center;
            line-height: 11px;
            font-size: 8.5pt;
            font-weight: bold;
            margin-right: 3px;
          }
          table.census {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 10px;
            font-size: 8.5pt;
          }
          table.census th, table.census td {
            border: 1px solid #000;
            padding: 5px 4px;
            text-align: center;
            vertical-align: middle;
          }
          table.census th {
            background: #f0f0f0;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 8pt;
          }
          table.census td:nth-child(2) {
            text-align: left;
            font-weight: bold;
          }
          .footer-section {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
            font-size: 9pt;
          }
          .remarks-box {
            flex: 1;
            border: 1px solid #000;
            padding: 6px;
            min-height: 35px;
            margin-right: 15px;
          }
          .signature-area {
            text-align: center;
            width: 220px;
          }
          .signature-line {
            border-top: 1px solid #000;
            margin-top: 25px;
            padding-top: 3px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="form-container">
          <div class="header">
            <div class="diocese-title">Diocese of Hosur</div>
            <div class="register-title">Parish Membership Register (Aatmasthithi Book)</div>
            <div style="font-size: 9pt; font-style: italic; margin-top: 1px;">St. Mariam Thresia Church, Chengalpattu</div>
            <div class="form-no-box">No: ${fam?.familyNumber || fam?.registerFolioNumber || '2'}</div>
            <div class="sub-box">Monthly Sub: ${fam?.monthlySubscription || '₹500'}</div>
          </div>

          <div class="row">
            <div class="field" style="flex: 2;">
              <label>Name of Head of the Family:</label>
              <span><strong>${fam?.headOfFamilyName || '—'}</strong></span>
            </div>
            <div class="field" style="flex: 1;">
              <label>Mobile No.:</label>
              <span>${fam?.mobileNumber || fam?.contactPhone || '—'}</span>
            </div>
            <div class="field" style="flex: 2;">
              <label>Address:</label>
              <span>${fam?.address || '—'}</span>
            </div>
          </div>

          <div class="row">
            <div class="field" style="flex: 2;">
              <label>Family Name (House):</label>
              <span><strong>${fam?.familyName || '—'}</strong></span>
            </div>
            <div class="field" style="flex: 1;">
              <label>Landline No.:</label>
              <span>${fam?.landline || '—'}</span>
            </div>
          </div>

          <div class="row">
            <div class="field" style="flex: 2;">
              <label>Family Unit Name:</label>
              <span>${fam?.familyUnitName || fam?.wardOrUnit || '—'}</span>
            </div>
            <div class="field" style="flex: 1;">
              <label>Ward No.:</label>
              <span>${fam?.wardNumber || 'Ward 1'}</span>
            </div>
          </div>

          <div class="row">
            <div class="field" style="flex: 2;">
              <label>Transferred Parish:</label>
              <span>${fam?.nativeParish || fam?.transferredParish || '—'}</span>
            </div>
            <div class="field" style="flex: 1;">
              <label>Date:</label>
              <span>${fam?.transferDate || fam?.verifiedDate || '—'}</span>
            </div>
            <div class="field" style="flex: 2;">
              <label>Parish Transfer Register No.:</label>
              <span>${fam?.parishTransferRegisterNumber || '—'}</span>
            </div>
          </div>

          <div class="checkbox-group">
            <div>Church Tradition:</div>
            <div><span class="checkbox">${(fam?.churchTradition || '').toLowerCase().includes('syro') ? 'X' : ''}</span> Syro Malabar</div>
            <div><span class="checkbox">${(fam?.churchTradition || '').toLowerCase().includes('latin') ? 'X' : ''}</span> Latin</div>
            <div><span class="checkbox">${(fam?.churchTradition || '').toLowerCase().includes('malankara') ? 'X' : ''}</span> Syro Malankara</div>
            <div><span class="checkbox"></span> Others</div>
            <div style="margin-left: 15px;">Diocese in Kerala: <strong>${fam?.dioceseInKerala || 'Eparchy of Palai'}</strong></div>
          </div>

          <table class="census">
            <thead>
              <tr>
                <th style="width: 4%;">Sl. No.</th>
                <th style="width: 17%;">Names of Family Members</th>
                <th style="width: 12%;">Relationship with the Head</th>
                <th style="width: 9%;">Date of Birth</th>
                <th style="width: 9%;">Baptism</th>
                <th style="width: 10%;">First Holy Communion</th>
                <th style="width: 9%;">Confirmation</th>
                <th style="width: 10%;">Marriage / Ordination</th>
                <th style="width: 11%;">Profession</th>
                <th style="width: 9%;">Death</th>
              </tr>
            </thead>
            <tbody>
              ${familyMembers.map((m, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${m.fullName || `${m.firstName} ${m.lastName}`}</td>
                  <td>${m.relationshipWithHead || m.relationshipToHead || 'Member'}</td>
                  <td>${m.dateOfBirth || '—'}</td>
                  <td>${m.baptismDate || '—'}</td>
                  <td>${m.firstHolyCommunionDate || m.firstCommunionConfirmationDate || '—'}</td>
                  <td>${m.confirmationDate || '—'}</td>
                  <td>${m.marriageOrdinationDate || m.marriageDate || '—'}</td>
                  <td>${m.profession || m.occupation || '—'}</td>
                  <td>${m.dateOfDeath || '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer-section">
            <div class="remarks-box">
              <strong>Remarks of Parish Priest:</strong><br>
              <span style="font-size: 8.5pt; color: #333;">${fam?.verificationNotes || 'Official family register verified and recorded in canonical communion with the Diocese of Hosur.'}</span>
              <div style="margin-top: 6px; font-size: 8pt;">
                <span class="checkbox">${fam?.houseOwnership === 'OWNED' ? 'X' : ''}</span> OWN HOUSE &nbsp;&nbsp;&nbsp;
                <span class="checkbox">${fam?.houseOwnership === 'RENTED' ? 'X' : ''}</span> RENTED HOUSE &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                FREQUENCY: EVERY WEEK <span class="checkbox">X</span> BI WEEK <span class="checkbox"></span> FOR FEASTS <span class="checkbox"></span>
              </div>
            </div>
            <div class="signature-area">
              <div class="signature-line">Fr. Joshy N George</div>
              <div style="font-size: 8.5pt; font-weight: bold; margin-top: 2px;">Parish Priest / Vicar & Seal</div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
        <div className="w-8 h-8 border-3 border-amber-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-stone-500 font-editorial">Loading official family register...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-red-200 space-y-3">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
        <h3 className="font-serif text-lg font-bold text-stone-900">Record Not Found</h3>
        <p className="text-xs text-stone-600 font-editorial">{error || 'The requested family register could not be located.'}</p>
        <button
          onClick={() => navigate('/priest/members')}
          className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
        >
          Return to Members Directory
        </button>
      </div>
    );
  }

  const fam = data.family;
  const familyMembers = data.members || [];
  const status = fam?.verificationStatus || fam?.registerStatus || 'Draft';

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/priest/members')}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            title="Back to Members List"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800 block">
              Parish Membership Register
            </span>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
              {fam?.familyName || `${data.member?.firstName} ${data.member?.lastName} Family`}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Ledger</span>
          </button>

          <button
            onClick={handleDownloadFamilyDetails}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Family Details</span>
          </button>

          <button
            onClick={() => setShowRequestChangesModal(true)}
            disabled={reviewing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Request Changes</span>
          </button>

          <button
            onClick={handleApproveRegister}
            disabled={reviewing || status === 'Approved'}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{status === 'Approved' ? 'Register Approved' : 'Approve Register'}</span>
          </button>
        </div>
      </div>

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

      {/* ======================================================== */}
      {/* PHYSICAL DIOCESE OF HOSUR REGISTER CARD (REFERENCE DESIGN) */}
      {/* ======================================================== */}
      <div className="bg-[#fcfaf7] border-2 border-stone-300 rounded-2xl p-6 sm:p-8 shadow-xs space-y-8 font-serif text-stone-900">
        {/* Register Ledger Header */}
        <div className="text-center pb-6 border-b-2 border-stone-300 space-y-1">
          <span className="text-[11px] font-sans uppercase font-bold tracking-widest text-amber-900">
            Diocese of Hosur · Syro-Malabar Catholic Church
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-950">
            PARISH MEMBERSHIP REGISTER
          </h2>
          <p className="font-sans text-xs text-stone-600">
            St. Mariam Thresia Church, Chengalpattu
          </p>

          <div className="flex items-center justify-center gap-3 pt-2 font-sans">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                status === 'Approved' || status === 'VERIFIED'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : status === 'Under Priest Review' || status === 'Submitted'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-stone-200 text-stone-800'
              }`}
            >
              Status: {status}
            </span>
            {fam?.verifiedDate && (
              <span className="text-xs text-stone-500 font-editorial">
                Verified on: {fam.verifiedDate} by {fam.verifiedBy || 'Parish Vicar'}
              </span>
            )}
          </div>
        </div>

        {/* REQUIREMENT 15: FAMILY INFORMATION IN PHYSICAL REGISTER FORMAT */}
        <section className="space-y-4 font-sans">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
            <BookOpen className="w-4 h-4 text-amber-900" />
            <h3 className="font-serif text-base font-bold text-stone-900">
              Family Information (കുടുംബ വിവരങ്ങൾ)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3.5 gap-x-6 text-xs bg-white p-5 rounded-xl border border-stone-200">
            <div>
              <span className="text-stone-500 block text-[11px]">Family Number:</span>
              <strong className="text-stone-900 font-mono text-sm">
                {fam?.familyNumber || fam?.registerFolioNumber || '—'}
              </strong>
            </div>

            <div>
              <span className="text-stone-500 block text-[11px]">Name of Head of Family:</span>
              <strong className="text-stone-900 text-sm font-serif">
                {fam?.headOfFamilyName || data.member?.fullName || `${data.member?.firstName} ${data.member?.lastName}`}
              </strong>
            </div>

            <div>
              <span className="text-stone-500 block text-[11px]">Family Name:</span>
              <strong className="text-stone-900 text-sm">{fam?.familyName || '—'}</strong>
            </div>

            <div>
              <span className="text-stone-500 block text-[11px]">Family Unit Name:</span>
              <span className="font-semibold text-stone-900">{fam?.familyUnitName || fam?.wardOrUnit || '—'}</span>
            </div>

            <div>
              <span className="text-stone-500 block text-[11px]">Ward Number:</span>
              <span className="font-semibold text-stone-900">{fam?.wardNumber || '—'}</span>
            </div>

            <div>
              <span className="text-stone-500 block text-[11px]">Church Tradition / Rite:</span>
              <span className="font-semibold text-amber-950 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {fam?.churchTradition || 'Syro Malabar'}
              </span>
            </div>

            <div>
              <span className="text-stone-500 block text-[11px]">Mobile Number:</span>
              <span className="font-medium text-stone-900">{fam?.mobileNumber || fam?.contactPhone || '—'}</span>
            </div>

            <div>
              <span className="text-stone-500 block text-[11px]">Landline Number:</span>
              <span className="font-medium text-stone-900">{fam?.landline || '—'}</span>
            </div>

            <div>
              <span className="text-stone-500 block text-[11px]">Monthly Subscription:</span>
              <span className="font-semibold text-stone-900">{fam?.monthlySubscription || '—'}</span>
            </div>

            <div>
              <span className="text-stone-500 block text-[11px]">Transferred Parish:</span>
              <span className="font-medium text-stone-900">{fam?.transferredParish || fam?.nativeParish || '—'}</span>
            </div>

            <div>
              <span className="text-stone-500 block text-[11px]">Transfer Date:</span>
              <span className="font-medium text-stone-900">{fam?.transferDate || '—'}</span>
            </div>

            <div>
              <span className="text-stone-500 block text-[11px]">Parish Transfer Register No:</span>
              <span className="font-medium text-stone-900">{fam?.parishTransferRegisterNumber || '—'}</span>
            </div>

            <div>
              <span className="text-stone-500 block text-[11px]">Diocese in Kerala:</span>
              <span className="font-medium text-stone-900">{fam?.dioceseInKerala || fam?.nativeDiocese || '—'}</span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-stone-500 block text-[11px]">Family Residential Address:</span>
              <span className="font-medium text-stone-900 leading-relaxed">
                {fam?.address || (
                  [fam?.doorNumber, fam?.street, fam?.area, fam?.city, fam?.district, fam?.state, fam?.pinCode]
                    .filter(Boolean)
                    .join(', ') || 'No resident address recorded'
                )}
              </span>
            </div>
          </div>
        </section>

        {/* REQUIREMENT 10, 15 & 16: PHYSICAL REGISTER STYLE MEMBERS TABLE */}
        <section className="space-y-4 font-sans">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <Church className="w-4 h-4 text-amber-900" />
              <h3 className="font-serif text-base font-bold text-stone-900">
                Family Members Register (അംഗങ്ങളുടെ പട്ടിക)
              </h3>
            </div>
            <span className="text-xs text-stone-500">
              Total Enrolled: <strong>{familyMembers.length} members</strong>
            </span>
          </div>

          <div className="overflow-x-auto border-2 border-stone-300 rounded-xl bg-white shadow-xs">
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
                  <th className="py-3 px-3 text-center print:hidden">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {familyMembers.map((m, idx) => {
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
                      <td className="py-3 px-3 text-center print:hidden">
                        <button
                          onClick={() => setInspectingMember(m)}
                          className="p-1.5 text-stone-600 hover:text-amber-900 hover:bg-stone-100 rounded-lg cursor-pointer"
                          title="Inspect complete sacramental record"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Vicar's Attestation Box */}
        <div className="pt-6 border-t-2 border-stone-300 font-sans flex flex-col sm:flex-row justify-between items-end gap-6 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-stone-700">Parish Pastoral Notes:</span>
            <p className="text-stone-500 italic max-w-md font-editorial">
              {fam?.verificationNotes || 'Parish membership register entry maintained in communion with the Syro-Malabar Catholic Diocese of Hosur.'}
            </p>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <div className="w-52 border-b border-stone-400 pb-1 text-center font-serif italic text-stone-700">
              {fam?.verifiedBy && fam.verifiedBy !== '[PARISH PRIEST NAME]' ? fam.verifiedBy : 'Fr. Joshy N George'}
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
              Parish Priest / Vicar Signature
            </span>
            <span className="text-[9px] text-stone-400 block font-sans">
              Fr. Joshy N George · +91 97421 62172
            </span>
          </div>
        </div>
      </div>

      {/* REQUEST CHANGES MODAL */}
      {showRequestChangesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Request Changes to Family Register
              </h3>
              <button
                onClick={() => setShowRequestChangesModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600 font-editorial">
              Specify what corrections or missing records the Head of Family must provide before register verification:
            </p>

            <form onSubmit={handleRequestChanges} className="space-y-4">
              <textarea
                required
                rows={4}
                placeholder="e.g. Please provide First Holy Communion dates for the children and upload native parish details..."
                value={changesNotes}
                onChange={(e) => setChangesNotes(e.target.value)}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-800"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestChangesModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewing}
                  className="px-4 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  Send Changes Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEMBER SACRAMENTAL RECORD INSPECTION MODAL */}
      {inspectingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                  Sacramental Record Archive
                </span>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {inspectingMember.fullName || `${inspectingMember.firstName} ${inspectingMember.lastName}`}
                </h3>
              </div>
              <button
                onClick={() => setInspectingMember(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-stone-500 block text-[11px]">Relationship:</span>
                  <strong>{inspectingMember.relationshipWithHead || inspectingMember.relationshipToHead}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Date of Birth:</span>
                  <strong>{inspectingMember.dateOfBirth || '—'}</strong>
                </div>
              </div>

              <div className="border-t border-stone-200/60 pt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-stone-500 block text-[11px]">Baptism Date:</span>
                  <span>{inspectingMember.baptismDate || '—'}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Baptism Parish:</span>
                  <span>{inspectingMember.baptismParish || '—'}</span>
                </div>
              </div>

              <div className="border-t border-stone-200/60 pt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-stone-500 block text-[11px]">First Holy Communion:</span>
                  <span>{inspectingMember.firstHolyCommunionDate || inspectingMember.firstCommunionConfirmationDate || '—'}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Confirmation:</span>
                  <span>{inspectingMember.confirmationDate || '—'}</span>
                </div>
              </div>

              <div className="border-t border-stone-200/60 pt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-stone-500 block text-[11px]">Marriage / Ordination:</span>
                  <span>{inspectingMember.marriageOrdinationDate || inspectingMember.marriageDate || '—'}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Profession / Career:</span>
                  <span>{inspectingMember.profession || inspectingMember.occupation || '—'}</span>
                </div>
              </div>

              {inspectingMember.deathInfo && inspectingMember.deathInfo !== '—' && (
                <div className="border-t border-stone-200/60 pt-2">
                  <span className="text-stone-500 block text-[11px]">Death Information:</span>
                  <span className="text-red-800 font-semibold">{inspectingMember.deathInfo}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setInspectingMember(null)}
                className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
