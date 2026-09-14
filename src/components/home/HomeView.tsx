import React from 'react';
import { useCinema } from '../../context/CinemaContext';
import { useJakartaClock } from '../../utils/datetime';
import {
  Calendar,
  Package,
  Zap,
  Sparkles,
  CalendarCheck2,
  Users,
  ChevronRight,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Shield,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    currentUser,
    setCurrentTab,
    inventory,
    offDayRequests,
    leaveRequests,
    sickLeaveRequests,
    cleaningReports,
    utilityReports,
    employees,
  } = useCinema();

  const clock = useJakartaClock(1000);
  const isManager = currentUser.role === 'ADMIN';
  const isSupervisor = currentUser.role === 'SUPERVISOR';
  const isCrew = currentUser.role === 'CREW';

  // Quick stats
  const lowStockCount = inventory.filter((i) => i.status === 'LOW_STOCK' || i.status === 'OUT_OF_STOCK').length;
  const pendingRequestsCount =
    offDayRequests.filter((r) => r.status === 'PENDING').length +
    leaveRequests.filter((r) => r.status === 'PENDING').length +
    sickLeaveRequests.filter((r) => r.status === 'PENDING').length;

  const todayDateFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto animate-fadeIn">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-100 tracking-tight">
              Selamat Datang, <span className="text-amber-400">{currentUser.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 flex-wrap">
              {currentUser.role === 'ADMIN' && (
                <>
                  <span className="inline-flex items-center gap-1.5 font-medium font-mono text-slate-200">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                    <span>{clock.dayName}, {clock.fullString}</span>
                  </span>
                  <span className="text-slate-600 hidden xs:inline">•</span>
                </>
              )}
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Site: LIPPO PLAZA SIDOARJO</span>
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Feature Navigation Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Menu Operasional Utama
          </h2>
          <span className="text-xs text-slate-400">Pilih menu untuk memulai aktivitas</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Schedule (Requirement 3) */}
          <div
            onClick={() => setCurrentTab('schedule')}
            className="group p-5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 rounded-2xl cursor-pointer transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span>Schedule Bioskop</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Jadwal mingguan Cinema Crew & Leader, import Excel/JPG, jam kerja, stasiun penugasan, dan man-hours.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>{isManager ? 'Kelola & Import' : 'Lihat Jadwal Saya'}</span>
              <span className="text-amber-400 font-semibold group-hover:underline flex items-center gap-1">
                Buka <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* 2. Inventory */}
          <div
            onClick={() => setCurrentTab('inventory')}
            className="group p-5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 rounded-2xl cursor-pointer transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-105 transition-transform">
                <Package className="w-6 h-6" />
              </div>
              {lowStockCount > 0 && (
                <span className="text-[10px] font-bold text-rose-300 bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {lowStockCount} Menipis
                </span>
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span>Inventory & Stock</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Pencatatan stok F&B, operational supplies, barang masuk/keluar, dan peringatan batas minimum.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>{inventory.length} Item Terdaftar</span>
              <span className="text-sky-400 font-semibold group-hover:underline flex items-center gap-1">
                Buka <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* 3. Utility Monitoring */}
          <div
            onClick={() => setCurrentTab('utility')}
            className="group p-5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 rounded-2xl cursor-pointer transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                Listrik & Air
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span>Utility Monitoring</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Pencatatan meteran listrik & air harian dilengkapi panduan foto kamera meteran dan kalkulasi otomatis.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>{utilityReports.length} Laporan Tercatat</span>
              <span className="text-amber-400 font-semibold group-hover:underline flex items-center gap-1">
                Buka <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* 4. Daily Cleaning */}
          <div
            onClick={() => setCurrentTab('cleaning')}
            className="group p-5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 rounded-2xl cursor-pointer transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Audit Higienis
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span>Daily Cleaning</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Checklist kebersihan per shift (Pagi, Siang, Malam), area Studio Auditorium, Toilet, dan Lobby Cinema.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>{cleaningReports.length} Checklist Selesai</span>
              <span className="text-emerald-400 font-semibold group-hover:underline flex items-center gap-1">
                Buka <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* 5. Izin & Cuti Karyawan */}
          <div
            onClick={() => setCurrentTab('requests')}
            className="group p-5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 rounded-2xl cursor-pointer transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform">
                <CalendarCheck2 className="w-6 h-6" />
              </div>
              {pendingRequestsCount > 0 && (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full">
                  {pendingRequestsCount} Pending
                </span>
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span>Izin & Cuti Karyawan</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Pengajuan Off Day, Cuti Tahunan, dan pelaporan Izin Sakit (SKD) dengan verifikasi digital.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Sisa Cuti: {employees.find((e) => e.employeeId === currentUser.employeeId)?.leaveBalance ?? 12} Hari</span>
              <span className="text-purple-400 font-semibold group-hover:underline flex items-center gap-1">
                Buka <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* 6. Employee Management (Manager / Supervisor) or Profile (Crew) */}
          <div
            onClick={() => setCurrentTab(isCrew ? 'settings' : 'employees')}
            className="group p-5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 rounded-2xl cursor-pointer transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                {isCrew ? 'Profil Saya' : 'Staf & Akun'}
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span>{isCrew ? 'Profil Pribadi' : 'Manajemen Karyawan'}</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {isCrew
                  ? 'Lihat dan perbarui data profil pribadi dan password akun.'
                  : 'Database karyawan bioskop, pembuatan akun login, tanggal lahir, dan status keaktifan.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>{isCrew ? currentUser.position : `${employees.length} Karyawan`}</span>
              <span className="text-indigo-400 font-semibold group-hover:underline flex items-center gap-1">
                Buka <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
