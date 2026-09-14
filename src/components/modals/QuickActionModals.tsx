import React, { useState, useEffect } from 'react';
import { useCinema } from '../../context/CinemaContext';
import { FileUpload } from '../ui/FileUpload';
import { X, Zap, Sparkles, Package, CalendarOff, CalendarCheck2, Stethoscope, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const QuickActionModals: React.FC = () => {
  const {
    activeQuickAction,
    setActiveQuickAction,
    currentUser,
    inventory,
    recordStockTransaction,
    addUtilityReport,
    utilityReports,
    addOffDayRequest,
    addLeaveRequest,
    addSickLeaveRequest,
    cleaningReports,
    updateCleaningTask,
    setCurrentTab,
    showToast,
  } = useCinema();

  // Electricity state
  const [elecDate, setElecDate] = useState(new Date().toISOString().split('T')[0]);
  const [elecStart, setElecStart] = useState('');
  const [elecEnd, setElecEnd] = useState('');
  const [elecPhoto, setElecPhoto] = useState('');
  const [elecNotes, setElecNotes] = useState('');

  // Water state
  const [waterDate, setWaterDate] = useState(new Date().toISOString().split('T')[0]);
  const [waterStart, setWaterStart] = useState('');
  const [waterEnd, setWaterEnd] = useState('');
  const [waterPhoto, setWaterPhoto] = useState('');
  const [waterNotes, setWaterNotes] = useState('');

  // Auto-sync and lock meter awal based on last report
  useEffect(() => {
    if (activeQuickAction === 'electricity_report') {
      const latestElec = utilityReports
        .filter((u) => u.type === 'ELECTRICITY')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      setElecStart(latestElec ? String(latestElec.meterEnd) : '0');
    } else if (activeQuickAction === 'water_report') {
      const latestWater = utilityReports
        .filter((u) => u.type === 'WATER')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      setWaterStart(latestWater ? String(latestWater.meterEnd) : '0');
    }
  }, [activeQuickAction, utilityReports]);

  // Stock In / Out state
  const [stockItemId, setStockItemId] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [stockNotes, setStockNotes] = useState('');

  // Off Day state
  const [offDate, setOffDate] = useState('');
  const [offReason, setOffReason] = useState('');
  const [offNotes, setOffNotes] = useState('');

  // Leave state
  const [leaveType, setLeaveType] = useState<'Annual Leave' | 'Special Leave' | 'Other'>('Annual Leave');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveNotes, setLeaveNotes] = useState('');
  const [leaveAttachment, setLeaveAttachment] = useState('');

  // Sick Leave state
  const [sickStart, setSickStart] = useState(new Date().toISOString().split('T')[0]);
  const [sickEnd, setSickEnd] = useState(new Date().toISOString().split('T')[0]);
  const [sickReason, setSickReason] = useState('');
  const [sickDesc, setSickDesc] = useState('');
  const [sickCert, setSickCert] = useState('');
  const [sickNotes, setSickNotes] = useState('');

  if (!activeQuickAction) return null;

  const closeModal = () => setActiveQuickAction(null);

  // Submit handlers
  const handleElectricitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = parseFloat(elecStart);
    const end = parseFloat(elecEnd);
    if (isNaN(start) || isNaN(end) || end < start) {
      alert('Meter akhir harus lebih besar atau sama dengan meter awal.');
      return;
    }
    if (!elecPhoto) {
      alert('Foto bukti meteran listrik wajib diunggah.');
      return;
    }
    addUtilityReport({
      type: 'ELECTRICITY',
      date: elecDate,
      meterStart: start,
      meterEnd: end,
      unit: 'kWh',
      photoMeter: elecPhoto,
      notes: elecNotes,
      submittedBy: currentUser.id,
      submittedByName: currentUser.name,
    });
    closeModal();
    setCurrentTab('utility');
  };

  const handleWaterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = parseFloat(waterStart);
    const end = parseFloat(waterEnd);
    if (isNaN(start) || isNaN(end) || end < start) {
      alert('Meter akhir harus lebih besar atau sama dengan meter awal.');
      return;
    }
    if (!waterPhoto) {
      alert('Foto bukti meteran air wajib diunggah.');
      return;
    }
    addUtilityReport({
      type: 'WATER',
      date: waterDate,
      meterStart: start,
      meterEnd: end,
      unit: 'm³',
      photoMeter: waterPhoto,
      notes: waterNotes,
      submittedBy: currentUser.id,
      submittedByName: currentUser.name,
    });
    closeModal();
    setCurrentTab('utility');
  };

  const handleStockInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockItemId || !stockQty || parseFloat(stockQty) <= 0) {
      alert('Pilih item barang dan isi kuantitas yang valid.');
      return;
    }
    recordStockTransaction({
      itemId: stockItemId,
      type: 'STOCK_IN',
      quantity: parseFloat(stockQty),
      notes: stockNotes || 'Penerimaan barang operasional',
    });
    closeModal();
    setCurrentTab('inventory');
  };

  const handleStockOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockItemId || !stockQty || parseFloat(stockQty) <= 0) {
      alert('Pilih item barang dan isi kuantitas yang valid.');
      return;
    }
    recordStockTransaction({
      itemId: stockItemId,
      type: 'STOCK_OUT',
      quantity: parseFloat(stockQty),
      notes: stockNotes || 'Pengeluaran barang operasional',
    });
    closeModal();
    setCurrentTab('inventory');
  };

  const handleOffDaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offDate || !offReason.trim()) {
      alert('Tanggal dan alasan pengajuan wajib diisi.');
      return;
    }
    addOffDayRequest({
      date: offDate,
      reason: offReason,
      notes: offNotes,
    });
    closeModal();
    setCurrentTab('off-day');
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStart || !leaveEnd || !leaveReason.trim()) {
      alert('Tanggal mulai, tanggal selesai, dan alasan cuti wajib diisi.');
      return;
    }
    addLeaveRequest({
      leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      reason: leaveReason,
      notes: leaveNotes,
      attachment: leaveAttachment || undefined,
    });
    setLeaveAttachment('');
    closeModal();
    setCurrentTab('leave');
  };

  const handleSickLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sickStart || !sickEnd || !sickReason.trim()) {
      alert('Tanggal sakit dan alasan sakit wajib diisi.');
      return;
    }
    if (!sickCert) {
      alert('Surat keterangan sakit dari dokter wajib diunggah.');
      return;
    }
    addSickLeaveRequest({
      dateStart: sickStart,
      dateEnd: sickEnd,
      reason: sickReason,
      description: sickDesc || 'Izin istirahat sakit',
      medicalCertificate: sickCert,
      notes: sickNotes,
    });
    closeModal();
    setCurrentTab('sick-leave');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl my-8 shadow-2xl overflow-hidden relative">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
              {activeQuickAction === 'electricity_report' && <Zap className="w-5 h-5 text-amber-400" />}
              {activeQuickAction === 'water_report' && <Zap className="w-5 h-5 text-sky-400" />}
              {activeQuickAction === 'stock_in' && <ArrowDownLeft className="w-5 h-5 text-emerald-400" />}
              {activeQuickAction === 'stock_out' && <ArrowUpRight className="w-5 h-5 text-amber-400" />}
              {activeQuickAction === 'off_day_request' && <CalendarOff className="w-5 h-5 text-indigo-400" />}
              {activeQuickAction === 'leave_request' && <CalendarCheck2 className="w-5 h-5 text-emerald-400" />}
              {activeQuickAction === 'sick_leave' && <Stethoscope className="w-5 h-5 text-rose-400" />}
              {activeQuickAction === 'daily_cleaning' && <Sparkles className="w-5 h-5 text-amber-400" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">
                {activeQuickAction === 'electricity_report' && 'Input Laporan Meter Listrik'}
                {activeQuickAction === 'water_report' && 'Input Laporan Meter Air'}
                {activeQuickAction === 'stock_in' && 'Stock In (Penerimaan Barang)'}
                {activeQuickAction === 'stock_out' && 'Stock Out (Pengeluaran Barang)'}
                {activeQuickAction === 'off_day_request' && 'Request OFF Day'}
                {activeQuickAction === 'leave_request' && 'Formulir Pengajuan Cuti'}
                {activeQuickAction === 'sick_leave' && 'Izin Sakit'}
                {activeQuickAction === 'daily_cleaning' && 'Quick Checklist Daily Cleaning'}
              </h3>
              <p className="text-xs text-slate-400">Cinema Operations • {currentUser.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body depending on Action */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* 1. Electricity Report */}
          {activeQuickAction === 'electricity_report' && (
            <form onSubmit={handleElectricitySubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={elecDate}
                    onChange={(e) => setElecDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Satuan</label>
                  <input
                    type="text"
                    disabled
                    value="Kilowatt-Hour (kWh)"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Meter Awal</label>
                  <input
                    type="number"
                    step="any"
                    required
                    readOnly
                    placeholder="Contoh: 184520"
                    value={elecStart}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-300 focus:outline-none cursor-not-allowed select-none"
                  />
                  <span className="text-[10px] text-slate-500">Angka meter akhir hari sebelumnya (Terkunci)</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Meter Akhir</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Contoh: 186350"
                    value={elecEnd}
                    onChange={(e) => setElecEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Realtime Usage Calculation Display */}
              {elecStart && elecEnd && parseFloat(elecEnd) >= parseFloat(elecStart) && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-300">Estimasi Pemakaian Listrik (kWh):</span>
                  <span className="text-base font-bold text-amber-400">
                    {(parseFloat(elecEnd) - parseFloat(elecStart)).toLocaleString()} kWh
                  </span>
                </div>
              )}

              <FileUpload
                label="Foto Bukti Meter Listrik (Wajib)"
                required
                value={elecPhoto}
                onChange={setElecPhoto}
                helpText="Ambil foto meter panel listrik utama gedung cinema"
              />

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Catatan Operasional</label>
                <textarea
                  rows={2}
                  placeholder="Kondisi AC studio, beban puncak saat film blockbuster, dll."
                  value={elecNotes}
                  onChange={(e) => setElecNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-slate-300 hover:text-white rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-md transition-all"
                >
                  Simpan Laporan Listrik
                </button>
              </div>
            </form>
          )}

          {/* 2. Water Report */}
          {activeQuickAction === 'water_report' && (
            <form onSubmit={handleWaterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={waterDate}
                    onChange={(e) => setWaterDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Satuan</label>
                  <input
                    type="text"
                    disabled
                    value="Meter Kubik (m³)"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Meter Awal</label>
                  <input
                    type="number"
                    step="any"
                    required
                    readOnly
                    placeholder="Contoh: 14210"
                    value={waterStart}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-300 focus:outline-none cursor-not-allowed select-none"
                  />
                  <span className="text-[10px] text-slate-500">Angka meter akhir hari sebelumnya (Terkunci)</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Meter Akhir</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Contoh: 14258"
                    value={waterEnd}
                    onChange={(e) => setWaterEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {waterStart && waterEnd && parseFloat(waterEnd) >= parseFloat(waterStart) && (
                <div className="p-3 bg-sky-500/10 border border-sky-500/25 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-300">Estimasi Pemakaian Air (m³):</span>
                  <span className="text-base font-bold text-sky-400">
                    {(parseFloat(waterEnd) - parseFloat(waterStart)).toLocaleString()} m³
                  </span>
                </div>
              )}

              <FileUpload
                label="Foto Bukti Meter Air (Wajib)"
                required
                value={waterPhoto}
                onChange={setWaterPhoto}
                helpText="Ambil foto angka jarum/digit meteran air gedung"
              />

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Catatan Operasional</label>
                <textarea
                  rows={2}
                  placeholder="Kondisi pompa booster, flushing toilet pengunjung, dll."
                  value={waterNotes}
                  onChange={(e) => setWaterNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-slate-300 hover:text-white rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-sm shadow-md transition-all"
                >
                  Simpan Laporan Air
                </button>
              </div>
            </form>
          )}

          {/* 3. Stock In */}
          {activeQuickAction === 'stock_in' && (
            <form onSubmit={handleStockInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Pilih Item Barang</label>
                <select
                  required
                  value={stockItemId}
                  onChange={(e) => setStockItemId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                >
                  <option value="">-- Pilih Barang dari Daftar --</option>
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.itemCode}] {item.itemName} (Stok: {item.currentStock} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Jumlah Masuk (Kuantitas)</label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  required
                  placeholder="Jumlah penambahan stok..."
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">No. Surat Jalan / PO / Catatan</label>
                <textarea
                  rows={2}
                  placeholder="Nomor PO, nama supplier atau keterangan penerimaan barang..."
                  value={stockNotes}
                  onChange={(e) => setStockNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-slate-300 hover:text-white rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm shadow-md transition-all"
                >
                  Konfirmasi Stock In
                </button>
              </div>
            </form>
          )}

          {/* 4. Stock Out */}
          {activeQuickAction === 'stock_out' && (
            <form onSubmit={handleStockOutSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Pilih Item Barang</label>
                <select
                  required
                  value={stockItemId}
                  onChange={(e) => setStockItemId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                >
                  <option value="">-- Pilih Barang dari Daftar --</option>
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.itemCode}] {item.itemName} (Stok Saat Ini: {item.currentStock} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Jumlah Pengeluaran</label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  required
                  placeholder="Jumlah item yang dikeluarkan..."
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Tujuan Pengeluaran / PIC</label>
                <textarea
                  rows={2}
                  placeholder="Keperluan (misal: concession bar, janitor room, usher hall 1-3)..."
                  value={stockNotes}
                  onChange={(e) => setStockNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-slate-300 hover:text-white rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-md transition-all"
                >
                  Konfirmasi Stock Out
                </button>
              </div>
            </form>
          )}

          {/* 5. Off Day Request */}
          {activeQuickAction === 'off_day_request' && (
            <form onSubmit={handleOffDaySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Nama Pemohon</label>
                <input
                  type="text"
                  disabled
                  value={`${currentUser.name} (${currentUser.position})`}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Tanggal Off Day</label>
                <input
                  type="date"
                  required
                  value={offDate}
                  onChange={(e) => setOffDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Alasan Pengajuan</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Keperluan keluarga, urusan administrasi, tukar shift..."
                  value={offReason}
                  onChange={(e) => setOffReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Sebutkan rekan kerja pengganti bila ada kesepakatan swap shift..."
                  value={offNotes}
                  onChange={(e) => setOffNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-slate-300 hover:text-white rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl text-sm shadow-md transition-all"
                >
                  Kirim Request Off Day
                </button>
              </div>
            </form>
          )}

          {/* 6. Leave Request */}
          {activeQuickAction === 'leave_request' && (
            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Tipe Cuti</label>
                  <select
                    value={leaveType}
                    onChange={(e: any) => setLeaveType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Annual Leave">Annual Leave (Cuti Tahunan)</option>
                    <option value="Special Leave">Special Leave (Pernikahan/Duka)</option>
                    <option value="Other">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Sisa Saldo Cuti</label>
                  <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs font-semibold text-emerald-300">
                    Tersedia 12 Hari Cuti
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Mulai Cuti</label>
                  <input
                    type="date"
                    required
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Sampai Tanggal</label>
                  <input
                    type="date"
                    required
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Alasan Cuti</label>
                <input
                  type="text"
                  required
                  placeholder="Keterangan permohonan cuti..."
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Rencana pendelegasian tugas operasional..."
                  value={leaveNotes}
                  onChange={(e) => setLeaveNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Upload Dokumen Cuti */}
              <FileUpload
                label="Dokumen Lampiran Cuti (Opsional)"
                value={leaveAttachment}
                onChange={setLeaveAttachment}
                helpText="Unggah surat izin, bukti tiket, undangan, atau berkas pendukung (JPG, PNG, atau PDF)"
              />

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-slate-300 hover:text-white rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm shadow-md transition-all"
                >
                  Ajukan Cuti
                </button>
              </div>
            </form>
          )}

          {/* 7. Sick Leave */}
          {activeQuickAction === 'sick_leave' && (
            <form onSubmit={handleSickLeaveSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Tanggal Mulai Sakit</label>
                  <input
                    type="date"
                    required
                    value={sickStart}
                    onChange={(e) => setSickStart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Sampai Tanggal</label>
                  <input
                    type="date"
                    required
                    value={sickEnd}
                    onChange={(e) => setSickEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Diagnosa / Alasan Sakit</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Demam tinggi, flu berat, tipes, cedera fisik..."
                  value={sickReason}
                  onChange={(e) => setSickReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Deskripsi & Anjuran Dokter</label>
                <textarea
                  rows={2}
                  placeholder="Anjuran istirahat rawat jalan selama ... hari..."
                  value={sickDesc}
                  onChange={(e) => setSickDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <FileUpload
                label="Surat Keterangan Dokter / Bukti Medis (Wajib)"
                required
                value={sickCert}
                onChange={setSickCert}
                helpText="Unggah foto atau scan surat keterangan dokter (JPG/PNG/PDF)"
              />

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-slate-300 hover:text-white rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl text-sm shadow-md transition-all"
                >
                  Kirim Izin Sakit
                </button>
              </div>
            </form>
          )}

          {/* 8. Daily Cleaning Quick Action */}
          {activeQuickAction === 'daily_cleaning' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Anda dapat langsung mengakses checklist operasional seluruh area cinema (Lobby, Toilet, Corridor, Cinema Hall, Seat, Concession, dll.) untuk shift aktif hari ini.
              </p>
              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-slate-200">
                    Laporan Kebersihan Hari Ini ({new Date().toLocaleDateString('id-ID')})
                  </p>
                  <p className="text-xs text-amber-400">
                    {cleaningReports[0]?.completionPercentage || 0}% Selesai ({cleaningReports[0]?.completedTasks || 0}/{cleaningReports[0]?.totalTasks || 0} Area)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeModal();
                    setCurrentTab('cleaning');
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Buka Halaman Checklist
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
