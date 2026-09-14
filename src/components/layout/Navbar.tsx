import React, { useState, useRef, useEffect } from 'react';
import { useCinema } from '../../context/CinemaContext';
import {
  Bell,
  CheckCheck,
  Menu,
  X,
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const {
    currentUser,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setCurrentTab,
  } = useCinema();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);

  // Close notifications on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (linkTab?: string, id?: string) => {
    if (id) markNotificationAsRead(id);
    if (linkTab) setCurrentTab(linkTab);
    setIsNotifOpen(false);
  };

  return (
    <header
      id="main-navbar-header"
      className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-black/20"
    >
      {/* Single Unified Clean Header Bar */}
      <div className="h-16 flex items-center justify-between px-3 sm:px-6 gap-2 sm:gap-4 max-w-full">
        {/* Left: Mobile Toggle & Brand Details */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
          <button
            id="btn-mobile-menu-toggle"
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Buka Menu Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            id="navbar-brand-logo-button"
            onClick={() => setCurrentTab('home')}
            className="flex items-center cursor-pointer group"
            title="Kembali ke Home"
          >
            <div className="min-w-0 flex flex-col justify-center">
              <h1 className="font-bold text-xs sm:text-sm text-slate-100 tracking-tight leading-tight truncate group-hover:text-amber-300 transition-colors">
                Cinema Management System
              </h1>
              <p className="text-[9px] sm:text-[10px] font-bold text-amber-400 tracking-wider uppercase leading-none mt-0.5 truncate">
                LIPPO PLAZA SIDOARJO
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Notifications, Profile, Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              id="btn-navbar-notifications"
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Pemberitahuan"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Notification Popup Menu (Mobile Full Screen friendly) */}
            {isNotifOpen && (
              <>
                {/* Mobile Backdrop */}
                <div
                  className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 sm:hidden"
                  onClick={() => setIsNotifOpen(false)}
                />

                <div
                  id="navbar-notification-popover"
                  className="fixed inset-0 z-50 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 w-full sm:w-96 h-[100dvh] sm:h-auto sm:max-h-[32rem] bg-slate-900 border-0 sm:border sm:border-slate-700 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                >
                  <div className="p-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-100 uppercase tracking-wider block">
                          Notifikasi
                        </span>
                        {unreadNotificationCount > 0 ? (
                          <span className="text-[10px] text-amber-400 font-semibold block">
                            {unreadNotificationCount} Baru
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 block">Semua Dibaca</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {unreadNotificationCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllNotificationsAsRead}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-750 text-[11px] text-amber-400 rounded-lg border border-slate-700 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer transition-colors"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Tandai Dibaca</span>
                        </button>
                      )}

                      {/* Close button */}
                      <button
                        type="button"
                        onClick={() => setIsNotifOpen(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                        aria-label="Tutup Notifikasi"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-800/60 p-2 sm:p-0">
                    {notifications.length === 0 ? (
                      <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center">
                        <Bell className="w-8 h-8 text-slate-600 mb-2" />
                        <p className="font-semibold">Tidak ada notifikasi saat ini</p>
                        <p className="text-[11px] text-slate-500 mt-1">Operasional bioskop berjalan aman</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n.linkTab, n.id)}
                          className={`p-3.5 hover:bg-slate-800/60 cursor-pointer transition-colors rounded-xl sm:rounded-none mb-1 sm:mb-0 ${
                            !n.isRead ? 'bg-amber-500/10 border-l-2 border-amber-400' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-xs font-semibold ${!n.isRead ? 'text-amber-200' : 'text-slate-300'}`}>
                              {n.title}
                            </p>
                            <span className="text-[10px] text-slate-400 shrink-0 font-mono">{n.created_at}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-snug break-words">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Mobile Footer */}
                  <div className="p-3 bg-slate-850 border-t border-slate-800 sm:hidden shrink-0 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNotifOpen(false);
                        setCurrentTab('notifications');
                      }}
                      className="text-xs text-amber-400 font-semibold"
                    >
                      Buka Halaman Lengkap →
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsNotifOpen(false)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile Button (Single Source of Truth, links to settings) */}
          <div
            id="navbar-user-profile-button"
            onClick={() => setCurrentTab('settings')}
            className="flex items-center gap-2 sm:gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-full hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 transition-all cursor-pointer group shrink-0"
            title="Profil Pengguna & Pengaturan"
          >
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-700 ring-2 ring-slate-750 group-hover:ring-amber-400 transition-all shadow-sm"
                referrerPolicy="no-referrer"
              />
              <span
                className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"
                title="Status Online"
              />
            </div>
            <div className="text-left hidden lg:block max-w-[120px]">
              <p className="text-xs font-semibold text-slate-200 leading-tight group-hover:text-amber-300 transition-colors truncate">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-amber-400 font-medium leading-tight truncate">
                {currentUser.role === 'ADMIN'
                  ? 'Cinema Manager'
                  : currentUser.role === 'SUPERVISOR'
                  ? 'Supervisor'
                  : 'Cinema Crew'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
