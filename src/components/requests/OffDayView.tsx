import React, { useState, useMemo } from 'react';
import { useCinema } from '../../context/CinemaContext';
import { OffDayRequest, ApprovalStatus } from '../../types';
import { StatusBadge } from '../ui/Badge';
import {
  CalendarOff,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  AlertTriangle,
  X,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

interface OffDayViewProps {
  embedded?: boolean;
}

export const OffDayView: React.FC<OffDayViewProps> = ({ embedded = false }) => {
  const {
    offDayRequests,
    addOffDayRequest,
    updateOffDayStatus,
    currentUser,
    employees,
  } = useCinema();

  const isSupervisorOrManager = currentUser.role === 'ADMIN' || currentUser.role === 'SUPERVISOR';
  const isCrew = currentUser.role === 'CREW';

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [rejectModalData, setRejectModalData] = useState<{ id: string; name: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Apply Form State
  const [applyDate, setApplyDate] = useState('');
  const [applyReason, setApplyReason] = useState('');
  const [applyNotes, setApplyNotes] = useState('');

  // Filter requests
  const filteredRequests = useMemo(() => {
    return offDayRequests.filter((req) => {
      // If crew, prioritize seeing all or their own, prompt says: "Crew: Pengajuan diri sendiri, status approval"
      const matchSearch =
        req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.reason.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || req.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [offDayRequests, searchTerm, statusFilter]);

  // Quota calculation for chosen date (e.g. Max 2 persons per day)
  const MAX_OFF_PER_DAY = 2;
  const existingOffCountForDate = useMemo(() => {
    if (!applyDate) return 0;
    return offDayRequests.filter(
      (r) => r.date === applyDate && (r.status === 'APPROVED' || r.status === 'PENDING')
    ).length;
  }, [offDayRequests, applyDate]);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyDate || !applyReason.trim()) {
      alert('Tanggal dan alasan pengajuan wajib diisi.');
      return;
    }

    // Validation: Quota off day
    if (existingOffCountForDate >= MAX_OFF_PER_DAY) {
      if (
        !confirm(
          `Peringatan: Pada tanggal ${applyDate} sudah ada ${existingOffCountForDate} orang yang mengajukan/disetujui Off (Maksimal rekomendasi ${MAX_OFF_PER_DAY} orang). Tetap lanjutkan pengajuan untuk dipertimbangkan Manager?`
        )
      ) {
        return;
      }
    }

    addOffDayRequest({
      date: applyDate,
      reason: applyReason,
      notes: applyNotes,
    });

    setIsApplyModalOpen(false);
    setApplyDate('');
    setApplyReason('');
    setApplyNotes('');
  };

  const handleApprove = (id: string) => {
    updateOffDayStatus(id, 'APPROVED');
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalData) return;
    updateOffDayStatus(rejectModalData.id, 'REJECTED', rejectionReason || 'Tidak memenuhi kuota operasional');
    setRejectModalData(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {embedded ? (
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <CalendarOff className="w-5 h-5 text-indigo-400" />
              <span>Off Day Request Management</span>
            </h3>
          ) : (
            <h2 className="text-xl font-bold text-slate-100">Off Day Request Management</h2>
          )}
          <p className="text-xs text-slate-400 mt-0.5">
            Pengajuan libur dinas, permohonan swap shift antar Cinema Crew, dan approval jadwal
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsApplyModalOpen(true)}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Ajukan Off Day Baru
        </button>
      </div>

      {/* Quota Info Box */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
            <CalendarOff className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-200">Kebijakan Kuota Off Day Operasional</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Maksimal <span className="text-amber-400 font-semibold">{MAX_OFF_PER_DAY} crew</span> off per hari agar tidak mengganggu flow penonton cinema hall.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
            Total Pengajuan: <strong className="text-white">{offDayRequests.length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
            Pending: <strong className="text-amber-400">{offDayRequests.filter((r) => r.status === 'PENDING').length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama staf atau alasan pengajuan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">Menunggu (Pending)</option>
            <option value="APPROVED">Disetujui (Approved)</option>
            <option value="REJECTED">Ditolak (Rejected)</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Tanggal Off Day</th>
                <th className="p-3.5">Nama Karyawan</th>
                <th className="p-3.5">Alasan Pengajuan</th>
                <th className="p-3.5">Status Approval</th>
                <th className="p-3.5">Catatan / Swap</th>
                <th className="p-3.5">Tanggal Dibuat</th>
                <th className="p-3.5 text-right">Aksi Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Tidak ada pengajuan off day yang sesuai
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-100">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{req.date}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold text-slate-100">{req.employeeName}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{req.employeeId}</span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-200">{req.reason}</td>
                    <td className="p-3.5">
                      <StatusBadge status={req.status} size="sm" />
                      {req.rejectionReason && (
                        <p className="text-[10px] text-rose-400 mt-1 italic">
                          Alasan Tolak: {req.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-400 truncate max-w-xs">{req.notes || '-'}</td>
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">{req.created_at}</td>
                    <td className="p-3.5 text-right space-x-1.5">
                      {isSupervisorOrManager && req.status === 'PENDING' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(req.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold inline-flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectModalData({ id: req.id, name: req.employeeName })}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] font-bold inline-flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Tolak
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-medium">
                          {req.status === 'APPROVED' ? 'Disetujui' : req.status === 'REJECTED' ? 'Ditolak' : 'Proses'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Apply Off Day */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto scrollbar-none">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850 shrink-0">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <CalendarOff className="w-5 h-5 text-indigo-400" />
                <span>Request OFF Day</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 scrollbar-none">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Nama Pemohon</label>
                  <input
                    type="text"
                    disabled
                    value={`${currentUser.name} (${currentUser.position})`}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-xs text-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Tanggal Off Day Yang Diminta <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={applyDate}
                    onChange={(e) => setApplyDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                  {applyDate && (
                    <p
                      className={`text-[11px] mt-1 font-medium ${
                        existingOffCountForDate >= MAX_OFF_PER_DAY ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      Status kuota tanggal ini: {existingOffCountForDate} dari {MAX_OFF_PER_DAY} slot terisi.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Alasan Pengajuan <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: Keperluan keluarga, urusan administrasi..."
                    value={applyReason}
                    onChange={(e) => setApplyReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Catatan / Rekan Tukar Shift
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Sebutkan jika ada kesepakatan penggantian shift..."
                    value={applyNotes}
                    onChange={(e) => setApplyNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-850/95 flex justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl text-xs shadow-md transition-all"
                >
                  Kirim Permohonan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Rejection Reason */}
      {rejectModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
              <h3 className="font-bold text-base text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Alasan Penolakan Off Day</span>
              </h3>
              <button
                type="button"
                onClick={() => setRejectModalData(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-300">
                Memberikan alasan penolakan untuk pengajuan <strong className="text-white">{rejectModalData.name}</strong>:
              </p>

              <div>
                <textarea
                  rows={3}
                  required
                  placeholder="Misal: Kuota off sudah penuh, bertepatan dengan weekend film premiere..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRejectModalData(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Konfirmasi Tolak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
