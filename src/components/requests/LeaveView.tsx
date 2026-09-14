import React, { useState, useMemo } from 'react';
import { useCinema } from '../../context/CinemaContext';
import { LeaveRequest } from '../../types';
import { StatusBadge } from '../ui/Badge';
import { FileUpload } from '../ui/FileUpload';
import {
  CalendarCheck2,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertTriangle,
  Clock,
  Briefcase,
  X,
  Eye,
  FileText,
} from 'lucide-react';

interface LeaveViewProps {
  embedded?: boolean;
}

export const LeaveView: React.FC<LeaveViewProps> = ({ embedded = false }) => {
  const {
    leaveRequests,
    addLeaveRequest,
    updateLeaveStatus,
    currentUser,
    employees,
  } = useCinema();

  const isSupervisorOrManager = currentUser.role === 'ADMIN' || currentUser.role === 'SUPERVISOR';

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [viewAttachment, setViewAttachment] = useState<string | null>(null);
  const [rejectModalData, setRejectModalData] = useState<{ id: string; name: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Form State
  const [leaveType, setLeaveType] = useState<'Annual Leave' | 'Special Leave' | 'Other'>('Annual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [attachment, setAttachment] = useState('');

  // Calculate current user's balance
  const activeEmployeeData = employees.find((e) => e.id === currentUser.id);
  const leaveBalance = activeEmployeeData?.leaveBalance ?? 12;

  // Auto calculate total days
  const calculatedDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, [startDate, endDate]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((req) => {
      const matchSearch =
        req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.leaveType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || req.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [leaveRequests, searchTerm, statusFilter]);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      alert('Tanggal mulai, tanggal selesai, dan alasan cuti wajib diisi.');
      return;
    }
    if (calculatedDays <= 0) {
      alert('Tanggal selesai harus sama atau setelah tanggal mulai.');
      return;
    }
    if (leaveType === 'Annual Leave' && calculatedDays > leaveBalance) {
      if (
        !confirm(
          `Durasi cuti yang diminta (${calculatedDays} hari) melebihi saldo cuti tahunan Anda saat ini (${leaveBalance} hari). Tetap ajukan permohonan untuk pertimbangan khusus manajemen?`
        )
      ) {
        return;
      }
    }

    addLeaveRequest({
      leaveType,
      startDate,
      endDate,
      reason,
      notes,
      attachment: attachment || undefined,
    });

    setIsApplyModalOpen(false);
    setStartDate('');
    setEndDate('');
    setReason('');
    setNotes('');
    setAttachment('');
  };

  const handleApprove = (id: string) => {
    updateLeaveStatus(id, 'APPROVED');
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalData) return;
    updateLeaveStatus(rejectModalData.id, 'REJECTED', rejectionReason || 'Kondisi operasional belum memungkinkan');
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
              <CalendarCheck2 className="w-5 h-5 text-emerald-400" />
              <span>Leave Request (Cuti Karyawan)</span>
            </h3>
          ) : (
            <h2 className="text-xl font-bold text-slate-100">Leave Request (Cuti Karyawan)</h2>
          )}
          <p className="text-xs text-slate-400 mt-0.5">
            Pengajuan cuti tahunan, cuti khusus, dan tracking saldo cuti staf bioskop
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsApplyModalOpen(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Ajukan Permohonan Cuti
        </button>
      </div>

      {/* Saldo Cuti Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-200">Saldo Cuti Anda Saat Ini</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tersisa <strong className="text-emerald-400 font-bold text-sm">{leaveBalance} Hari</strong> hak cuti tahunan
              untuk periode kalender berjalan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
            Total Pengajuan: <strong className="text-white">{leaveRequests.length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
            Pending: <strong className="text-amber-400">{leaveRequests.filter((r) => r.status === 'PENDING').length}</strong>
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama karyawan, tipe cuti, atau alasan..."
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

      {/* Leave Requests Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Karyawan</th>
                <th className="p-3.5">Tipe Cuti</th>
                <th className="p-3.5">Rentang Tanggal</th>
                <th className="p-3.5">Durasi</th>
                <th className="p-3.5">Alasan Permohonan</th>
                <th className="p-3.5">Dokumen</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Aksi Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Tidak ada pengajuan cuti yang sesuai
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <p className="font-semibold text-slate-100">{req.employeeName}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{req.employeeId}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                        {req.leaveType}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 font-medium text-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{req.startDate} s/d {req.endDate}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-amber-400 text-xs">{req.totalDays} Hari</span>
                    </td>
                    <td className="p-3.5">
                      <p className="text-slate-200 font-medium">{req.reason}</p>
                      {req.notes && <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">{req.notes}</p>}
                    </td>
                    <td className="p-3.5">
                      {req.attachment ? (
                        <button
                          type="button"
                          onClick={() => setViewAttachment(req.attachment!)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-700 hover:border-slate-600 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat Dokumen</span>
                        </button>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Tidak ada dokumen</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={req.status} size="sm" />
                      {req.rejectionReason && (
                        <p className="text-[10px] text-rose-400 mt-1 italic">
                          Tolak: {req.rejectionReason}
                        </p>
                      )}
                    </td>
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

      {/* Modal Apply Leave */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto scrollbar-none">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850 shrink-0">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <CalendarCheck2 className="w-5 h-5 text-emerald-400" />
                <span>Formulir Pengajuan Cuti</span>
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Tipe Cuti</label>
                    <select
                      value={leaveType}
                      onChange={(e: any) => setLeaveType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="Annual Leave">Annual Leave (Tahunan)</option>
                      <option value="Special Leave">Special Leave (Pernikahan/Duka)</option>
                      <option value="Other">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Sisa Saldo</label>
                    <div className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-emerald-400">
                      {leaveBalance} Hari Tersedia
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                      Mulai Cuti <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                    >
                    </input>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                      Selesai Cuti <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Total Hari Display */}
                {calculatedDays > 0 && (
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-slate-300">Total Durasi Cuti:</span>
                    <span className="text-sm font-extrabold text-emerald-400">{calculatedDays} Hari Kerja</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Alasan Permohonan Cuti <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: Keperluan keluarga di luar kota, acara pernikahan..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Catatan Pendelegasian Tugas
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Rekan pengganti tugas harian selama cuti..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Upload Dokumen Cuti */}
                <FileUpload
                  label="Dokumen / Lampiran Pendukung Cuti (Opsional)"
                  value={attachment}
                  onChange={setAttachment}
                  helpText="Unggah surat izin, bukti tiket dinas/acara keluarga, undangan, atau dokumen pendukung lainnya"
                />
              </div>

              <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-850/95 flex justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all"
                >
                  Kirim Pengajuan Cuti
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
                <span>Alasan Penolakan Cuti</span>
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
                Memberikan alasan penolakan cuti untuk <strong className="text-white">{rejectModalData.name}</strong>:
              </p>

              <div>
                <textarea
                  rows={3}
                  required
                  placeholder="Misal: Bertabrakan dengan jadwal rilis blockbuster, kebutuhan staffing penuh..."
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

      {/* Modal Preview Dokumen Cuti */}
      {viewAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-4 relative shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                Lampiran Dokumen Cuti
              </span>
              <button
                type="button"
                onClick={() => setViewAttachment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {viewAttachment.startsWith('data:image') || viewAttachment.startsWith('http') || viewAttachment.startsWith('/') ? (
              <img
                src={viewAttachment}
                alt="Dokumen Cuti"
                className="w-full max-h-[70vh] object-contain rounded-xl border border-slate-800"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="p-6 bg-slate-800 rounded-xl text-center">
                <p className="text-xs text-slate-300 mb-3">File dokumen berhasil dilampirkan.</p>
                <a
                  href={viewAttachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold shadow-md"
                >
                  Buka / Tampilkan Dokumen
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
