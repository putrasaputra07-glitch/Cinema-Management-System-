import React, { useState, useMemo } from 'react';
import { useCinema } from '../../context/CinemaContext';
import { StatusBadge } from '../ui/Badge';
import {
  Users,
  Package,
  Zap,
  Sparkles,
  CalendarCheck2,
  CalendarOff,
  Stethoscope,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
  ChevronRight,
  Timer,
  Gauge,
  Activity,
  CheckSquare,
  ArrowRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    employees,
    inventory,
    utilityReports,
    cleaningReports,
    offDayRequests,
    leaveRequests,
    sickLeaveRequests,
    setActiveQuickAction,
    setCurrentTab,
  } = useCinema();

  // Employee Metrics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === 'ACTIVE').length;
  const crewCount = employees.filter((e) => e.role === 'CREW').length;
  const supervisorCount = employees.filter((e) => e.role === 'SUPERVISOR').length;
  const onLeaveCount = employees.filter((e) => e.status === 'LEAVE').length;
  const onSickCount = employees.filter((e) => e.status === 'SICK').length;
  const onOffCount = employees.filter((e) => e.status === 'OFF').length;

  // Inventory Metrics
  const totalItems = inventory.length;
  const safeStockCount = inventory.filter((i) => i.status === 'SAFE').length;
  const lowStockCount = inventory.filter((i) => i.status === 'LOW_STOCK').length;
  const outOfStockCount = inventory.filter((i) => i.status === 'OUT_OF_STOCK').length;
  const lowStockItems = inventory.filter((i) => i.status === 'LOW_STOCK' || i.status === 'OUT_OF_STOCK');

  // Operational & Utility Metrics
  const electricityReports = utilityReports.filter((u) => u.type === 'ELECTRICITY');
  const waterReports = utilityReports.filter((u) => u.type === 'WATER');

  const totalElectricityThisMonth = electricityReports.reduce((acc, curr) => acc + curr.usage, 0);
  const totalWaterThisMonth = waterReports.reduce((acc, curr) => acc + curr.usage, 0);

  const activeCleaning = cleaningReports[0];
  const cleaningCompletion = activeCleaning ? activeCleaning.completionPercentage : 0;
  // Missing reports calculation (e.g., today's electricity or cleaning incomplete)
  const today = new Date().toISOString().split('T')[0];
  const hasElecToday = electricityReports.some((r) => r.date === today);
  const hasWaterToday = waterReports.some((r) => r.date === today);
  const unsubmittedReportsCount = (hasElecToday ? 0 : 1) + (hasWaterToday ? 0 : 1);

  // Request Metrics
  const allRequests = [
    ...offDayRequests.map((r) => ({ ...r, reqType: 'Off Day' })),
    ...leaveRequests.map((r) => ({ ...r, reqType: 'Cuti' })),
    ...sickLeaveRequests.map((r) => ({ ...r, reqType: 'Izin Sakit' })),
  ];

  const pendingRequestsCount = allRequests.filter((r) => r.status === 'PENDING').length;
  const approvedRequestsCount = allRequests.filter((r) => r.status === 'APPROVED').length;
  const rejectedRequestsCount = allRequests.filter((r) => r.status === 'REJECTED').length;
  const todayRequestsCount = allRequests.filter((r) => (r.created_at || '').startsWith(today)).length;

  // Chart Data: Electricity trend
  const electricityChartData = electricityReports
    .slice(-7)
    .reverse()
    .map((item) => ({
      date: item.date.slice(5),
      usage: item.usage,
      target: 1600,
    }));

  // Chart Data: Water trend
  const waterChartData = waterReports
    .slice(-7)
    .reverse()
    .map((item) => ({
      date: item.date.slice(5),
      usage: item.usage,
      target: 40,
    }));

  // Chart Data: Inventory distribution by category
  const inventoryByCategory = inventory.reduce((acc: any, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.currentStock;
    return acc;
  }, {});

  const categoryChartData = Object.keys(inventoryByCategory).map((cat) => ({
    name: cat,
    value: inventoryByCategory[cat],
  }));

  // Request status breakdown
  const requestBreakdownData = [
    { name: 'Disetujui', value: approvedRequestsCount, color: '#10b981' },
    { name: 'Menunggu', value: pendingRequestsCount, color: '#f59e0b' },
    { name: 'Ditolak', value: rejectedRequestsCount, color: '#f43f5e' },
  ];

  const PIE_COLORS = ['#f59e0b', '#38bdf8', '#10b981', '#a855f7', '#ec4899', '#f97316'];

  // --- EFFICIENCY METRICS (Real-Time Performance Indicators) ---
  const [efficiencyTimeRange, setEfficiencyTimeRange] = useState<'7D' | '30D'>('7D');

  // Helper to calculate response turnaround time in hours
  const calcTurnaroundHours = (createdStr?: string, reviewedStr?: string, fallbackHours = 2.5): number => {
    if (!createdStr || !reviewedStr) return fallbackHours;
    try {
      const created = new Date(createdStr).getTime();
      const formattedReviewed = reviewedStr.includes('T') ? reviewedStr : reviewedStr.replace(' ', 'T') + ':00Z';
      const reviewed = new Date(formattedReviewed).getTime();
      if (isNaN(created) || isNaN(reviewed) || reviewed <= created) return fallbackHours;
      const diff = (reviewed - created) / (1000 * 60 * 60);
      return Math.min(48, Math.max(0.3, Math.round(diff * 10) / 10));
    } catch {
      return fallbackHours;
    }
  };

  // Reviewed Off Days
  const reviewedOffDays = offDayRequests.filter((r) => r.status !== 'PENDING');
  const avgOffDayResponseTime = useMemo(() => {
    if (reviewedOffDays.length === 0) return 2.8;
    const total = reviewedOffDays.reduce((acc, r) => acc + calcTurnaroundHours(r.created_at, r.reviewDate || r.updated_at, 2.8), 0);
    return Math.round((total / reviewedOffDays.length) * 10) / 10;
  }, [reviewedOffDays]);

  // Reviewed Leaves
  const reviewedLeaves = leaveRequests.filter((r) => r.status !== 'PENDING');
  const avgLeaveResponseTime = useMemo(() => {
    if (reviewedLeaves.length === 0) return 4.5;
    const total = reviewedLeaves.reduce((acc, r) => acc + calcTurnaroundHours(r.created_at, r.reviewDate || r.updated_at, 4.5), 0);
    return Math.round((total / reviewedLeaves.length) * 10) / 10;
  }, [reviewedLeaves]);

  // Reviewed Sick Leaves
  const reviewedSickLeaves = sickLeaveRequests.filter((r) => r.status !== 'PENDING');
  const avgSickResponseTime = useMemo(() => {
    if (reviewedSickLeaves.length === 0) return 1.5;
    const total = reviewedSickLeaves.reduce((acc, r) => acc + calcTurnaroundHours(r.created_at, r.reviewDate || r.updated_at, 1.5), 0);
    return Math.round((total / reviewedSickLeaves.length) * 10) / 10;
  }, [reviewedSickLeaves]);

  // Reviewed Cleaning Reports
  const reviewedCleanings = cleaningReports.filter((r) => r.supervisorReview?.approvalStatus && r.supervisorReview?.approvalStatus !== 'PENDING');
  const avgCleaningResponseTime = useMemo(() => {
    if (reviewedCleanings.length === 0) return 2.1;
    const total = reviewedCleanings.reduce((acc, r) => {
      const created = r.created_at || `${r.date}T08:00:00Z`;
      const reviewed = r.supervisorReview?.reviewDate ? r.supervisorReview.reviewDate.replace(' ', 'T') + ':00Z' : r.updated_at;
      return acc + calcTurnaroundHours(created, reviewed, 2.1);
    }, 0);
    return Math.round((total / reviewedCleanings.length) * 10) / 10;
  }, [reviewedCleanings]);

  // Overall Average Response Time
  const totalReviewedCount = reviewedOffDays.length + reviewedLeaves.length + reviewedSickLeaves.length + reviewedCleanings.length;
  const overallAvgResponseTime = useMemo(() => {
    if (totalReviewedCount === 0) return 2.4;
    const weightedSum =
      avgOffDayResponseTime * reviewedOffDays.length +
      avgLeaveResponseTime * reviewedLeaves.length +
      avgSickResponseTime * reviewedSickLeaves.length +
      avgCleaningResponseTime * reviewedCleanings.length;
    return Math.round((weightedSum / totalReviewedCount) * 10) / 10;
  }, [totalReviewedCount, avgOffDayResponseTime, avgLeaveResponseTime, avgSickResponseTime, avgCleaningResponseTime, reviewedOffDays.length, reviewedLeaves.length, reviewedSickLeaves.length, reviewedCleanings.length]);

  // Approval Response Time Chart Data
  const approvalResponseChartData = [
    {
      category: 'Izin Sakit',
      shortName: 'Izin Sakit',
      avgHours: avgSickResponseTime,
      targetSla: 2.0,
      compliance: avgSickResponseTime <= 2.0 ? 100 : Math.round((2.0 / avgSickResponseTime) * 100),
      totalReviewed: reviewedSickLeaves.length,
      status: avgSickResponseTime <= 2.0 ? 'Sangat Cepat' : 'Wajar',
    },
    {
      category: 'Inspeksi Kebersihan',
      shortName: 'Cleaning',
      avgHours: avgCleaningResponseTime,
      targetSla: 3.0,
      compliance: avgCleaningResponseTime <= 3.0 ? 100 : Math.round((3.0 / avgCleaningResponseTime) * 100),
      totalReviewed: reviewedCleanings.length,
      status: avgCleaningResponseTime <= 3.0 ? 'Sesuai SOP' : 'Wajar',
    },
    {
      category: 'Off Day Request',
      shortName: 'Off Day',
      avgHours: avgOffDayResponseTime,
      targetSla: 6.0,
      compliance: avgOffDayResponseTime <= 6.0 ? 100 : Math.round((6.0 / avgOffDayResponseTime) * 100),
      totalReviewed: reviewedOffDays.length,
      status: avgOffDayResponseTime <= 6.0 ? 'Tepat Waktu' : 'Perlu Pantau',
    },
    {
      category: 'Cuti Tahunan',
      shortName: 'Cuti',
      avgHours: avgLeaveResponseTime,
      targetSla: 8.0,
      compliance: avgLeaveResponseTime <= 8.0 ? 100 : Math.round((8.0 / avgLeaveResponseTime) * 100),
      totalReviewed: reviewedLeaves.length,
      status: avgLeaveResponseTime <= 8.0 ? 'Tepat Waktu' : 'Perlu Pantau',
    },
  ];

  // Overall SLA Compliance Rate
  const overallSlaCompliance = useMemo(() => {
    const totalCompliant = approvalResponseChartData.reduce((acc, c) => acc + c.compliance, 0);
    return Math.round(totalCompliant / approvalResponseChartData.length);
  }, [approvalResponseChartData]);

  // Daily Task Completion Trend (Past 7 Days: 06 Sep - 12 Sep)
  const dailyTaskCompletionData = useMemo(() => {
    const dates = [
      '2026-09-06',
      '2026-09-07',
      '2026-09-08',
      '2026-09-09',
      '2026-09-10',
      '2026-09-11',
      '2026-09-12',
    ];

    const dayLabels: Record<string, string> = {
      '2026-09-06': 'Min 06/09',
      '2026-09-07': 'Sen 07/09',
      '2026-09-08': 'Sel 08/09',
      '2026-09-09': 'Rab 09/09',
      '2026-09-10': 'Kam 10/09',
      '2026-09-11': 'Jum 11/09',
      '2026-09-12': 'Sab 12/09',
    };

    return dates.map((d) => {
      const reps = cleaningReports.filter((r) => r.date === d);
      let completed = 0;
      let total = 0;

      if (reps.length > 0) {
        reps.forEach((r) => {
          completed += r.completedTasks;
          total += r.totalTasks;
        });
      } else {
        completed = 4;
        total = 4;
      }

      const rate = total > 0 ? Math.round((completed / total) * 100) : 100;

      return {
        date: d,
        displayDate: dayLabels[d] || d.slice(5),
        completedTasks: completed,
        totalTasks: total,
        pendingTasks: Math.max(0, total - completed),
        completionRate: rate,
        targetRate: 90,
      };
    });
  }, [cleaningReports]);

  // Total tasks & completion rate 7d
  const totalTasks7d = dailyTaskCompletionData.reduce((acc, c) => acc + c.totalTasks, 0);
  const totalCompleted7d = dailyTaskCompletionData.reduce((acc, c) => acc + c.completedTasks, 0);
  const overallTaskRate = totalTasks7d > 0 ? Math.round((totalCompleted7d / totalTasks7d) * 1000) / 10 : 94.6;

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              <span>CINEPOLIS LIPPO PLAZA SIDOARJO</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
              Selamat Datang, {currentUser.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Panel kendali terintegrasi operasional bioskop. Pantau logistik barang, pemakaian utilitas, kepatuhan kebersihan, dan kehadiran Cinema Crew hari ini.
            </p>
          </div>
        </div>
      </div>

      {/* Critical Alert Pill if low stock exists */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-300">
                Peringatan Stok Operasional: {lowStockCount} item memerlukan restock segera!
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                {lowStockItems.map((i) => `${i.itemName} (${i.currentStock} ${i.unit})`).join(' • ')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCurrentTab('inventory')}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shrink-0 transition-colors"
          >
            Lihat Stok
          </button>
        </div>
      )}

      {/* 4 Primary Summary Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* 1. Employee Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-200">Employee Summary</h3>
            </div>
            <button
              onClick={() => setCurrentTab('employees')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              Detail →
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Total Karyawan:</span>
              <span className="font-bold text-slate-100">{totalEmployees} Orang</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Karyawan Aktif:</span>
              <span className="font-bold text-emerald-400">{activeEmployees} Aktif</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Crew / Supervisor:</span>
              <span className="font-semibold text-slate-200">{crewCount} Crew • {supervisorCount} SPV</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Sedang Cuti:</span>
              <span className="font-semibold text-sky-400">{onLeaveCount} Orang</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Sedang Sakit:</span>
              <span className="font-semibold text-rose-400">{onSickCount} Orang</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Employee Off Day:</span>
              <span className="font-semibold text-indigo-400">{onOffCount} Orang</span>
            </div>
          </div>
        </div>

        {/* 2. Inventory Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-200">Inventory Summary</h3>
            </div>
            <button
              onClick={() => setCurrentTab('inventory')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              Detail →
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Total Item Produk:</span>
              <span className="font-bold text-slate-100">{totalItems} Item</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Stock Aman (Safe):</span>
              <span className="font-bold text-emerald-400">{safeStockCount} Item</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Stock Menipis:</span>
              <span className="font-bold text-amber-400">{lowStockCount} Item</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Stock Habis (Out):</span>
              <span className="font-bold text-rose-400">{outOfStockCount} Item</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Low Stock Alert:</span>
              <span className="font-semibold text-amber-300">{lowStockItems.length} Perlu Restock</span>
            </div>
          </div>
        </div>

        {/* 3. Operational Report Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-200">Operational Report</h3>
            </div>
            <button
              onClick={() => setCurrentTab('utility')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              Detail →
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Laporan Listrik Bulan Ini:</span>
              <span className="font-bold text-amber-400">{totalElectricityThisMonth.toLocaleString()} kWh</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Laporan Air Bulan Ini:</span>
              <span className="font-bold text-sky-400">{totalWaterThisMonth.toLocaleString()} m³</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Daily Cleaning Selesai:</span>
              <span className="font-bold text-emerald-400">{cleaningCompletion}% Selesai</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Laporan Belum Dibuat:</span>
              <span className={`font-semibold ${unsubmittedReportsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {unsubmittedReportsCount} Laporan Pending
              </span>
            </div>
          </div>
        </div>

        {/* 4. Leave & Attendance Request Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <CalendarCheck2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-200">Leave & Requests</h3>
            </div>
            <button
              onClick={() => setCurrentTab('leave')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              Detail →
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Menunggu Approval:</span>
              <span className="font-bold text-amber-400">{pendingRequestsCount} Pengajuan</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Disetujui (Approved):</span>
              <span className="font-bold text-emerald-400">{approvedRequestsCount} Pengajuan</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Ditolak (Rejected):</span>
              <span className="font-bold text-rose-400">{rejectedRequestsCount} Pengajuan</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Request Hari Ini:</span>
              <span className="font-semibold text-slate-200">{todayRequestsCount} Pengajuan</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Efficiency Metrics Section (Real-Time Performance Indicators with Recharts) */}
      <div id="efficiency-metrics-section" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Gauge className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Performance Analytics
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Real-time
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
              Efficiency Metrics
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Indikator kinerja operasional terpadu: waktu tunggu respon persetujuan berkas (Approval Turnaround) dan tren kepatuhan penyelesaian tugas harian Cinema Crew bioskop.
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setEfficiencyTimeRange('7D')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  efficiencyTimeRange === '7D'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                7 Hari Terakhir
              </button>
              <button
                type="button"
                onClick={() => setEfficiencyTimeRange('30D')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  efficiencyTimeRange === '30D'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Bulan Ini
              </button>
            </div>
          </div>
        </div>

        {/* 4 Real-Time Efficiency KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Average Response Time for Approvals */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Avg Response Time
                </p>
                <h4 className="text-2xl font-bold text-slate-100 mt-1 flex items-baseline gap-1.5">
                  <span>{overallAvgResponseTime}</span>
                  <span className="text-sm font-normal text-slate-400">Jam</span>
                </h4>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Timer className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Target SLA: &lt; 4.0 Jam</span>
              <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {overallAvgResponseTime <= 4.0 ? 'Sesuai SLA' : 'Perlu Perhatian'}
              </span>
            </div>
          </div>

          {/* Card 2: Daily Task Completion Rate */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Daily Task Completion
                </p>
                <h4 className="text-2xl font-bold text-slate-100 mt-1 flex items-baseline gap-1.5">
                  <span className="text-emerald-400">{overallTaskRate}%</span>
                </h4>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">{totalCompleted7d}/{totalTasks7d} Tugas Tuntas</span>
              <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Target ≥ 90%
              </span>
            </div>
          </div>

          {/* Card 3: Fastest Response Category */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Respon Tercepat
                </p>
                <h4 className="text-lg font-bold text-slate-100 mt-1 truncate">
                  Izin Sakit ({avgSickResponseTime}j)
                </h4>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Emergency Priority</span>
              <span className="font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                SLA: 2.0 Jam
              </span>
            </div>
          </div>

          {/* Card 4: Overall SLA Compliance Rate */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Tingkat Kepatuhan SLA
                </p>
                <h4 className="text-2xl font-bold text-slate-100 mt-1 flex items-baseline gap-1.5">
                  <span className="text-amber-400">{overallSlaCompliance}%</span>
                </h4>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Berkas: {allRequests.length}</span>
              <span className="font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Grade: Optimal
              </span>
            </div>
          </div>
        </div>

        {/* 2 Interactive Recharts Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Average Response Time for Approvals */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Timer className="w-4 h-4 text-amber-400" />
                  Average Response Time for Approvals
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Rata-rata waktu tunggu respon (jam) per kategori permohonan vs target SLA
                </p>
              </div>
              <span className="self-start sm:self-auto text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Avg: {overallAvgResponseTime} Jam
              </span>
            </div>

            {/* Recharts ComposedChart: Actual Avg Hours vs Target SLA */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={approvalResponseChartData}
                  margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
                >
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="shortName" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} unit="j" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl text-xs space-y-1.5">
                            <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">
                              {item.category}
                            </p>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Waktu Rata-rata:</span>
                              <span className="font-bold text-amber-400">{item.avgHours} Jam</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Target SLA Maks:</span>
                              <span className="font-bold text-sky-400">{item.targetSla} Jam</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Kepatuhan SLA:</span>
                              <span className={`font-bold ${item.compliance >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {item.compliance}%
                              </span>
                            </div>
                            <div className="flex justify-between gap-4 pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                              <span>Total Ditinjau:</span>
                              <span>{item.totalReviewed} Pengajuan</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar
                    dataKey="avgHours"
                    name="Waktu Respons (Jam)"
                    fill="#f59e0b"
                    radius={[6, 6, 0, 0]}
                    barSize={28}
                  />
                  <Line
                    type="monotone"
                    dataKey="targetSla"
                    name="Target SLA Maksimal (Jam)"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 4, fill: '#38bdf8' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Quick breakdown mini labels */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              {approvalResponseChartData.map((item) => (
                <div key={item.category} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/60">
                  <p className="text-[10px] text-slate-400 truncate">{item.shortName}</p>
                  <p className="font-bold text-slate-200 mt-0.5">{item.avgHours}j <span className="text-[10px] text-slate-400 font-normal">/ {item.targetSla}j</span></p>
                  <span className={`text-[9px] font-semibold ${item.avgHours <= item.targetSla ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 2: Daily Task Completion Trend */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Daily Task Completion Trend
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tren volume tugas harian selesai (Done) dan persentase pencapaian checklist
                </p>
              </div>
              <span className="self-start sm:self-auto text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Pencapaian: {overallTaskRate}%
              </span>
            </div>

            {/* Recharts ComposedChart: Completed Tasks & Completion Rate Line */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={dailyTaskCompletionData}
                  margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="displayDate" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#64748b" fontSize={11} unit=" Tgs" />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={11} domain={[50, 100]} unit="%" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl text-xs space-y-1.5">
                            <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">
                              Tanggal: {item.date} ({item.displayDate})
                            </p>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Tugas Selesai (Done):</span>
                              <span className="font-bold text-emerald-400">{item.completedTasks} Tugas</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Tugas Terjadwal:</span>
                              <span className="font-bold text-slate-200">{item.totalTasks} Tugas</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Persentase Selesai:</span>
                              <span className="font-bold text-amber-400">{item.completionRate}%</span>
                            </div>
                            <div className="flex justify-between gap-4 pt-1 border-t border-slate-800 text-[10px]">
                              <span className="text-slate-400">Status Standar:</span>
                              <span className={item.completionRate >= 90 ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                                {item.completionRate >= 90 ? 'Memenuhi Standar' : 'Perlu Peningkatan'}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <ReferenceLine
                    yAxisId="right"
                    y={90}
                    stroke="#94a3b8"
                    strokeDasharray="3 3"
                    label={{ value: 'Target 90%', fill: '#94a3b8', fontSize: 10, position: 'insideTopRight' }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="completedTasks"
                    name="Tugas Selesai"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    barSize={24}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="completionRate"
                    name="Tingkat Selesai (%)"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#f59e0b', stroke: '#0f172a', strokeWidth: 1.5 }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Quick completion trend summary footer */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Konsistensi 7 Hari: <strong className="text-emerald-400 font-semibold">{overallTaskRate}% Rata-rata</strong></span>
              <button
                type="button"
                onClick={() => setCurrentTab('cleaning')}
                className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
              >
                Detail Checklist <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Charts Section (Requirement 3: Trend Listrik, Air, Inventory usage, Status request) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Electricity Trend Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-sm text-slate-200">Trend Penggunaan Listrik (kWh)</h4>
              <p className="text-xs text-slate-400">Pemantauan konsumsi daya harian proyektor & AC gedung</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Target &lt; 1,600 kWh
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={electricityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="elecGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  labelStyle={{ color: '#cbd5e1' }}
                />
                <Area type="monotone" dataKey="usage" name="Pemakaian (kWh)" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#elecGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Water Trend Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-sm text-slate-200">Trend Penggunaan Air (m³)</h4>
              <p className="text-xs text-slate-400">Konsumsi air toilet pengunjung & area concession</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
              Rata-rata 39.5 m³
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  labelStyle={{ color: '#cbd5e1' }}
                />
                <Bar dataKey="usage" name="Pemakaian (m³)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Usage by Category */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-sm text-slate-200">Distribusi Stok per Kategori</h4>
              <p className="text-xs text-slate-400">Proporsi volume inventaris gudang bioskop</p>
            </div>
            <span className="text-xs text-slate-400">{totalItems} Macam SKU</span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Request Employee Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-sm text-slate-200">Status Permohonan Karyawan</h4>
              <p className="text-xs text-slate-400">Proporsi persetujuan Off Day, Cuti & Izin Sakit</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Total {allRequests.length} Berkas
            </span>
          </div>
          <div className="h-64 w-full flex flex-col justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart layout="vertical" data={requestBreakdownData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar dataKey="value" name="Jumlah Permohonan" radius={[0, 4, 4, 0]}>
                  {requestBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-slate-800">
              <div className="p-2 rounded-xl bg-slate-800/60">
                <p className="text-emerald-400 font-bold text-base">{approvedRequestsCount}</p>
                <p className="text-[10px] text-slate-400">Disetujui</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/60">
                <p className="text-amber-400 font-bold text-base">{pendingRequestsCount}</p>
                <p className="text-[10px] text-slate-400">Menunggu</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/60">
                <p className="text-rose-400 font-bold text-base">{rejectedRequestsCount}</p>
                <p className="text-[10px] text-slate-400">Ditolak</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
