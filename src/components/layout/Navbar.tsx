import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Menu, X, LogIn, LayoutDashboard, Shield, LogOut, Phone } from 'lucide-react';
import churchLogo from '../../assets/church_logo.svg';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, logout, isPriest, isStaff, isCoordinator } = useAuth();
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const churchPhone = settings?.phone || '+91 97421 62172';

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Holy Qurbana', path: '/holy-qurbana' },
    { label: 'Announcements', path: '/announcements' },
    { label: 'Events', path: '/events' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          {/* Zone 1: Small Logo + Church Name Wordmark with Balanced Spacing */}
          <div className="flex items-center min-w-0">
            <button
              onClick={() => handleNavClick('/')}
              className="flex items-center gap-2.5 sm:gap-3 text-left group cursor-pointer focus:outline-none min-w-0"
              aria-label="St. Mariam Thresia Syro-Malabar Catholic Church"
            >
              {/* Small Church Logo: noticeable on desktop, compact on mobile, aspect ratio preserved */}
              <div className="shrink-0 flex items-center justify-center p-0.5 rounded-full bg-amber-50/50 border border-amber-900/10 group-hover:border-amber-900/30 transition-colors">
                <img
                  src={churchLogo}
                  alt="St. Mariam Thresia Church Logo"
                  className="w-7 h-7 sm:w-9 sm:h-9 object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
                  width="36"
                  height="36"
                />
              </div>

              {/* Church Name & Tradition: Desktop shows full name, Mobile shows clean compact name */}
              <div className="min-w-0 flex flex-col justify-center">
                <span className="hidden md:inline font-serif text-base lg:text-lg font-bold tracking-tight text-stone-900 group-hover:text-amber-900 transition-colors leading-tight truncate lg:whitespace-normal">
                  St. Mariam Thresia Syro-Malabar Catholic Church
                </span>
                <span className="inline md:hidden font-serif text-sm sm:text-base font-bold tracking-tight text-stone-900 group-hover:text-amber-900 transition-colors leading-tight truncate">
                  St. Mariam Thresia Church
                </span>
                <span className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-amber-900/80 font-medium truncate">
                  Chengalpattu · Diocese of Hosur
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Clean text navigation links with generous breathing room */}
          <nav className="hidden xl:flex items-center gap-6 text-[13px] font-medium tracking-wide text-stone-700 shrink-0">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`transition-colors py-1 relative hover:text-stone-950 cursor-pointer ${
                    isActive ? 'text-amber-900 font-semibold' : 'text-stone-600'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-800 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action Buttons & Call Church */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            <a
              href={`tel:${churchPhone.replace(/\s+/g, '')}`}
              className="hidden 2xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-amber-900 hover:bg-stone-100 rounded-lg transition-colors"
              title="Call Parish Office"
            >
              <Phone className="w-3.5 h-3.5 text-amber-800" />
              <span>{churchPhone}</span>
            </a>

            {user ? (
              <div className="flex items-center gap-2.5">
                {isPriest || isStaff ? (
                  <button
                    onClick={() => handleNavClick('/priest/dashboard')}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-900 hover:bg-amber-950 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Priest Portal</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavClick('/member/dashboard')}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Member Portal</span>
                  </button>
                )}

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 text-stone-500 hover:text-red-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('/login')}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-900 bg-amber-100/70 hover:bg-amber-200/80 border border-amber-300/60 rounded-lg transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-900" />
                  <span>Member Login</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right Section: Quick Call & Hamburger Menu Toggle */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <a
              href={`tel:${churchPhone.replace(/\s+/g, '')}`}
              className="p-2 text-amber-900 hover:bg-amber-50 rounded-lg transition-colors"
              aria-label="Call Church"
              title="Call Church"
            >
              <Phone className="w-5 h-5" />
            </a>

            {user && (
              <button
                onClick={() => handleNavClick(isPriest || isStaff ? '/priest/dashboard' : '/member/dashboard')}
                className="p-2 text-amber-900 hover:bg-amber-50 rounded-md"
                aria-label="Portal Dashboard"
              >
                <LayoutDashboard className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-1 shadow-lg animate-in fade-in duration-200">
          {/* Mobile Quick Church Phone Section */}
          <div className="mb-3 pb-3 border-b border-stone-100 flex items-center justify-between">
            <div className="text-xs">
              <span className="block font-semibold text-stone-900">Diocese of Hosur</span>
              <span className="text-[11px] text-stone-500">Chengalpattu, Tamil Nadu</span>
            </div>
            <a
              href={`tel:${churchPhone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-900 hover:bg-amber-950 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Church</span>
            </a>
          </div>

          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => handleNavClick(link.path)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentPath === link.path
                  ? 'bg-amber-50 text-amber-900 font-semibold'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              {link.label}
            </button>
          ))}

          <div className="pt-4 border-t border-stone-100 flex flex-col gap-2">
            {user ? (
              <>
                <button
                  onClick={() => handleNavClick(isStaff ? '/admin/dashboard' : '/member/dashboard')}
                  className="w-full text-center px-4 py-2.5 text-xs font-semibold text-white bg-amber-900 rounded-lg"
                >
                  {isStaff ? 'Open Admin Console' : 'Open Member Portal'}
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center px-4 py-2 text-xs font-medium text-stone-600 hover:text-red-700"
                >
                  Sign Out ({user.name})
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavClick('/login')}
                className="w-full text-center px-4 py-2.5 text-xs font-semibold text-stone-900 bg-amber-100 rounded-lg border border-amber-300/80"
              >
                Parish Member & Admin Login
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
