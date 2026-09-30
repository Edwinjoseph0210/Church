import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { apiRequest } from '../../services/api';
import {
  Lock,
  Mail,
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  UserPlus,
  LogIn,
} from 'lucide-react';
import churchLogo from '../../assets/church_logo.svg';

interface LoginPageProps {
  navigate: (path: string) => void;
  initialMode?: 'LOGIN' | 'REGISTER';
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate, initialMode = 'LOGIN' }) => {
  const { login, quickLoginAs, user, isPriest } = useAuth();
  const { settings } = useSettings();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(initialMode);

  // Sign In Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Registration Form State (Requirement 2)
  const [regFullName, setRegFullName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<{
    name: string;
    email: string;
    phone: string;
    status: string;
  } | null>(null);

  // Forgot Password Modal State
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<string | null>(null);

  // If already logged in, show direct portal button
  if (user) {
    const target = isPriest ? '/priest/dashboard' : '/member/dashboard';
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-stone-50">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-stone-200/90 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-900 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Already Signed In
          </h2>
          <p className="text-xs text-stone-600 font-editorial">
            You are authenticated as <strong>{user.name}</strong> ({user.role === 'PRIEST' ? 'Parish Priest' : 'Parish Member'}).
          </p>
          <div className="pt-4 space-y-2">
            <button
              onClick={() => navigate(target)}
              className="w-full py-3 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isPriest ? 'Open Priest Portal' : 'Open Member Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {isPriest && (
              <button
                onClick={() => navigate('/priest/members')}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium cursor-pointer"
              >
                View Parish Members
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(identifier, password);
      // Determine destination based on user credentials
      setTimeout(() => {
        const idLower = identifier.toLowerCase();
        if (idLower === 'admin' || idLower.includes('priest') || idLower.includes('admin')) {
          navigate('/priest/dashboard');
        } else {
          navigate('/member/dashboard');
        }
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify your Email or Member ID.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please re-enter your password.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }

    setRegSubmitting(true);

    try {
      const res = await apiRequest<{
        message: string;
        status: string;
        applicant: { name: string; email: string; phone: string; status: string };
      }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: regFullName,
          mobileNumber: regMobile,
          email: regEmail,
          password: regPassword,
          confirmPassword: regConfirmPassword,
        }),
      });

      setRegSuccess(res.applicant);
    } catch (err: any) {
      setRegError(err.message || 'Failed to submit registration request.');
    } finally {
      setRegSubmitting(false);
    }
  };

  const handleDemoClick = async (role: 'priest' | 'member1' | 'member2' | 'pending') => {
    setSubmitting(true);
    setError(null);
    try {
      await quickLoginAs(role);
      const dest = role === 'priest' ? '/priest/dashboard' : '/member/dashboard';
      navigate(dest);
    } catch (err: any) {
      setError(err.message || 'Failed demo login');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus(null);
    try {
      const res = await apiRequest<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: forgotEmail }),
      });
      setForgotStatus(res.message);
    } catch (err: any) {
      setForgotStatus(err.message || 'Error requesting password reset.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 p-1 border border-amber-900/10 flex items-center justify-center mb-3 shadow-xs">
          <img
            src={churchLogo}
            alt="St. Mariam Thresia Church Logo"
            className="w-10 h-10 object-contain"
          />
        </div>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-stone-900">
          Parish Portal
        </h2>
        <p className="mt-1 text-xs text-amber-900 font-medium uppercase tracking-wider">
          {settings?.churchName || 'St. Mariam Thresia Syro-Malabar Catholic Church'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-stone-200/90 rounded-2xl sm:px-10 space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setError(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'LOGIN'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Member Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('REGISTER');
                setRegError(null);
                setRegSuccess(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'REGISTER'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {/* TAB 1: LOGIN FORM */}
          {mode === 'LOGIN' && (
            <div className="space-y-5">
              {error && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                    error.includes('pending')
                      ? 'bg-amber-50 border border-amber-200 text-amber-900'
                      : error.includes('declined') || error.includes('rejected')
                      ? 'bg-red-50 border border-red-200 text-red-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {error.includes('pending') ? (
                    <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className="block font-semibold mb-0.5">
                      {error.includes('pending')
                        ? 'Account Pending Approval'
                        : 'Access Denied'}
                    </strong>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Login ID or Registered Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. admin, member1, member2"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-stone-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="text-[11px] text-amber-900 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="e.g. admin123 or member123"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {submitting ? 'Verifying Credentials...' : 'Sign In to Parish Portal'}
                </button>
              </form>

              <div className="text-center pt-2">
                <p className="text-xs text-stone-500 font-editorial">
                  New parishioner in Chengalpattu?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('REGISTER');
                      setError(null);
                    }}
                    className="font-semibold text-amber-900 hover:underline cursor-pointer"
                  >
                    Create a Parish Member Account
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE PARISH MEMBER ACCOUNT (Requirement 2 & 3) */}
          {mode === 'REGISTER' && (
            <div className="space-y-4">
              {regSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-emerald-950">
                    Registration Submitted Successfully!
                  </h3>
                  <p className="text-xs text-emerald-800 leading-relaxed font-editorial">
                    Thank you, <strong>{regSuccess.name}</strong>. Your account request has been forwarded to the <strong>Parish Priest</strong> for verification.
                  </p>
                  <div className="p-3 bg-white/80 rounded-lg border border-emerald-200 text-left text-[11px] space-y-1 text-stone-700">
                    <div><span className="font-semibold">Registered Email:</span> {regSuccess.email}</div>
                    <div><span className="font-semibold">Mobile Number:</span> {regSuccess.phone}</div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="font-semibold">Current Account Status:</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        PENDING APPROVAL
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-500 italic">
                    Once the Parish Priest reviews and approves your request, your account will be activated and you can sign in to complete your family register.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('LOGIN');
                      setIdentifier(regSuccess.email);
                      setRegSuccess(null);
                    }}
                    className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Proceed to Member Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                    <strong>Parish Registration Notice:</strong> New accounts are submitted to the Parish Priest with status <span className="font-bold underline">PENDING</span>. You will be able to log in after the priest reviews and approves your account.
                  </div>

                  {regError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{regError}</span>
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Joseph P.C."
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 98401 23456"
                        value={regMobile}
                        onChange={(e) => setRegMobile(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. joseph.pc@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        placeholder="At least 6 characters"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        placeholder="Re-enter password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={regSubmitting}
                    className="w-full py-2.5 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer mt-2"
                  >
                    {regSubmitting ? 'Submitting Registration...' : 'Create Parish Member Account'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Simple Login ID & Password Reference Cards (1-Click Auto-Fill & Test) */}
          <div className="pt-4 border-t border-stone-200">
            <span className="block text-[11px] uppercase tracking-wider text-stone-500 font-semibold text-center mb-2.5">
              Simple Demo Login Credentials
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
              {/* Admin */}
              <button
                type="button"
                onClick={() => {
                  setIdentifier('admin');
                  setPassword('admin123');
                  handleDemoClick('priest');
                }}
                className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-xl font-medium text-left cursor-pointer transition-all shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-amber-900">Admin</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 font-mono">1-Click</span>
                </div>
                <div className="text-[11px] text-stone-600 space-y-0.5 font-mono">
                  <div>ID: <strong className="text-stone-900">admin</strong></div>
                  <div>PW: <strong className="text-stone-900">admin123</strong></div>
                </div>
                <span className="text-[10px] text-amber-800/80 block mt-1">Parish Vicar / Admin</span>
              </button>

              {/* Demo Member 1 */}
              <button
                type="button"
                onClick={() => {
                  setIdentifier('member1');
                  setPassword('member123');
                  handleDemoClick('member1');
                }}
                className="p-3 bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-200 rounded-xl font-medium text-left cursor-pointer transition-all shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-stone-900">Member 1</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 font-mono">1-Click</span>
                </div>
                <div className="text-[11px] text-stone-600 space-y-0.5 font-mono">
                  <div>ID: <strong className="text-stone-900">member1</strong></div>
                  <div>PW: <strong className="text-stone-900">member123</strong></div>
                </div>
                <span className="text-[10px] text-stone-500 block mt-1 truncate">John Demo · Palackal</span>
              </button>

              {/* Demo Member 2 */}
              <button
                type="button"
                onClick={() => {
                  setIdentifier('member2');
                  setPassword('member123');
                  handleDemoClick('member2');
                }}
                className="p-3 bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-200 rounded-xl font-medium text-left cursor-pointer transition-all shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-stone-900">Member 2</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 font-mono">1-Click</span>
                </div>
                <div className="text-[11px] text-stone-600 space-y-0.5 font-mono">
                  <div>ID: <strong className="text-stone-900">member2</strong></div>
                  <div>PW: <strong className="text-stone-900">member123</strong></div>
                </div>
                <span className="text-[10px] text-stone-500 block mt-1 truncate">Thomas Demo · Nazareth</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Reset Portal Password
            </h3>
            <p className="text-xs text-stone-600 font-editorial">
              Enter your registered parish email address. The parish office will receive the audit request to reset your credentials.
            </p>

            {forgotStatus && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{forgotStatus}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input
                type="email"
                required
                placeholder="registered.email@church.org"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-900 hover:bg-amber-950 text-white rounded-md text-xs font-semibold cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
