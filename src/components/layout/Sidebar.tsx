import React from 'react';
import { useCinema } from '../../context/CinemaContext';
import {
  CalendarDays,
  Users,
  Package,
  Zap,
  Sparkles,
  CalendarOff,
  CalendarCheck2,
  Stethoscope,
  BarChart3,
  Bell,
  History,
  Settings,
  X,
  ChevronRight,
  HardDrive,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const {
    currentTab,
    setCurrentTab,
    currentUser,
    inventory,
    offDayRequests,
    leaveRequests,
    sickLeaveRequests,
    unreadNotificationCount,
    logout,
  } = useCinema();

  const isManager = currentUser.role === 'ADMIN';
  const isSupervisor = currentUser.role === 'SUPERVISOR';
  const isCrew = currentUser.role === 'CREW';

  // Calculate alerts & badges
  const lowStockCount = inventory.filter((i) => i.status === 'LOW_STOCK' || i.status === 'OUT_OF_STOCK').length;
  const pendingOffDay = offDayRequests.filter((r) => r.status === 'PENDING').length;
  const pendingLeave = leaveRequests.filter((r) => r.status === 'PENDING').length;
  const pendingSick = sickLeaveRequests.filter((r) => r.status === 'PENDING').length;
  const totalPendingRequests = pendingOffDay + pendingLeave + pendingSick;

  // Define navigation items with permissions
  // Note: Home and Dashboard are intentionally hidden from visible sidebar navigation per Requirement #6,
  // but remain fully available in system routes, landing page, and brand navigation.
  const menuItems = [
    {
      id: 'schedule',
      label: 'Schedule Kerja',
      icon: CalendarDays,
      allowedRoles: ['ADMIN', 'SUPERVISOR', 'CREW'],
    },
    {
      id: 'employees',
      label: 'Employee Management',
      icon: Users,
      allowedRoles: ['ADMIN'], // Only Cinema Manager can access master employee data
      badge: null,
    },
    {
      id: 'inventory',
      label: 'Inventory & Stock',
      icon: Package,
      allowedRoles: ['ADMIN', 'SUPERVISOR', 'CREW'],
      badge: lowStockCount > 0 ? `${lowStockCount}` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'utility',
      label: 'Utility Monitoring',
      icon: Zap,
      allowedRoles: ['ADMIN', 'SUPERVISOR', 'CREW'],
    },
    {
      id: 'cleaning',
      label: 'Daily Cleaning',
      icon: Sparkles,
      allowedRoles: ['ADMIN', 'SUPERVISOR', 'CREW'],
    },
    {
      id: 'requests',
      label: 'Izin & Cuti Karyawan',
      icon: CalendarCheck2,
      allowedRoles: ['ADMIN', 'SUPERVISOR', 'CREW'],
      badge: isManager || isSupervisor ? (totalPendingRequests > 0 ? `${totalPendingRequests}` : null) : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'reports',
      label: 'Reports & Export',
      icon: BarChart3,
      allowedRoles: ['ADMIN', 'SUPERVISOR'],
    },
    {
      id: 'drive',
      label: 'Google Drive Sync',
      icon: HardDrive,
      allowedRoles: ['ADMIN', 'SUPERVISOR', 'CREW'],
      badge: 'Cloud',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      allowedRoles: ['ADMIN', 'SUPERVISOR', 'CREW'],
      badge: unreadNotificationCount > 0 ? `${unreadNotificationCount}` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'activity-log',
      label: 'Activity Log (Audit)',
      icon: History,
      allowedRoles: ['ADMIN', 'SUPERVISOR'],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      allowedRoles: ['ADMIN', 'SUPERVISOR', 'CREW'],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.allowedRoles.includes(currentUser.role)
  );

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 overflow-hidden scrollbar-none no-scrollbar ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header in Sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 lg:hidden">
          <span className="font-bold text-sm text-slate-100">Navigasi Utama</span>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1 scrollbar-none no-scrollbar">
          <div className="px-3 pb-1">
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              {isCrew ? 'Menu Operasional Crew' : 'Menu Utama'}
            </span>
          </div>

          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.id === 'requests'
                ? ['requests', 'off-day', 'leave', 'sick-leave'].includes(currentTab)
                : currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full border ${
                      isActive ? 'bg-slate-950 text-amber-400 border-slate-950' : item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Card Pill with Profile Photo (After navigation options) */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-850/40">
          <div
            onClick={() => handleNavClick('settings')}
            className="flex items-center gap-3 cursor-pointer group"
            title="Klik untuk membuka Pengaturan Profil"
          >
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-700 ring-2 ring-slate-800 group-hover:ring-amber-400/80 transition-all"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-200 truncate group-hover:text-amber-300 transition-colors">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-amber-400/90 truncate font-medium">{currentUser.position}</p>
              <span className="inline-block text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded mt-0.5 border border-slate-700">
                {currentUser.employeeId}
              </span>
            </div>
          </div>
        </div>

        {/* Logout action */}
        <div className="px-3 py-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-4 h-4 text-slate-500 hover:text-rose-400" />
              <span>Keluar (Logout)</span>
            </div>
            <span className="text-[10px] text-slate-400">Ganti Akun</span>
          </button>
        </div>

        {/* Bottom Cinema info */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-center">
          <p className="text-[10px] text-slate-300 font-semibold">Cinema Management System</p>
          <p className="text-[9px] text-amber-400 font-medium">LIPPO PLAZA SIDOARJO</p>
        </div>
      </aside>
    </>
  );
};
