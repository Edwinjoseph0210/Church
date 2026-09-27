import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ChevronDown, Check, UserCircle } from 'lucide-react';

interface DemoSwitcherProps {
  navigate: (path: string) => void;
}

export const DemoSwitcher: React.FC<DemoSwitcherProps> = ({ navigate }) => {
  const { user, quickLoginAs, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const roles = [
    {
      key: 'priest' as const,
      role: 'PRIEST',
      name: 'Fr. Joshy N George',
      email: 'priest@church.org',
      note: 'Parish Priest · +91 97421 62172',
      target: '/priest/dashboard',
    },
    {
      key: 'member1' as const,
      role: 'MEMBER',
      name: 'John Demo (Head of Family)',
      email: 'demo.member@church.org',
      note: 'Parish Member · Palackal Family',
      target: '/member/dashboard',
    },
    {
      key: 'member2' as const,
      role: 'MEMBER',
      name: 'Thomas Demo (Head of Family)',
      email: 'other.member@church.org',
      note: 'Parish Member · Nazareth Villa',
      target: '/member/dashboard',
    },
    {
      key: 'pending' as const,
      role: 'MEMBER (PENDING)',
      name: 'Joseph P.C. (New Applicant)',
      email: 'joseph.pc@example.com',
      note: 'Tests pending approval login guard',
      target: '/login',
    },
  ];

  const handleSwitch = async (roleItem: (typeof roles)[0]) => {
    setSwitching(true);
    try {
      await quickLoginAs(roleItem.key);
      navigate(roleItem.target);
      setOpen(false);
    } catch (err) {
      console.error('Failed to switch demo account:', err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="bg-stone-900 text-stone-100 rounded-xl shadow-2xl border border-stone-700 w-80 p-4 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Demo Role Switcher
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-stone-400 hover:text-white text-xs px-2 py-1 rounded bg-stone-800"
            >
              Close
            </button>
          </div>

          <p className="text-[11px] text-stone-400 py-2">
            Switch instantaneously between roles to test RBAC and privacy boundaries:
          </p>

          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {roles.map((r) => {
              const isCurrent = user?.email.toLowerCase() === r.email.toLowerCase();
              return (
                <button
                  key={r.key}
                  disabled={switching}
                  onClick={() => handleSwitch(r)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start justify-between cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-950/80 border border-amber-700/60 text-white'
                      : 'bg-stone-800/80 hover:bg-stone-800 border border-stone-700/50 text-stone-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-semibold text-stone-100">
                      <span>{r.name}</span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <div className="text-[10px] text-amber-400 font-mono tracking-tight">
                      {r.role}
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {r.note}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {user && (
            <div className="pt-3 mt-2 border-t border-stone-800 flex justify-end">
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                  setOpen(false);
                }}
                className="text-[11px] text-red-400 hover:text-red-300 transition-colors"
              >
                Log Out to Guest Mode
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-stone-900/95 hover:bg-black text-amber-300 hover:text-amber-200 border border-amber-600/40 px-3.5 py-2 rounded-full shadow-lg text-xs font-semibold backdrop-blur-md transition-all cursor-pointer"
        >
          <UserCircle className="w-4 h-4 text-amber-400" />
          <span>Demo Role: {user ? user.role : 'Guest'}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>
      )}
    </div>
  );
};
