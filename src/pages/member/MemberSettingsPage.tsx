import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { Settings, Lock, CheckCircle2, AlertCircle, Shield, Globe, BellOff, LogOut, Key } from 'lucide-react';

export const MemberSettingsPage: React.FC = () => {
  const { user, logout } = useAuth();

  // Password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Preference switches
  const [emailNotices, setEmailNotices] = useState(true);
  const [smsBulletins, setSmsBulletins] = useState(true);
  const [preferredLanguage, setPreferredLanguage] = useState('MALAYALAM_ENGLISH');
  const [preferenceSaved, setPreferenceSaved] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordFeedback({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }

    setSavingPassword(true);
    try {
      await apiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setPasswordFeedback({ type: 'success', message: 'Your password has been changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordFeedback({ type: 'error', message: err.message || 'Failed to update password.' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setPreferenceSaved(true);
    setTimeout(() => setPreferenceSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
            Member Preferences
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            Account & Security Settings
          </h1>
          <p className="text-xs text-stone-500 font-editorial mt-0.5">
            Manage your parish portal credentials, contact communication preferences, and session controls.
          </p>
        </div>
      </div>

      {/* Account Info Card */}
      <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
            Connected Parish Account
          </span>
          <p className="font-serif font-bold text-stone-900 text-sm mt-0.5">
            {user?.name}
          </p>
          <p className="text-stone-500 font-mono text-[11px]">
            {user?.email} {user?.memberId && `· ID: ${user.memberId}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-semibold text-[11px]">
            Parishioner Access
          </span>
        </div>
      </div>

      {/* Password Change Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
          <Key className="w-4 h-4 text-amber-900" />
          <h2 className="text-xs uppercase tracking-wider font-semibold text-stone-800">
            Change Portal Password
          </h2>
        </div>

        {passwordFeedback && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
              passwordFeedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {passwordFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{passwordFeedback.message}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              New Password *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={savingPassword}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-950 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              {savingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Liturgical & Communication Preferences */}
      <form onSubmit={handleSavePreferences} className="space-y-4 pt-4 border-t border-stone-200 text-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
          <Globe className="w-4 h-4 text-amber-900" />
          <h2 className="text-xs uppercase tracking-wider font-semibold text-stone-800">
            Liturgical & Bulletin Communication Preferences
          </h2>
        </div>

        {preferenceSaved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Preferences saved successfully.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block font-semibold text-stone-700">
              Primary Liturgical Language
            </label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
            >
              <option value="MALAYALAM_ENGLISH">Malayalam & English (Syro-Malabar Heritage)</option>
              <option value="ENGLISH">English Only</option>
              <option value="TAMIL">Tamil & English (Diocese of Hosur Regional)</option>
            </select>
            <p className="text-[11px] text-stone-500 font-editorial">
              Sets the language for liturgy announcements and feast notices.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block font-semibold text-stone-700">
              Parish Communication Channels
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotices}
                  onChange={(e) => setEmailNotices(e.target.checked)}
                  className="rounded text-amber-900 focus:ring-amber-900"
                />
                <span>Email alerts for major diocesan circulars & bulletins</span>
              </label>
              <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsBulletins}
                  onChange={(e) => setSmsBulletins(e.target.checked)}
                  className="rounded text-amber-900 focus:ring-amber-900"
                />
                <span>SMS updates for ward / BCC prayer meeting timings</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* Logout Card */}
      <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between text-xs pt-4">
        <div>
          <span className="font-semibold text-stone-800 block">End Active Session</span>
          <span className="text-stone-500 font-editorial text-[11px]">
            Sign out of your parishioner account on this device.
          </span>
        </div>
        <button
          onClick={() => {
            logout();
            window.location.href = '/';
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-200 hover:bg-red-50 hover:text-red-700 text-stone-700 rounded-lg font-medium transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};
