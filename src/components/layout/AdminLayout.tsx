import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import {
  LayoutDashboard,
  Users,
  Home,
  Clock,
  Megaphone,
  Calendar,
  Image as ImageIcon,
  FileText,
  Bookmark,
  Scroll,
  Heart,
  CalendarCheck,
  ShieldCheck,
  Activity,
  Settings,
  Mail,
  ArrowLeft,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import churchLogo from '../../assets/church_logo.svg';

interface AdminLayoutProps {
  currentPath: string;
  navigate: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentPath, navigate, children }) => {
  const { user, logout, isSuperAdmin, isPriest, isCoordinator } = useAuth();
  const { settings } = useSettings();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Define sidebar navigation items based on role
  const isCoordinatorOnly = isCoordinator && !isSuperAdmin;

  const navSections = [
    {
      title: 'Parish Administration',
      items: [
        { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
        ...(!isCoordinatorOnly
          ? [
              { label: 'Members', path: '/admin/members', icon: Users },
              { label: 'Families', path: '/admin/families', icon: Home },
              { label: 'Holy Qurbana', path: '/admin/holy-qurbana', icon: Clock },
            ]
          : []),
        { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
        { label: 'Events', path: '/admin/events', icon: Calendar },
        ...(!isCoordinatorOnly
          ? [
              { label: 'Gallery', path: '/admin/gallery', icon: ImageIcon },
              { label: 'Documents', path: '/admin/documents', icon: FileText },
              { label: 'Organizations', path: '/admin/organizations', icon: Bookmark },
            ]
          : []),
      ],
    },
    ...(!isCoordinatorOnly
      ? [
          {
            title: 'Sacramental & Pastoral',
            items: [
              { label: 'Sacramental Records', path: '/admin/sacraments', icon: Scroll },
              { label: 'Prayer Intentions', path: '/admin/prayers', icon: Heart },
              { label: 'Appointments', path: '/admin/appointments', icon: CalendarCheck },
              { label: 'Contact Inquiries', path: '/admin/contact-messages', icon: Mail },
            ],
          },
          {
            title: 'System & Governance',
            items: [
              ...(isSuperAdmin
                ? [{ label: 'User Roles & Access', path: '/admin/users', icon: ShieldCheck }]
                : []),
              { label: 'Activity Logs', path: '/admin/activity-logs', icon: Activity },
              { label: 'Parish Settings', path: '/admin/settings', icon: Settings },
            ],
          },
        ]
      : []),
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 text-stone-400 hover:text-white rounded-lg focus:outline-none"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit to Public Website</span>
            </button>

            <span className="hidden sm:inline text-stone-700">|</span>

            <div className="hidden sm:flex items-center gap-2.5">
              <img
                src={churchLogo}
                alt="Church Logo"
                className="w-7 h-7 object-contain rounded-full bg-amber-500/10 p-0.5 border border-amber-500/20"
                width="28"
                height="28"
              />
              <div>
                <span className="font-serif font-bold text-sm text-stone-100 block leading-tight">
                  {settings?.churchName || 'St. Mariam Thresia Syro-Malabar Catholic Church'}
                </span>
                <span className="text-[10px] text-amber-400 block">
                  Parish Management Console · Diocese of Hosur
                </span>
              </div>
            </div>
          </div>

          {/* User Status / Role Pill */}
          <div className="flex items-center gap-3 text-xs">
            <div className="text-right hidden sm:block">
              <span className="font-semibold block text-stone-200">
                {user?.name}
              </span>
              <span className="text-[10px] text-amber-400 font-mono tracking-tight">
                {user?.role}
              </span>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-16 left-0 z-30 w-64 bg-stone-900 border-r border-stone-800/80 p-4 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full overflow-y-auto space-y-6 pr-1">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider px-3 block mb-2">
                  {section.title}
                </span>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavClick(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                        isActive
                          ? 'bg-amber-900 text-white font-semibold shadow-xs'
                          : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-amber-400/90" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
