import React, { useState, useMemo } from 'react';
import { useCinema } from '../../context/CinemaContext';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  Printer,
  FileSpreadsheet,
  Building2,
  Users,
  Package,
  Zap,
  Sparkles,
  CheckCircle2,
  HardDrive,
} from 'lucide-react';
import { googleDriveService } from '../../services/googleDriveService';
import { getAccessToken } from '../../services/googleAuth';

export const ReportsView: React.FC = () => {
  const {
    employees,
    inventory,
    utilityReports,
    cleaningReports,
    offDayRequests,
    leaveRequests,
    sickLeaveRequests,
    transactions,
    currentUser,
    addToast,
    logActivity,
    setCurrentTab,
  } = useCinema();

  const [isSavingToDrive, setIsSavingToDrive] = useState(false);

  // Selected Report Category
  const [reportType, setReportType] = useState<'attendance' | 'inventory' | 'utility' | 'cleaning'>('utility');

  // Date filters
  const [startDate, setStartDate] = useState('2026-03-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Utility calculations
  const elecReports = utilityReports.filter((u) => u.type === 'ELECTRICITY');
  const waterReports = utilityReports.filter((u) => u.type === 'WATER');
  const totalElec = elecReports.reduce((a, b) => a + b.usage, 0);
  const totalWater = waterReports.reduce((a, b) => a + b.usage, 0);

  // Leave & Attendance totals
  const totalOffApproved = offDayRequests.filter((r) => r.status === 'APPROVED').length;
  const totalLeaveApproved = leaveRequests.filter((r) => r.status === 'APPROVED').length;
  const totalSickApproved = sickLeaveRequests.filter((r) => r.status === 'APPROVED').length;

  // Handle Export / Download
  const handleExportCsv = () => {
    let headers: string[] = [];
    let rows: any[] = [];
    let filename = `laporan_cinema_${reportType}_${startDate}_${endDate}.csv`;

    if (reportType === 'utility') {
      headers = ['Tanggal', 'Tipe', 'Meter Awal', 'Meter Akhir', 'Pemakaian', 'Satuan', 'PIC'];
      rows = utilityReports.map((u) => [u.date, u.type, u.meterStart, u.meterEnd, u.usage, u.unit, `"${u.submittedByName}"`]);
    } else if (reportType === 'inventory') {
      headers = ['Kode Item', 'Nama Item', 'Kategori', 'Stok Saat Ini', 'Satuan', 'Status', 'Lokasi'];
      rows = inventory.map((i) => [i.itemCode, `"${i.itemName}"`, `"${i.category}"`, i.currentStock, i.unit, i.status, `"${i.location}"`]);
    } else if (reportType === 'attendance') {
      headers = ['Nama Karyawan', 'Tipe Pengajuan', 'Tanggal / Periode', 'Status', 'Alasan'];
      rows = [
        ...offDayRequests.map((r) => [`"${r.employeeName}"`, 'Off Day', r.date, r.status, `"${r.reason}"`]),
        ...leaveRequests.map((r) => [`"${r.employeeName}"`, `Cuti (${r.leaveType})`, `${r.startDate} s/d ${r.endDate}`, r.status, `"${r.reason}"`]),
        ...sickLeaveRequests.map((r) => [`"${r.employeeName}"`, 'Izin Sakit', `${r.dateStart} s/d ${r.dateEnd}`, r.status, `"${r.reason}"`]),
      ];
    } else if (reportType === 'cleaning') {
      headers = ['Tanggal', 'Shift', 'Supervisor', 'Total Area', 'Area Selesai', 'Persentase', 'Status Approval'];
      rows = cleaningReports.map((c) => [c.date, c.shift, `"${c.supervisorName || '-'}"`, c.totalTasks, c.completedTasks, `${c.completionPercentage}%`, c.supervisorApproval]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveToDrive = async () => {
    const token = await getAccessToken();
    if (!token) {
      addToast('Silakan hubungkan akun Google Drive Anda terlebih dahulu.', 'info');
      setCurrentTab('drive');
      return;
    }

    setIsSavingToDrive(true);
    try {
      let headers: string[] = [];
      let rows: any[] = [];
      const filename = `Laporan_Cinema_${reportType.toUpperCase()}_${startDate}_${endDate}.csv`;

      if (reportType === 'utility') {
        headers = ['Tanggal', 'Tipe', 'Meter Awal', 'Meter Akhir', 'Pemakaian', 'Satuan', 'PIC'];
        rows = utilityReports.map((u) => [u.date, u.type, u.meterStart, u.meterEnd, u.usage, u.unit, `"${u.submittedByName}"`]);
      } else if (reportType === 'inventory') {
        headers = ['Kode Item', 'Nama Item', 'Kategori', 'Stok Saat Ini', 'Satuan', 'Status', 'Lokasi'];
        rows = inventory.map((i) => [i.itemCode, `"${i.itemName}"`, `"${i.category}"`, i.currentStock, i.unit, i.status, `"${i.location}"`]);
      } else if (reportType === 'attendance') {
        headers = ['Nama Karyawan', 'Tipe Pengajuan', 'Tanggal / Periode', 'Status', 'Alasan'];
        rows = [
          ...offDayRequests.map((r) => [`"${r.employeeName}"`, 'Off Day', r.date, r.status, `"${r.reason}"`]),
          ...leaveRequests.map((r) => [`"${r.employeeName}"`, `Cuti (${r.leaveType})`, `${r.startDate} s/d ${r.endDate}`, r.status, `"${r.reason}"`]),
          ...sickLeaveRequests.map((r) => [`"${r.employeeName}"`, 'Izin Sakit', `${r.dateStart} s/d ${r.dateEnd}`, r.status, `"${r.reason}"`]),
        ];
      } else if (reportType === 'cleaning') {
        headers = ['Tanggal', 'Shift', 'Supervisor', 'Total Area', 'Area Selesai', 'Persentase', 'Status Approval'];
        rows = cleaningReports.map((c) => [c.date, c.shift, `"${c.supervisorName || '-'}"`, c.totalTasks, c.completedTasks, `${c.completionPercentage}%`, c.supervisorApproval]);
      }

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const uploaded = await googleDriveService.uploadContent(filename, csvContent, 'text/csv');

      addToast(`Laporan berhasil disimpan ke Google Drive (${uploaded.name})`, 'success');
      logActivity('Google Drive', `Simpan laporan ke Google Drive: ${uploaded.name}`);
    } catch (err: any) {
      addToast(err.message || 'Gagal menyimpan laporan ke Google Drive', 'error');
    } finally {
      setIsSavingToDrive(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Reports & Analytics Export</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Laporan rekapitulasi operasional terpadu bioskop siap cetak dan ekspor format CSV/Excel
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            Cetak / PDF
          </button>
          <button
            type="button"
            onClick={handleSaveToDrive}
            disabled={isSavingToDrive}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 hover:border-amber-500/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            title="Simpan salinan laporan langsung ke akun Google Drive"
          >
            <HardDrive className="w-4 h-4" />
            {isSavingToDrive ? 'Menyimpan...' : 'Simpan ke Drive'}
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/15 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Ekspor Excel / CSV
          </button>
        </div>
      </div>

      {/* Module Selector & Date Filters */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => setReportType('utility')}
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              reportType === 'utility'
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-md'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Zap className="w-4 h-4" />
            Laporan Listrik & Air
          </button>

          <button
            type="button"
            onClick={() => setReportType('inventory')}
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              reportType === 'inventory'
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-md'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Package className="w-4 h-4" />
            Laporan Inventaris
          </button>

          <button
            type="button"
            onClick={() => setReportType('attendance')}
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              reportType === 'attendance'
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-md'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Users className="w-4 h-4" />
            Laporan Absensi & Cuti
          </button>

          <button
            type="button"
            onClick={() => setReportType('cleaning')}
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              reportType === 'cleaning'
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-md'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Laporan Daily Cleaning
          </button>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-amber-400" /> Filter Rentang Tanggal:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
            />
            <span className="text-slate-400">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Document Letterhead */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg">
              CP
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">CINEMA OPERATIONS MANAGEMENT SYSTEM</h3>
              <p className="text-xs text-slate-400">CINEPOLIS LIPPO PLAZA SIDOARJO • Internal Operational Audit</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p>Tanggal Cetak: <span className="text-slate-200 font-semibold">{new Date().toLocaleDateString('id-ID')}</span></p>
            <p>Dicetak Oleh: <span className="text-amber-400 font-medium">{currentUser.name} ({currentUser.role})</span></p>
          </div>
        </div>

        {/* Dynamic Report Content based on selection */}
        {reportType === 'utility' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-850 rounded-xl border border-slate-800">
                <p className="text-[11px] text-slate-400">Total Konsumsi Listrik</p>
                <p className="text-lg font-bold text-amber-400 mt-1">{totalElec.toLocaleString()} kWh</p>
              </div>
              <div className="p-3.5 bg-slate-850 rounded-xl border border-slate-800">
                <p className="text-[11px] text-slate-400">Total Konsumsi Air</p>
                <p className="text-lg font-bold text-sky-400 mt-1">{totalWater.toLocaleString()} m³</p>
              </div>
              <div className="p-3.5 bg-slate-850 rounded-xl border border-slate-800">
                <p className="text-[11px] text-slate-400">Rata-rata Listrik / Hari</p>
                <p className="text-lg font-bold text-slate-100 mt-1">
                  {elecReports.length > 0 ? Math.round(totalElec / elecReports.length).toLocaleString() : 0} kWh
                </p>
              </div>
              <div className="p-3.5 bg-slate-850 rounded-xl border border-slate-800">
                <p className="text-[11px] text-slate-400">Rata-rata Air / Hari</p>
                <p className="text-lg font-bold text-slate-100 mt-1">
                  {waterReports.length > 0 ? (totalWater / waterReports.length).toFixed(1) : 0} m³
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-850 text-slate-400 uppercase">
                  <tr>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Tipe</th>
                    <th className="p-3">Meter Awal</th>
                    <th className="p-3">Meter Akhir</th>
                    <th className="p-3">Pemakaian</th>
                    <th className="p-3">PIC Operator</th>
                    <th className="p-3">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {utilityReports.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-850">
                      <td className="p-3 font-semibold">{u.date}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.type === 'ELECTRICITY' ? 'bg-amber-500/20 text-amber-300' : 'bg-sky-500/20 text-sky-300'}`}>
                          {u.type}
                        </span>
                      </td>
                      <td className="p-3 font-mono">{u.meterStart.toLocaleString()}</td>
                      <td className="p-3 font-mono">{u.meterEnd.toLocaleString()}</td>
                      <td className="p-3 font-bold text-amber-400">{u.usage.toLocaleString()} {u.unit}</td>
                      <td className="p-3">{u.submittedByName}</td>
                      <td className="p-3 text-slate-400">{u.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'inventory' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-850 text-slate-400 uppercase">
                  <tr>
                    <th className="p-3">Kode SKU</th>
                    <th className="p-3">Nama Barang</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Stok Saat Ini</th>
                    <th className="p-3">Min / Max</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Lokasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {inventory.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-850">
                      <td className="p-3 font-mono text-amber-400">{i.itemCode}</td>
                      <td className="p-3 font-bold">{i.itemName}</td>
                      <td className="p-3">{i.category}</td>
                      <td className="p-3 font-bold text-slate-100">{i.currentStock} {i.unit}</td>
                      <td className="p-3 text-slate-400">{i.minimumStock} / {i.maximumStock}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${i.status === 'SAFE' ? 'bg-emerald-500/20 text-emerald-300' : i.status === 'LOW_STOCK' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'}`}>
                          {i.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{i.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'attendance' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-850 rounded-xl border border-slate-800">
                <p className="text-[11px] text-slate-400">Total Off Day Disetujui</p>
                <p className="text-lg font-bold text-indigo-400 mt-1">{totalOffApproved} Kasus</p>
              </div>
              <div className="p-3.5 bg-slate-850 rounded-xl border border-slate-800">
                <p className="text-[11px] text-slate-400">Total Cuti Disetujui</p>
                <p className="text-lg font-bold text-emerald-400 mt-1">{totalLeaveApproved} Kasus</p>
              </div>
              <div className="p-3.5 bg-slate-850 rounded-xl border border-slate-800">
                <p className="text-[11px] text-slate-400">Total Izin Sakit</p>
                <p className="text-lg font-bold text-rose-400 mt-1">{totalSickApproved} Kasus</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-850 text-slate-400 uppercase">
                  <tr>
                    <th className="p-3">Nama Karyawan</th>
                    <th className="p-3">Jenis Permohonan</th>
                    <th className="p-3">Tanggal / Rentang</th>
                    <th className="p-3">Alasan</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {offDayRequests.map((r) => (
                    <tr key={r.id}>
                      <td className="p-3 font-semibold">{r.employeeName}</td>
                      <td className="p-3 text-indigo-400 font-medium">Off Day</td>
                      <td className="p-3">{r.date}</td>
                      <td className="p-3 text-slate-300">{r.reason}</td>
                      <td className="p-3 font-bold">{r.status}</td>
                    </tr>
                  ))}
                  {leaveRequests.map((r) => (
                    <tr key={r.id}>
                      <td className="p-3 font-semibold">{r.employeeName}</td>
                      <td className="p-3 text-emerald-400 font-medium">Cuti ({r.leaveType})</td>
                      <td className="p-3">{r.startDate} s/d {r.endDate} ({r.totalDays} Hari)</td>
                      <td className="p-3 text-slate-300">{r.reason}</td>
                      <td className="p-3 font-bold">{r.status}</td>
                    </tr>
                  ))}
                  {sickLeaveRequests.map((r) => (
                    <tr key={r.id}>
                      <td className="p-3 font-semibold">{r.employeeName}</td>
                      <td className="p-3 text-rose-400 font-medium">Izin Sakit</td>
                      <td className="p-3">{r.dateStart} s/d {r.dateEnd}</td>
                      <td className="p-3 text-slate-300">{r.reason}</td>
                      <td className="p-3 font-bold">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'cleaning' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-850 text-slate-400 uppercase">
                  <tr>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Shift</th>
                    <th className="p-3">Supervisor Pemeriksa</th>
                    <th className="p-3">Tugas Selesai</th>
                    <th className="p-3">Persentase</th>
                    <th className="p-3">Approval Supervisor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {cleaningReports.map((c) => (
                    <tr key={c.id}>
                      <td className="p-3 font-semibold">{c.date}</td>
                      <td className="p-3 font-bold text-amber-400">{c.shift}</td>
                      <td className="p-3">{c.supervisorName || '-'}</td>
                      <td className="p-3">{c.completedTasks} / {c.totalTasks}</td>
                      <td className="p-3 font-bold text-emerald-400">{c.completionPercentage}%</td>
                      <td className="p-3 font-bold">{c.supervisorApproval}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sign-off footer */}
        <div className="pt-8 border-t border-slate-800 grid grid-cols-2 text-center text-xs text-slate-400">
          <div>
            <p>Dipersiapkan Oleh,</p>
            <div className="h-16" />
            <p className="font-bold text-slate-200">{currentUser.name}</p>
            <p className="text-[10px] text-slate-500">{currentUser.position}</p>
          </div>
          <div>
            <p>Mengetahui,</p>
            <div className="h-16" />
            <p className="font-bold text-slate-200">Cinema Manager</p>
            <p className="text-[10px] text-slate-500">CINEPOLIS LIPPO PLAZA SIDOARJO</p>
          </div>
        </div>
      </div>
    </div>
  );
};
