import React, { useState, useRef } from 'react';
import { useCinema } from '../../context/CinemaContext';
import { useJakartaClock } from '../../utils/datetime';
import {
  Calendar,
  Upload,
  Download,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Search,
  Users,
  Clock,
  Briefcase,
  AlertCircle,
  FileSpreadsheet,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Save,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  WeeklyScheduleWeek,
  WeeklyScheduleEntry,
  DailySchedulePlotting,
  ScheduleCategory,
  ScheduleDutyStatus,
} from '../../types';
import * as XLSX from 'xlsx';

export const ScheduleView: React.FC = () => {
  const {
    currentUser,
    scheduleWeeks,
    addScheduleWeek,
    updateScheduleWeek,
    refreshSchedule,
    isRefreshingSchedule,
    scheduleLastRefreshedTime,
    scheduleLastSync,
    showToast,
    logActivity,
    employees,
  } = useCinema();

  const clock = useJakartaClock(1000);
  const [justUpdated, setJustUpdated] = useState(false);

  const handleManualRefresh = async () => {
    await refreshSchedule();
    setJustUpdated(true);
    setTimeout(() => {
      setJustUpdated(false);
    }, 2500);
  };

  const isManager = currentUser.role === 'ADMIN';

  // State
  const [selectedWeekId, setSelectedWeekId] = useState<string>(() => {
    return scheduleWeeks.length > 0 ? scheduleWeeks[0].id : 'week-37';
  });

  const [activeCategory, setActiveCategory] = useState<ScheduleCategory>('CINEMA_CREW');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditCellModalOpen, setIsEditCellModalOpen] = useState(false);

  // Cell editing state for Manager
  const [editingTarget, setEditingTarget] = useState<{
    entryId: string;
    employeeName: string;
    dateKey: string;
    dayName: string;
    currentPlotting?: DailySchedulePlotting;
  } | null>(null);

  const [cellForm, setCellForm] = useState<{
    statusType: ScheduleDutyStatus;
    station: string;
    startAt: string;
    breakAt: string;
    durationHours: number;
    totalMh: number;
    offLabel: string;
  }>({
    statusType: 'DUTY',
    station: 'USHER',
    startAt: '11',
    breakAt: '15',
    durationHours: 9,
    totalMh: 8,
    offLabel: 'ADD DAYOFF',
  });

  // Current active week object
  const currentWeek = scheduleWeeks.find((w) => w.id === selectedWeekId) || scheduleWeeks[0];

  // Helper to compute 7 day dates from week.startDate (Wednesday to Tuesday)
  const getWeekDates = (startDateStr: string) => {
    const days: { dateStr: string; dayName: string; formattedDate: string }[] = [];
    const dayNames = ['Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu', 'Senin', 'Selasa'];
    const start = new Date(startDateStr);

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${date}`;
      const formattedDate = `${date}/${month}`;
      days.push({
        dateStr,
        dayName: dayNames[i],
        formattedDate,
      });
    }
    return days;
  };

  const weekDays = currentWeek ? getWeekDates(currentWeek.startDate) : [];

  // Filter entries by Category (Cinema Crew vs Leader) and Search
  const filteredEntries = (currentWeek?.entries || []).filter((entry) => {
    const matchesCategory = entry.category === activeCategory;
    const matchesSearch =
      entry.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.position && entry.position.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Upload handler for Excel / JPG
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setUploadPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setUploadPreview(null);
      }
    }
  };

  const processUpload = async () => {
    if (!uploadFile) return;
    setIsProcessing(true);

    try {
      if (uploadFile.name.endsWith('.xlsx') || uploadFile.name.endsWith('.xls') || uploadFile.name.endsWith('.csv')) {
        // Parse Excel file
        const data = await uploadFile.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        // Extract metadata or construct new schedule week
        const newWeekNumber = (currentWeek?.weekNumber || 36) + 1;
        const newEntries: WeeklyScheduleEntry[] = [];

        // Simple row parsing
        json.slice(1).forEach((row, idx) => {
          if (row && row[0]) {
            const name = String(row[0]).trim();
            if (name && name.length > 2 && !name.toLowerCase().includes('site') && !name.toLowerCase().includes('daily')) {
              const isLeader =
                name.toLowerCase().includes('alex') ||
                name.toLowerCase().includes('dewi') ||
                name.toLowerCase().includes('hendra') ||
                name.toLowerCase().includes('manager') ||
                name.toLowerCase().includes('spv');

              const entryDaily: Record<string, DailySchedulePlotting> = {};
              weekDays.forEach((wd, dIdx) => {
                const cellVal = row[dIdx + 1] ? String(row[dIdx + 1]).trim() : '';
                if (cellVal.toLowerCase().includes('off')) {
                  entryDaily[wd.dateStr] = {
                    station: cellVal,
                    statusType: cellVal.toLowerCase().includes('ph') ? 'PH_OFF' : 'DAYOFF',
                    offLabel: cellVal,
                  };
                } else {
                  entryDaily[wd.dateStr] = {
                    station: cellVal || (isLeader ? 'MOD' : 'USHER'),
                    startAt: '11',
                    breakAt: '15',
                    durationHours: 9,
                    totalMh: 8,
                    statusType: 'DUTY',
                  };
                }
              });

              newEntries.push({
                id: `entry-${Date.now()}-${idx}`,
                employeeId: `EMP-${100 + idx}`,
                employeeName: name,
                position: isLeader ? 'Supervisor / MOD' : 'Cinema Crew',
                role: isLeader ? 'SUPERVISOR' : 'CREW',
                category: isLeader ? 'LEADER' : 'CINEMA_CREW',
                totalMh: 40,
                totalWorkingDays: 5,
                dailyPlotting: entryDaily,
              });
            }
          }
        });

        const newWeek: WeeklyScheduleWeek = {
          id: `week-${Date.now()}`,
          siteName: '60-LIPPO PLAZA',
          weekNumber: newWeekNumber,
          referensiWeek: (currentWeek?.referensiWeek || 32) + 1,
          referensiYear: 2026,
          startDate: currentWeek.startDate,
          endDate: currentWeek.endDate,
          dailyAdmits: currentWeek.dailyAdmits,
          entries: newEntries.length > 0 ? newEntries : currentWeek.entries,
          updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
          updatedBy: `${currentUser.name} (${currentUser.position})`,
          sourceType: 'EXCEL',
        };

        addScheduleWeek(newWeek);
        setSelectedWeekId(newWeek.id);
        showToast(`File Excel ${uploadFile.name} berhasil di-convert menjadi schedule sistem!`, 'success');
        logActivity('Upload & Convert Excel Schedule', 'Schedule', `File: ${uploadFile.name}`);
      } else {
        // Image / JPG Schedule
        const reader = new FileReader();
        reader.onload = () => {
          const imgDataUrl = reader.result as string;
          const newWeek: WeeklyScheduleWeek = {
            ...currentWeek,
            id: `week-${Date.now()}`,
            weekNumber: currentWeek.weekNumber + 1,
            attachmentUrl: imgDataUrl,
            updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
            updatedBy: `${currentUser.name} (${currentUser.position})`,
            sourceType: 'IMAGE',
          };
          addScheduleWeek(newWeek);
          setSelectedWeekId(newWeek.id);
          showToast('Gambar schedule JPG berhasil di-convert dan disimpan ke sistem!', 'success');
          logActivity('Upload Image Schedule', 'Schedule', `File: ${uploadFile.name}`);
        };
        reader.readAsDataURL(uploadFile);
      }

      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadPreview(null);
    } catch (err) {
      console.error(err);
      showToast('Gagal memproses file schedule. Pastikan format valid.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Cell Click -> Edit Plotting for Manager
  const handleOpenEditCell = (entry: WeeklyScheduleEntry, dateKey: string, dayName: string) => {
    if (!isManager) return;
    const plotting = entry.dailyPlotting?.[dateKey];
    setEditingTarget({
      entryId: entry.id,
      employeeName: entry.employeeName,
      dateKey,
      dayName,
      currentPlotting: plotting,
    });

    if (plotting) {
      setCellForm({
        statusType: plotting.statusType || 'DUTY',
        station: plotting.station || 'USHER',
        startAt: plotting.startAt || '11',
        breakAt: plotting.breakAt || '15',
        durationHours: plotting.durationHours || 9,
        totalMh: plotting.totalMh || 8,
        offLabel: plotting.offLabel || (plotting.statusType === 'PH_OFF' ? 'PH OFF TGL 25' : 'ADD DAYOFF'),
      });
    } else {
      setCellForm({
        statusType: 'DUTY',
        station: 'USHER',
        startAt: '11',
        breakAt: '15',
        durationHours: 9,
        totalMh: 8,
        offLabel: 'ADD DAYOFF',
      });
    }
    setIsEditCellModalOpen(true);
  };

  const handleSaveCell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget || !currentWeek) return;

    const updatedEntries = currentWeek.entries.map((entry) => {
      if (entry.id === editingTarget.entryId) {
        const newPlotting: DailySchedulePlotting =
          cellForm.statusType === 'DUTY'
            ? {
                station: cellForm.station,
                startAt: cellForm.startAt,
                breakAt: cellForm.breakAt,
                durationHours: Number(cellForm.durationHours),
                totalMh: Number(cellForm.totalMh),
                statusType: 'DUTY',
              }
            : {
                station: cellForm.offLabel,
                statusType: cellForm.statusType,
                offLabel: cellForm.offLabel,
              };

        const updatedDaily = {
          ...(entry.dailyPlotting || {}),
          [editingTarget.dateKey]: newPlotting,
        };

        // Recalculate working days and total MH
        let totalMh = 0;
        let totalWorkingDays = 0;
        (Object.values(updatedDaily) as DailySchedulePlotting[]).forEach((p) => {
          if (p.statusType === 'DUTY') {
            totalWorkingDays += 1;
            totalMh += p.totalMh || 8;
          }
        });

        return {
          ...entry,
          totalMh,
          totalWorkingDays,
          dailyPlotting: updatedDaily,
        };
      }
      return entry;
    });

    const updatedWeek: WeeklyScheduleWeek = {
      ...currentWeek,
      entries: updatedEntries,
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      updatedBy: `${currentUser.name} (${currentUser.position})`,
    };

    updateScheduleWeek(updatedWeek);
    setIsEditCellModalOpen(false);
    showToast(`Jadwal untuk ${editingTarget.employeeName} hari ${editingTarget.dayName} diperbarui.`, 'success');
  };

  return (
    <div className="space-y-6 pb-12 max-w-full animate-fadeIn">
      {/* Top Header Card with Meta Information */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base md:text-xl lg:text-2xl font-black text-slate-100 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                  Schedule Operasional Bioskop
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Jadwal penugasan mingguan Cinema Crew & Leader, stasiun kerja, jam istirahat, dan akumulasi man-hours.
                </p>
              </div>
            </div>
          </div>

          {/* Week Selector, Real-time Clock, Refresh & Action Buttons - Only for Admin */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isManager && (
              <>
                {/* Real-time Asia/Jakarta Clock Display */}
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-slate-200 font-mono shadow-sm"
                  title="Waktu Real-time Operasional Bioskop"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
                  <span>{clock.dayName}, {clock.fullString}</span>
                </div>

                {/* Dynamic Week Selection */}
                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
                  <span className="text-slate-400 font-semibold">Pilih Week:</span>
                  <select
                    id="select-schedule-week"
                    value={selectedWeekId}
                    onChange={(e) => setSelectedWeekId(e.target.value)}
                    className="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer"
                  >
                    {Array.from(
                      new Set(
                        scheduleWeeks
                          .filter((w) => w.entries && w.entries.length > 0)
                          .map((w) => Number(w.referensiYear || 2026))
                      )
                    )
                      .sort((a: number, b: number) => b - a)
                      .map((yr) => (
                        <optgroup key={yr} label={`Tahun ${yr}`} className="bg-slate-900 text-amber-300 font-bold">
                          {scheduleWeeks
                            .filter((w) => (w.referensiYear || 2026) === yr && w.entries && w.entries.length > 0)
                            .map((w) => (
                              <option key={w.id} value={w.id} className="bg-slate-900 text-slate-200 font-normal">
                                Tahun {w.referensiYear || yr} — Week {w.weekNumber} ({w.startDate} s/d {w.endDate})
                              </option>
                            ))}
                        </optgroup>
                      ))}
                  </select>
                </div>

                {/* Refresh Schedule Button with Indicators */}
                <button
                  id="btn-refresh-schedule"
                  type="button"
                  onClick={handleManualRefresh}
                  disabled={isRefreshingSchedule}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                    isRefreshingSchedule
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 cursor-wait'
                      : justUpdated
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-750 hover:border-amber-400/50'
                  }`}
                  title="Sinkronkan dan muat ulang data schedule"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      isRefreshingSchedule ? 'animate-spin text-amber-400' : justUpdated ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  />
                  <span>
                    {isRefreshingSchedule
                      ? 'Refreshing...'
                      : justUpdated
                      ? 'Schedule Updated'
                      : '↻ Refresh'}
                  </span>
                </button>

                {/* Upload Excel / JPG Button for Cinema Manager */}
                <button
                  id="btn-upload-schedule-modal"
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Schedule</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Schedule Meta Badges Row: Site, Week, Tanggal (No View-Only text, No Referensi Week/Tahun text per Req #5) */}
        {currentWeek && (
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Site / Lokasi</span>
              <span className="font-bold text-amber-400">
                {currentWeek.siteName
                  ? currentWeek.siteName.replace(/^60-/, '').replace(/LIPPO PLAZA$/, 'LIPPO PLAZA SIDOARJO')
                  : 'LIPPO PLAZA SIDOARJO'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Week Aktif</span>
              <span className="font-bold text-slate-200">Week {currentWeek.weekNumber}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Rentang Periode</span>
              <span className="font-bold text-slate-200">
                {currentWeek.startDate} — {currentWeek.endDate}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-800 flex flex-col justify-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Terakhir Disinkronkan
              </span>
              <span className="font-mono text-xs font-bold text-slate-200 block leading-tight">
                {scheduleLastSync?.date || '14/09/2026'}
              </span>
              <span className="font-mono text-[11px] font-semibold text-emerald-400 block leading-tight mt-0.5">
                {scheduleLastSync?.time || '13:07 WIB'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Category Tabs: Schedule Crew vs Schedule Leader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {/* Tab 1: Crew */}
          <button
            type="button"
            onClick={() => setActiveCategory('CINEMA_CREW')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'CINEMA_CREW'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Schedule Crew</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeCategory === 'CINEMA_CREW' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {(currentWeek?.entries || []).filter((e) => e.category === 'CINEMA_CREW').length}
            </span>
          </button>

          {/* Tab 2: Leader */}
          <button
            type="button"
            onClick={() => setActiveCategory('LEADER')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'LEADER'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Schedule Leader</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeCategory === 'LEADER' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {(currentWeek?.entries || []).filter((e) => e.category === 'LEADER').length}
            </span>
          </button>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Cari nama di ${activeCategory === 'CINEMA_CREW' ? 'Crew' : 'Leader'}...`}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Schedule Table Container with Fixed Left Columns & Horizontal Scroll Days (Requirement #4) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          <table className="w-full text-left border-collapse min-w-[1150px]">
            <thead>
              {/* Row 1: Header Titles */}
              <tr className="bg-slate-950/95 text-slate-300 text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="sticky left-0 z-30 bg-slate-950 p-3.5 w-12 text-center border-r border-slate-800/80">No</th>
                <th className="sticky left-12 z-30 bg-slate-950 p-3.5 w-56 border-r border-slate-800 shadow-[4px_0_12px_rgba(0,0,0,0.6)]">
                  Nama Karyawan
                </th>
                <th className="p-3.5 w-20 text-center">Total MH</th>
                <th className="p-3.5 w-20 text-center">Hari Kerja</th>

                {/* 7 Day Columns (Rabu s/d Selasa) */}
                {weekDays.map((wd) => {
                  const admitCount = currentWeek?.dailyAdmits?.[wd.dateStr];
                  return (
                    <th key={wd.dateStr} className="p-3 text-center border-l border-slate-800/80 min-w-[135px]">
                      <div className="flex flex-col items-center">
                        <span className="text-amber-400 font-extrabold">{wd.dayName}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{wd.formattedDate}</span>
                        {admitCount !== undefined && (
                          <span className="text-[9px] text-sky-400 bg-sky-500/10 px-1.5 py-0.2 rounded font-medium mt-0.5">
                            Adm: {admitCount}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    Tidak ada jadwal yang cocok untuk kategori ini
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry, idx) => (
                  <tr key={entry.id} className="hover:bg-slate-850/60 transition-colors group">
                    <td className="sticky left-0 z-20 bg-slate-900 group-hover:bg-slate-850 p-3 text-center font-bold text-slate-400 border-r border-slate-800/80">
                      {idx + 1}
                    </td>
                    <td className="sticky left-12 z-20 bg-slate-900 group-hover:bg-slate-850 p-3 border-r border-slate-800 shadow-[4px_0_12px_rgba(0,0,0,0.6)]">
                      <div className="font-bold text-slate-100 uppercase tracking-tight truncate max-w-[200px]">
                        {entry.employeeName}
                      </div>
                      <div className="text-[11px] text-amber-400/90 truncate">{entry.position || entry.role}</div>
                      <div className="text-[10px] text-slate-400">{entry.employeeId}</div>
                    </td>
                    <td className="p-3 text-center font-extrabold text-amber-300">
                      <span className="bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                        {entry.totalMh}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-300">
                      <span className="bg-slate-800 px-2 py-1 rounded-lg">{entry.totalWorkingDays}</span>
                    </td>

                    {/* 7 Daily Schedule Cells */}
                    {weekDays.map((wd) => {
                      const plotting = entry.dailyPlotting?.[wd.dateStr];
                      const isDuty = plotting && plotting.statusType === 'DUTY';
                      const isDayOff = plotting && (plotting.statusType === 'DAYOFF' || plotting.statusType === 'PH_OFF');

                      return (
                        <td
                          key={wd.dateStr}
                          onClick={() => isManager && handleOpenEditCell(entry, wd.dateStr, wd.dayName)}
                          className={`p-2 border-l border-slate-800/80 align-top transition-all ${
                            isManager ? 'cursor-pointer hover:bg-slate-800/90' : ''
                          }`}
                          title={isManager ? 'Klik untuk mengubah jadwal shift' : undefined}
                        >
                          {!plotting ? (
                            <div className="h-full flex items-center justify-center text-slate-600 text-[10px] py-3">
                              —
                            </div>
                          ) : isDayOff ? (
                            // Highlighted Red / Rose badge for Day Off, matching reference spreadsheet
                            <div className="h-full flex flex-col justify-center items-center py-2.5 px-1 bg-rose-500/20 border border-rose-500/40 rounded-xl text-center">
                              <span className="text-[11px] font-black text-rose-300 tracking-tight leading-tight">
                                {plotting.offLabel || 'DAYOFF'}
                              </span>
                              <span className="text-[9px] text-rose-400 font-semibold mt-0.5">LIBUR</span>
                            </div>
                          ) : isDuty ? (
                            // Working Duty Cell: Station, Start, Break, Durasi, Total MH
                            <div className="space-y-1 bg-slate-800/60 p-2 rounded-xl border border-slate-700/60 text-left">
                              <div className="font-extrabold text-[11px] text-amber-300 tracking-tight truncate">
                                {plotting.station}
                              </div>
                              <div className="text-[10px] text-slate-300 flex items-center justify-between">
                                <span>Start:</span>
                                <span className="font-bold text-slate-100">{plotting.startAt}:00</span>
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                                <span>Break:</span>
                                <span className="font-semibold text-slate-300">{plotting.breakAt}:00</span>
                              </div>
                              <div className="text-[9px] pt-1 border-t border-slate-700/60 flex items-center justify-between text-slate-400">
                                <span>Dur: {plotting.durationHours || 9}h</span>
                                <span className="font-bold text-emerald-400">MH: {plotting.totalMh || 8}</span>
                              </div>
                            </div>
                          ) : (
                            // Leave / Sick
                            <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-center">
                              <span className="text-[11px] font-bold text-sky-300">
                                {plotting.offLabel || plotting.statusType}
                              </span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Upload Schedule (Excel / JPG) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-slate-100">Upload & Convert Schedule</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Upload file jadwal mingguan dalam format <strong>Excel (.xlsx, .xls, .csv)</strong> atau{' '}
              <strong>Gambar (.jpg, .jpeg, .png)</strong>. Sistem akan otomatis meng-convert data menjadi tampilan
              jadwal mingguan dan menyinkronkannya dengan status karyawan.
            </p>

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-amber-400/80 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-850/50 hover:bg-slate-850 space-y-3"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".xlsx,.xls,.csv,image/jpeg,image/png,image/jpg"
                className="hidden"
              />

              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                {uploadFile?.type.startsWith('image/') ? (
                  <ImageIcon className="w-6 h-6" />
                ) : (
                  <FileSpreadsheet className="w-6 h-6" />
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-slate-200">
                  {uploadFile ? uploadFile.name : 'Pilih atau Tarik File Schedule ke Sini'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Mendukung format JPG, PNG, Excel (.xlsx, .xls)</p>
              </div>

              {uploadPreview && (
                <div className="mt-3 max-h-48 overflow-hidden rounded-xl border border-slate-700">
                  <img src={uploadPreview} alt="Preview Schedule" className="w-full h-auto object-contain" />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={processUpload}
                disabled={!uploadFile || isProcessing}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                {isProcessing ? (
                  <span>Mengonversi...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Convert & Terapkan Schedule</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Schedule Cell (Manager Only) */}
      {isEditCellModalOpen && editingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleSaveCell}
            className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-100">Edit Jadwal Shift</h3>
                <p className="text-xs text-amber-400 mt-0.5">
                  {editingTarget.employeeName} • {editingTarget.dayName} ({editingTarget.dateKey})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditCellModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Type: DUTY vs OFF */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Status Hari</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCellForm((prev) => ({ ...prev, statusType: 'DUTY' }))}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      cellForm.statusType === 'DUTY'
                        ? 'bg-amber-500 text-slate-950 border-amber-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    ON DUTY (KERJA)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCellForm((prev) => ({ ...prev, statusType: 'DAYOFF' }))}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      cellForm.statusType !== 'DUTY'
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    OFF / LIBUR
                  </button>
                </div>
              </div>

              {cellForm.statusType === 'DUTY' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Stasiun Penugasan</label>
                    <select
                      value={cellForm.station}
                      onChange={(e) => setCellForm((prev) => ({ ...prev, station: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="USHER">USHER</option>
                      <option value="POS REGULAR">POS REGULAR</option>
                      <option value="BOX OFFICE">BOX OFFICE</option>
                      <option value="CONCESSION">CONCESSION</option>
                      <option value="FLOOR">FLOOR</option>
                      <option value="MOD">MOD (Manager on Duty)</option>
                      <option value="SPV FLOOR">SPV FLOOR</option>
                      <option value="SPV CONCESSION">SPV CONCESSION</option>
                      <option value="SPV CLOSING">SPV CLOSING</option>
                      <option value="CLEANING AUDI">CLEANING AUDI</option>
                      <option value="CLEANING LOBBY">CLEANING LOBBY</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Start At (Jam)</label>
                      <input
                        type="text"
                        value={cellForm.startAt}
                        onChange={(e) => setCellForm((prev) => ({ ...prev, startAt: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200"
                        placeholder="Contoh: 11 atau 15"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Break At (Jam)</label>
                      <input
                        type="text"
                        value={cellForm.breakAt}
                        onChange={(e) => setCellForm((prev) => ({ ...prev, breakAt: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200"
                        placeholder="Contoh: 15 atau 16"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Durasi + Rest (Jam)</label>
                      <input
                        type="number"
                        value={cellForm.durationHours}
                        onChange={(e) => setCellForm((prev) => ({ ...prev, durationHours: Number(e.target.value) }))}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Total MH (Jam)</label>
                      <input
                        type="number"
                        value={cellForm.totalMh}
                        onChange={(e) => setCellForm((prev) => ({ ...prev, totalMh: Number(e.target.value) }))}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Label Keterangan Libur</label>
                  <select
                    value={cellForm.offLabel}
                    onChange={(e) =>
                      setCellForm((prev) => ({
                        ...prev,
                        offLabel: e.target.value,
                        statusType: e.target.value.includes('PH') ? 'PH_OFF' : 'DAYOFF',
                      }))
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="ADD DAYOFF">ADD DAYOFF</option>
                    <option value="PH OFF TGL 25">PH OFF TGL 25</option>
                    <option value="PH OFF TGL 17">PH OFF TGL 17</option>
                    <option value="REGULAR OFF">REGULAR OFF</option>
                    <option value="CUTI TAHUNAN">CUTI TAHUNAN</option>
                    <option value="IZIN SAKIT">IZIN SAKIT</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditCellModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg"
              >
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
