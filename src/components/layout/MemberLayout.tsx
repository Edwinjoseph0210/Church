import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import churchLogo from '../../assets/church_logo.svg';
import {
  LayoutDashboard,
  User,
  Users,
  Megaphone,
  Calendar,
  FileText,
  Settings,
  ArrowLeft,
  LogOut,
  Shield,
  Menu,
  X,
} from 'lucide-react';

interface MemberLayoutProps {
  currentPath: string;
  navigate: (path: string) => void;
  children: React.ReactNode;
}

export const MemberLayout: React.FC<MemberLayoutProps> = ({ currentPath, navigate, children }) => {
  const { user, logout, isStaff, isCoordinator } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { label: 'Dashboard', path: '/member/dashboard', icon: LayoutDashboard },
    { label: 'My Family / Family Register', path: '/member/family', icon: Users },
    { label: 'My Profile', path: '/member/profile', icon: User },
    { label: 'Announcements', path: '/member/announcements', icon: Megaphone },
    { label: 'Events', path: '/member/events', icon: Calendar },
    { label: 'Documents', path: '/member/documents', icon: FileText },
    { label: 'Settings', path: '/member/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-stone-100/70">
      {/* Top Banner / Member Bar */}
      <div className="bg-stone-900 text-stone-200 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span>Public Website</span>
            </button>
            <span className="text-stone-700 hidden sm:inline">|</span>
            <div className="flex items-center gap-2">
              <img
                src={churchLogo}
                alt="Church Logo"
                className="w-6 h-6 object-contain rounded-full bg-amber-500/10 p-0.5 shrink-0"
                width="24"
                height="24"
              />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-white tracking-wide truncate block">
                  Parishioner Portal
                </span>
                <span className="text-[11px] text-amber-400 font-mono block">
                  {user?.memberId ? `ID: ${user.memberId}` : user?.email}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            {isStaff && (
              <button
                onClick={() => navigate('/priest/dashboard')}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-900/80 hover:bg-amber-800 text-amber-100 rounded-md font-medium transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Priest Portal</span>
              </button>
            )}

            <span className="text-stone-300 font-medium hidden sm:inline truncate max-w-[140px]">
              {user?.name}
            </span>

            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-red-400 rounded-md transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Log Out</span>
            </button>

            {/* Mobile menu toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-white cursor-pointer ml-1"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 px-4 py-3 shadow-md animate-fadeIn">
          <div className="text-[10px] uppercase font-bold text-amber-900 tracking-wider mb-2">
            Member Navigation
          </div>
          <nav className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition-colors text-left cursor-pointer ${
                    isActive
                      ? 'bg-amber-900 text-white font-semibold shadow-xs'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium text-red-700 hover:bg-red-50 text-left cursor-pointer mt-1"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Log Out</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main Container with Sidebar + Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Sidebar Navigation */}
          <aside className="hidden lg:block w-64 bg-white rounded-2xl border border-stone-200/90 p-3 shadow-xs shrink-0">
            <div className="p-3 mb-2 border-b border-stone-100">
              <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider">
                Member Services
              </span>
              <p className="text-xs font-serif font-bold text-stone-900 truncate">
                {user?.name}
              </p>
            </div>

            <nav className="space-y-1 text-xs">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = currentPath === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition-colors text-left cursor-pointer ${
                      isActive
                        ? 'bg-amber-900 text-white font-semibold shadow-xs'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                  </button>
                );
              })}

              <div className="pt-2 border-t border-stone-100 mt-2">
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium text-stone-500 hover:bg-red-50 hover:text-red-700 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Log Out</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* Dynamic Page Content */}
          <main className="flex-1 w-full min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
