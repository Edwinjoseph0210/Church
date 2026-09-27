import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DemoSwitcher } from './components/ui/DemoSwitcher';
import { MemberLayout } from './components/layout/MemberLayout';
import { PriestLayout } from './components/layout/PriestLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { HolyQurbanaPage } from './pages/public/HolyQurbanaPage';
import { AnnouncementsPage } from './pages/public/AnnouncementsPage';
import { EventsPage } from './pages/public/EventsPage';
import { GalleryPage } from './pages/public/GalleryPage';
import { OrganizationsPage } from './pages/public/OrganizationsPage';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/public/LoginPage';

// Member Pages
import { MemberDashboardPage } from './pages/member/MemberDashboardPage';
import { MemberProfilePage } from './pages/member/MemberProfilePage';
import { MemberFamilyPage } from './pages/member/MemberFamilyPage';
import { MemberAnnouncementsPage } from './pages/member/MemberAnnouncementsPage';
import { MemberEventsPage } from './pages/member/MemberEventsPage';
import { MemberDocumentsPage } from './pages/member/MemberDocumentsPage';
import { MemberSettingsPage } from './pages/member/MemberSettingsPage';

// Priest Pages (Requirement 13, 14, 15)
import { PriestDashboardPage } from './pages/priest/PriestDashboardPage';
import { PriestMembersPage } from './pages/priest/PriestMembersPage';
import { PriestFamilyViewPage } from './pages/priest/PriestFamilyViewPage';

import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

