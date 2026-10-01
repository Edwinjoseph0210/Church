import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { apiRequest } from '../../services/api';
import {
  LayoutDashboard,
  Users,
  LogOut,
  Church,
  Bell,
  Search,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Clock,
  FileText,
  Megaphone,
  Calendar,
  Settings as SettingsIcon,
} from 'lucide-react';
import churchLogo from '../../assets/church_logo.svg';

interface PriestLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  navigate: (path: string) => void;
}

export const PriestLayout: React.FC<PriestLayoutProps> = ({
  children,
  currentPath,
  navigate,
}) => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await apiRequest<{ pendingRegistrationsCount: number }>('/priest/dashboard-summary');
        setPendingCount(data.pendingRegistrationsCount || 0);
      } catch (err) {
        // silent catch
      }
    }
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const links = [
    {
      label: 'Priest Dashboard',
      path: '/priest/dashboard',
      icon: LayoutDashboard,
      badge: pendingCount > 0 ? `${pendingCount} Pending` : undefined,
    },
    {
      label: 'Parish Members',
      path: '/priest/members',
      icon: Users,
    },
    {
      label: 'Announcements',
      path: '/admin/announcements',
      icon: Megaphone,
    },
    {
      label: 'Events & Programs',
      path: '/admin/events',
      icon: Calendar,
    },
    {
      label: 'Holy Qurbana Timings',
      path: '/admin/holy-qurbana',
      icon: Clock,
    },
    {
      label: 'Parish Documents',
      path: '/admin/documents',
      icon: FileText,
    },
    {
      label: 'Parish Settings',
      path: '/admin/settings',
      icon: SettingsIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <img src={churchLogo} alt="Logo" className="w-7 h-7 object-contain" />
          <div>
            <h1 className="font-serif text-sm font-bold text-stone-900 leading-tight">
              Priest Portal
            </h1>
            <p className="text-[10px] text-amber-900 font-medium">
              St. Mariam Thresia Church
            </p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Drawer */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:block md:w-64 bg-white border-r border-stone-200/90 shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto z-30`}
      >
        <div className="p-5 flex flex-col h-full justify-between">
          <div className="space-y-6">
            {/* Church & Priest Identity */}
            <div className="flex items-center gap-3 pb-5 border-b border-stone-200">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-900/10 flex items-center justify-center p-1 shrink-0">
                <img src={churchLogo} alt="Logo" className="w-8 h-8 object-contain" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 block">
                  Parish Administrator
                </span>
                <h2 className="font-serif text-sm font-bold text-stone-900 truncate">
                  {user?.name || 'Fr. Joshy N George'}
                </h2>
                <div className="flex flex-col text-[11px] text-stone-500 font-editorial">
                  <span>Diocese of Hosur</span>
                  <a
                    href="tel:+919742162172"
                    className="text-amber-800 hover:text-amber-950 font-sans text-[10px] font-semibold hover:underline"
                  >
                    +91 97421 62172
                  </a>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {links.map((link) => {
                const isActive = currentPath === link.path || (link.path === '/priest/members' && currentPath.startsWith('/priest/members'));
                const Icon = link.icon;
                return (
                  <button
                    key={link.path}
                    onClick={() => {
                      navigate(link.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-amber-900 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-950 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Public Website Quick Link */}
            <div className="pt-2 border-t border-stone-200">
              <button
                onClick={() => {
                  navigate('/');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-stone-600 hover:text-amber-900 hover:bg-stone-50 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Return to Website</span>
              </button>
            </div>
          </div>

          {/* Bottom Priest Sign Out */}
          <div className="pt-4 border-t border-stone-200 mt-6">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Portal</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};
