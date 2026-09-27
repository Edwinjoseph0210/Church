import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ParishMembershipRegister } from '../../components/family/ParishMembershipRegister';
import { User, ShieldCheck } from 'lucide-react';

export const MemberProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Profile Banner */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-lg font-serif font-bold shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                {user?.name || 'Parish Member'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                APPROVED
              </span>
            </div>
            <p className="text-xs text-stone-600 font-editorial mt-0.5">
              Email: {user?.email} {user?.phone ? `· Mobile: ${user.phone}` : ''}
            </p>
          </div>
        </div>

        <div className="text-xs text-stone-500 font-editorial bg-stone-50 px-4 py-2 rounded-xl border border-stone-200">
          <span>Role: </span>
          <strong className="text-stone-900">Parish Member (Head of Family)</strong>
        </div>
      </div>

      {/* Primary Section: MY PROFILE / PARISH MEMBERSHIP REGISTER */}
      <ParishMembershipRegister />
    </div>
  );
};