function AppContent() {
  const { user, isPriest, isStaff, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-sm font-bold text-stone-900">
            St. Mariam Thresia Church
          </p>
          <p className="text-xs text-stone-500 font-editorial">
            Loading parish records...
          </p>
        </div>
      </div>
    );
  }

  // 1. PRIEST PORTAL ROUTING (Requirement 13, 14, 15)
  // Also intercepts legacy /admin routes to guide directly to Priest portal
  if (currentPath.startsWith('/priest') || currentPath.startsWith('/admin')) {
    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-stone-200 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-900 flex items-center justify-center">
              <LogIn className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Priest Sign In Required
            </h2>
            <p className="text-xs text-stone-600 font-editorial">
              Please sign in with authorized Parish Priest credentials to access member approvals, family registers, and census archives.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 bg-amber-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Go to Login Page
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full py-2.5 bg-stone-100 text-stone-700 rounded-lg text-xs font-medium cursor-pointer"
              >
                Return to Public Website
              </button>
            </div>
          </div>
          <DemoSwitcher navigate={navigate} />
        </div>
      );
    }

    // Role verification: strictly PRIEST
    if (!isPriest && !isStaff) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-red-200 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-100 text-red-800 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              403 Forbidden Access
            </h2>
            <p className="text-xs text-stone-600 font-editorial">
              Your account <strong>{user.name}</strong> holds the role of <strong>Parish Member</strong>, which does not have permission to access the Priest administrative portal.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => navigate('/member/dashboard')}
                className="w-full py-2.5 bg-stone-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Open Member Portal
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full py-2.5 bg-stone-100 text-stone-700 rounded-lg text-xs font-medium cursor-pointer"
              >
                Return to Public Website
              </button>
            </div>
          </div>
          <DemoSwitcher navigate={navigate} />
        </div>
      );
    }

    // Priest Family View: /priest/members/:memberId
    if (currentPath.startsWith('/priest/members/') && currentPath.length > '/priest/members/'.length) {
      const memberId = currentPath.replace('/priest/members/', '');
      return (
        <PriestLayout currentPath={currentPath} navigate={navigate}>
          <PriestFamilyViewPage memberId={memberId} navigate={navigate} />
          <DemoSwitcher navigate={navigate} />
        </PriestLayout>
      );
    }

    // Priest Member List: /priest/members or legacy /admin/members or /admin/families
    if (currentPath === '/priest/members' || currentPath === '/admin/members' || currentPath === '/admin/families') {
      return (
        <PriestLayout currentPath="/priest/members" navigate={navigate}>
          <PriestMembersPage navigate={navigate} />
          <DemoSwitcher navigate={navigate} />
        </PriestLayout>
      );
    }

    // Default Priest Dashboard: /priest/dashboard or /admin/*
    return (
      <PriestLayout currentPath="/priest/dashboard" navigate={navigate}>
        <PriestDashboardPage navigate={navigate} />
        <DemoSwitcher navigate={navigate} />
      </PriestLayout>
    );
  }

  // 2. MEMBER PORTAL ROUTING
  if (currentPath.startsWith('/member')) {
    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-stone-200 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-900 flex items-center justify-center">
              <LogIn className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Member Sign In Required
            </h2>
            <p className="text-xs text-stone-600 font-editorial">
              Please sign in with your parish member credentials to access your Parish Membership Register, family records, announcements, and parish documents.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 bg-amber-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Go to Member Login
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full py-2.5 bg-stone-100 text-stone-700 rounded-lg text-xs font-medium cursor-pointer"
              >
                Return to Public Website
              </button>
            </div>
          </div>
          <DemoSwitcher navigate={navigate} />
        </div>
      );
    }

    return (
      <MemberLayout currentPath={currentPath} navigate={navigate}>
        {currentPath === '/member/dashboard' && <MemberDashboardPage navigate={navigate} />}
        {currentPath === '/member/profile' && <MemberProfilePage />}
        {currentPath === '/member/family' && <MemberFamilyPage />}
        {currentPath === '/member/announcements' && <MemberAnnouncementsPage />}
        {currentPath === '/member/events' && <MemberEventsPage />}
        {currentPath === '/member/documents' && <MemberDocumentsPage />}
        {currentPath === '/member/settings' && <MemberSettingsPage />}
        {/* Graceful fallback for any other member routes */}
        {(currentPath === '/member/prayers' || currentPath === '/member/appointments' || currentPath === '/member/notifications') && (
          <MemberDashboardPage navigate={navigate} />
        )}
        <DemoSwitcher navigate={navigate} />
      </MemberLayout>
    );
  }

  // 3. PUBLIC WEBSITE ROUTING
  const renderPublicPage = () => {
    if (currentPath === '/about') {
      return <AboutPage navigate={navigate} />;
    }
    if (currentPath === '/holy-qurbana') {
      return <HolyQurbanaPage navigate={navigate} />;
    }
    if (currentPath.startsWith('/announcements')) {
      const parts = currentPath.split('/');
      const selectedId = parts.length > 2 && parts[2] ? parts[2] : undefined;
      return <AnnouncementsPage navigate={navigate} selectedId={selectedId} />;
    }
    if (currentPath.startsWith('/events')) {
      const parts = currentPath.split('/');
      const selectedId = parts.length > 2 && parts[2] ? parts[2] : undefined;
      return <EventsPage navigate={navigate} selectedId={selectedId} />;
    }
    if (currentPath.startsWith('/gallery')) {
      const parts = currentPath.split('/');
      const selectedId = parts.length > 2 && parts[2] ? parts[2] : undefined;
      return <GalleryPage navigate={navigate} selectedId={selectedId} />;
    }
    if (currentPath.startsWith('/organizations')) {
      const parts = currentPath.split('/');
      const selectedId = parts.length > 2 && parts[2] ? parts[2] : undefined;
      return <OrganizationsPage navigate={navigate} selectedId={selectedId} />;
    }
    if (currentPath === '/contact') {
      return <ContactPage navigate={navigate} />;
    }
    if (currentPath === '/login') {
      return <LoginPage navigate={navigate} initialMode="LOGIN" />;
    }
    if (currentPath === '/register') {
      return <LoginPage navigate={navigate} initialMode="REGISTER" />;
    }
    return <HomePage navigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar currentPath={currentPath} navigate={navigate} />
      <main className="flex-1">
        {renderPublicPage()}
      </main>
      <Footer navigate={navigate} />
      <DemoSwitcher navigate={navigate} />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
