import React, { useState, useEffect } from 'react';
import { CinemaProvider, useCinema } from './context/CinemaContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { QuickActionModals } from './components/modals/QuickActionModals';
import { ToastContainer } from './components/ui/Toast';
import { ConfirmDialog } from './components/ui/ConfirmDialog';

// Core views
import { LoginView } from './components/auth/LoginView';
import { HomeView } from './components/home/HomeView';
import { DashboardView } from './components/dashboard/DashboardView';
import { ScheduleView } from './components/schedule/ScheduleView';
import { EmployeeView } from './components/employees/EmployeeView';
import { InventoryView } from './components/inventory/InventoryView';
import { UtilityView } from './components/utility/UtilityView';
import { CleaningView } from './components/cleaning/CleaningView';
import { RequestsHubView } from './components/requests/RequestsHubView';
import { ReportsView } from './components/reports/ReportsView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { ActivityLogView } from './components/logs/ActivityLogView';
import { SettingsView } from './components/settings/SettingsView';
import { GoogleDriveView } from './components/drive/GoogleDriveView';
import { BirthdayModal } from './components/home/BirthdayModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const MainContent: React.FC = () => {
  const { currentTab, isLoggedIn } = useCinema();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Viewport stabilization when mobile virtual keyboard opens/closes
  useEffect(() => {
    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        setTimeout(() => {
          window.scrollTo({ top: window.scrollY, left: 0, behavior: 'smooth' });
        }, 120);
      }
    };

    window.addEventListener('focusout', handleFocusOut);
    return () => window.removeEventListener('focusout', handleFocusOut);
  }, []);

  // If user is not logged in, show the login screen before entering dashboard
  if (!isLoggedIn) {
    return (
      <div id="cinema-login-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <LoginView />
        <ToastContainer />
      </div>
    );
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case 'home':
        return <HomeView />;
      case 'dashboard':
        return <DashboardView />;
      case 'schedule':
        return <ScheduleView />;
      case 'employees':
        return <EmployeeView />;
      case 'inventory':
        return <InventoryView />;
      case 'utility':
        return <UtilityView />;
      case 'cleaning':
        return <CleaningView />;
      case 'requests':
      case 'off-day':
      case 'leave':
      case 'sick-leave':
        return <RequestsHubView />;
      case 'reports':
        return <ReportsView />;
      case 'drive':
        return <GoogleDriveView />;
      case 'notifications':
        return <NotificationsView />;
      case 'activity-log':
        return <ActivityLogView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div id="cinema-app-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Sidebar for Desktop & Mobile drawer */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 transition-all duration-300 pb-20 lg:pb-8">
        {/* Top Navbar */}
        <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)} />

        {/* Dynamic View Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {renderTabContent()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />

      {/* Centralized Quick Action Modals */}
      <QuickActionModals />

      {/* Birthday Recognition Modal (3-second auto-close greeting) */}
      <BirthdayModal />

      {/* Toasts and Confirm Modals */}
      <ToastContainer />
      <ConfirmDialog />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <CinemaProvider>
        <MainContent />
      </CinemaProvider>
    </ErrorBoundary>
  );
}
