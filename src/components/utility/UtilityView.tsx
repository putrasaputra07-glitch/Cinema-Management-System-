import React, { useState, useMemo } from 'react';
import { useCinema } from '../../context/CinemaContext';
import { UtilityReport, UtilityType } from '../../types';
import { FileUpload } from '../ui/FileUpload';
import {
  Zap,
  Droplets,
  Plus,
  Calendar,
  Camera,
  Download,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Trash2,
  X,
  FileText,
  Clock,
  Eye,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const UtilityView: React.FC = () => {
  const { utilityReports, addUtilityReport, deleteUtilityReport, currentUser, askConfirm } = useCinema();

  const isManager = currentUser.role === 'ADMIN';
  const isSupervisor = currentUser.role === 'SUPERVISOR';

  // Sub module tab: Listrik vs Air
  const [activeType, setActiveType] = useState<UtilityType>('ELECTRICITY');

  // Input Modal state
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    meterStart: '',
    meterEnd: '',
    photoMeter: '',
    notes: '',
  });

  // Filter reports by selected type
  const reportsOfType = useMemo(() => {
    return utilityReports
      .filter((r) => r.type === activeType)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [utilityReports, activeType]);

  // Analytics Metrics
  const totalUsage = useMemo(() => {
    return reportsOfType.reduce((acc, curr) => acc + curr.usage, 0);
  }, [reportsOfType]);

  const averageDaily = useMemo(() => {
    if (reportsOfType.length === 0) return 0;
    return Math.round((totalUsage / reportsOfType.length) * 10) / 10;
  }, [reportsOfType, totalUsage]);

  const highestRecord = useMemo(() => {
    if (reportsOfType.length === 0) return null;
    return [...reportsOfType].sort((a, b) => b.usage - a.usage)[0];
  }, [reportsOfType]);

  // Chart Data (Chronological)
  const chartData = useMemo(() => {
    return [...reportsOfType]
      .reverse()
      .slice(-14)
      .map((r) => ({
        date: r.date.slice(5),
        usage: r.usage,
      }));
  }, [reportsOfType]);

  // Auto-calculated current usage
  const calculatedUsage = useMemo(() => {
    const start = parseFloat(formData.meterStart);
    const end = parseFloat(formData.meterEnd);
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      return Math.round((end - start) * 100) / 100;
    }
    return 0;
  }, [formData.meterStart, formData.meterEnd]);

  // Open modal with smart default meter start based on last report's meterEnd
  const openInputModal = () => {
    const lastReport = reportsOfType[0];
    const defaultStart = lastReport ? String(lastReport.meterEnd) : '0';

    setFormData({
      date: new Date().toISOString().split('T')[0],
      meterStart: defaultStart,
      meterEnd: '',
      photoMeter: '',
      notes: '',
    });
    setIsInputModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = parseFloat(formData.meterStart);
    const end = parseFloat(formData.meterEnd);

    // Validation: Meter Akhir >= Meter Awal
    if (isNaN(start) || isNaN(end) || end < start) {
      alert('Validasi Gagal: Angka meter akhir harus lebih besar atau sama dengan meter awal.');
      return;
    }

    // Validation: Foto bukti meteran wajib
    if (!formData.photoMeter) {
      alert('Validasi Gagal: Foto bukti fisik angka meteran wajib diunggah.');
      return;
    }

    // Validation: Tanggal duplikat
    const isDuplicate = utilityReports.some((r) => r.type === activeType && r.date === formData.date);
    if (isDuplicate) {
      alert(`Validasi Gagal: Laporan ${activeType === 'ELECTRICITY' ? 'Listrik' : 'Air'} untuk tanggal ${formData.date} sudah pernah diinput.`);
      return;
    }

    addUtilityReport({
      type: activeType,
      date: formData.date,
      meterStart: start,
      meterEnd: end,
      unit: activeType === 'ELECTRICITY' ? 'kWh' : 'm³',
      photoMeter: formData.photoMeter,
      notes: formData.notes,
      submittedBy: currentUser.id,
      submittedByName: currentUser.name,
    });

    setIsInputModalOpen(false);
  };

  const handleDelete = (report: UtilityReport) => {
    askConfirm({
      title: 'Hapus Laporan Utilitas',
      message: `Hapus rekaman meteran tanggal ${report.date} (${report.usage} ${report.unit})?`,
      confirmText: 'Hapus Laporan',
      danger: true,
      onConfirm: () => deleteUtilityReport(report.id),
    });
  };

  // Export utility report
  const exportToCsv = () => {
    const headers = ['Tipe Utilitas', 'Tanggal', 'Meter Awal', 'Meter Akhir', 'Pemakaian', 'Satuan', 'Operator', 'Catatan'];
    const rows = reportsOfType.map((r) => [
      r.type,
      r.date,
      r.meterStart,
      r.meterEnd,
      r.usage,
      r.unit,
      `"${r.submittedByName}"`,
      `"${r.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_utilitas_${activeType.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Utility Monitoring</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit harian konsumsi listrik (kWh) dan debit air bersih (m³) gedung bioskop
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {(isManager || isSupervisor) && (
            <button
              type="button"
              onClick={exportToCsv}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-amber-400" />
              Export Data
            </button>
          )}

          <button
            type="button"
            onClick={openInputModal}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all ${
              activeType === 'ELECTRICITY'
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/10'
                : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/10'
            }`}
          >
            <Plus className="w-4 h-4" />
            + Input Meter {activeType === 'ELECTRICITY' ? 'Listrik' : 'Air'}
          </button>
        </div>
      </div>

      {/* Sub-module Switcher (Listrik vs Air) */}
      <div className="grid grid-cols-2 gap-3 max-w-md">
        <button
          type="button"
          onClick={() => setActiveType('ELECTRICITY')}
          className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
            activeType === 'ELECTRICITY'
              ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold shadow-md shadow-amber-500/10'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-100">Penggunaan Listrik (kWh)</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveType('WATER')}
          className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
            activeType === 'WATER'
              ? 'bg-sky-500/15 border-sky-500 text-sky-300 font-bold shadow-md shadow-sky-500/10'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
            <Droplets className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-100">Penggunaan Air (m³)</p>
          </div>
        </button>
      </div>

      {/* 3 Metric Cards: Monthly Total, Daily Avg, Highest Consumption */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Usage */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-400 font-medium">Total Akumulasi Bulan Ini</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-2xl font-black ${activeType === 'ELECTRICITY' ? 'text-amber-400' : 'text-sky-400'}`}>
              {totalUsage.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-300">
              {activeType === 'ELECTRICITY' ? 'kWh' : 'm³'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Berdasarkan {reportsOfType.length} data laporan harian</p>
        </div>

        {/* Daily Average */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-400 font-medium">Rata-rata Konsumsi Harian</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-100">{averageDaily.toLocaleString()}</span>
            <span className="text-xs font-semibold text-slate-300">
              {activeType === 'ELECTRICITY' ? 'kWh / hari' : 'm³ / hari'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Optimal beban pendingin gedung & lampu hall</p>
        </div>

        {/* Highest Consumption */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-400 font-medium">Konsumsi Tertinggi (Peak)</p>
          {highestRecord ? (
            <div className="mt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-rose-400">{highestRecord.usage.toLocaleString()}</span>
                <span className="text-xs font-semibold text-slate-300">{highestRecord.unit}</span>
              </div>
              <p className="text-[11px] text-amber-400 mt-1">
                Tercatat pada {highestRecord.date} (Weekend / Film Blockbuster)
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 mt-2">Belum ada data</p>
          )}
        </div>
      </div>

      {/* Daily Trend Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-sm text-slate-200">
              Grafik Trend Harian ({activeType === 'ELECTRICITY' ? 'Listrik' : 'Air'})
            </h4>
            <p className="text-xs text-slate-400">Pemantauan fluktuasi harian untuk deteksi lonjakan abnormal atau kebocoran</p>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-xl border ${
              activeType === 'ELECTRICITY'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                : 'bg-sky-500/10 text-sky-300 border-sky-500/20'
            }`}
          >
            14 Hari Terakhir
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} opacity={0.4} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                labelStyle={{ color: '#cbd5e1' }}
              />
              <Line
                type="monotone"
                dataKey="usage"
                name={`Pemakaian (${activeType === 'ELECTRICITY' ? 'kWh' : 'm³'})`}
                stroke={activeType === 'ELECTRICITY' ? '#f59e0b' : '#38bdf8'}
                strokeWidth={3}
                dot={{ r: 4, fill: activeType === 'ELECTRICITY' ? '#f59e0b' : '#38bdf8' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reports Table with Photo Proof Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-200">
              Riwayat Laporan Meteran {activeType === 'ELECTRICITY' ? 'Listrik' : 'Air'}
            </h3>
            <p className="text-xs text-slate-400">Daftar rekaman fisik meter harian beserta bukti foto panel</p>
          </div>
          <span className="text-xs text-slate-400">{reportsOfType.length} Data Tercatat</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">Meter Awal</th>
                <th className="p-3.5">Meter Akhir</th>
                <th className="p-3.5">Pemakaian</th>
                <th className="p-3.5">Foto Meteran</th>
                <th className="p-3.5">Operator (Input)</th>
                <th className="p-3.5">Catatan</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {reportsOfType.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Belum ada rekaman laporan untuk tipe ini
                  </td>
                </tr>
              ) : (
                reportsOfType.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-semibold text-slate-100 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {report.date}
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">{report.meterStart.toLocaleString()}</td>
                    <td className="p-3.5 font-mono text-slate-300">{report.meterEnd.toLocaleString()}</td>
                    <td className="p-3.5">
                      <span
                        className={`text-sm font-extrabold ${
                          activeType === 'ELECTRICITY' ? 'text-amber-400' : 'text-sky-400'
                        }`}
                      >
                        {report.usage.toLocaleString()} {report.unit}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {report.photoMeter ? (
                        <button
                          type="button"
                          onClick={() => setSelectedPhotoModal(report.photoMeter)}
                          className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Lihat Foto</span>
                        </button>
                      ) : (
                        <span className="text-slate-500 italic">Tidak ada foto</span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-300">{report.submittedByName}</td>
                    <td className="p-3.5 text-slate-400 truncate max-w-xs">{report.notes || '-'}</td>
                    <td className="p-3.5 text-right">
                      {(isManager || isSupervisor) && (
                        <button
                          type="button"
                          onClick={() => handleDelete(report)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Hapus Laporan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input Data Meteran */}
      {isInputModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl my-8 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                {activeType === 'ELECTRICITY' ? (
                  <Zap className="w-5 h-5 text-amber-400" />
                ) : (
                  <Droplets className="w-5 h-5 text-sky-400" />
                )}
                <span>Input Laporan Meter {activeType === 'ELECTRICITY' ? 'Listrik (kWh)' : 'Air (m³)'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsInputModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Tanggal Pengukuran <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Angka Meter Awal <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    readOnly
                    placeholder="Contoh: 184520"
                    value={formData.meterStart}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none cursor-not-allowed select-none"
                  />
                  <span className="text-[10px] text-slate-500">Angka meter akhir hari sebelumnya (Terkunci)</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Angka Meter Akhir <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Contoh: 186350"
                    value={formData.meterEnd}
                    onChange={(e) => setFormData({ ...formData, meterEnd: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">Angka aktual pada jarum/digit meteran</span>
                </div>
              </div>

              {/* Auto Calculate Display */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  activeType === 'ELECTRICITY'
                    ? 'bg-amber-500/10 border-amber-500/25'
                    : 'bg-sky-500/10 border-sky-500/25'
                }`}
              >
                <div>
                  <p className="text-xs font-semibold text-slate-300">Hasil Perhitungan Pemakaian (Auto Calculate):</p>
                  <p className="text-[10px] text-slate-400">Formula: Meter Akhir - Meter Awal</p>
                </div>
                <span
                  className={`text-lg font-black ${
                    activeType === 'ELECTRICITY' ? 'text-amber-400' : 'text-sky-400'
                  }`}
                >
                  {calculatedUsage.toLocaleString()} {activeType === 'ELECTRICITY' ? 'kWh' : 'm³'}
                </span>
              </div>

              {/* Foto Bukti Meteran (FileUpload with camera) */}
              <FileUpload
                label="Foto Bukti Fisik Meteran (Wajib)"
                required
                value={formData.photoMeter}
                onChange={(photoMeter) => setFormData({ ...formData, photoMeter })}
                helpText="Ambil foto atau upload gambar jarum meteran untuk verifikasi audit"
                showCameraText={true}
              />

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Catatan Operasional (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan penayangan midnight, perawatan genset, flushing toilet, dll."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInputModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all ${
                    activeType === 'ELECTRICITY'
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                  }`}
                >
                  Simpan Laporan {activeType === 'ELECTRICITY' ? 'Listrik' : 'Air'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Photo Viewer */}
      {selectedPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-4 relative shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="text-xs font-bold text-slate-200">Foto Bukti Fisik Meteran Panel</span>
              <button
                type="button"
                onClick={() => setSelectedPhotoModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={selectedPhotoModal}
              alt="Bukti Meteran"
              className="w-full max-h-[70vh] object-contain rounded-xl border border-slate-800"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
