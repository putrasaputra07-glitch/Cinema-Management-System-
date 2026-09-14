import React, { useState, useMemo } from 'react';
import { useCinema } from '../../context/CinemaContext';
import { SickLeaveRequest } from '../../types';
import { StatusBadge } from '../ui/Badge';
import { FileUpload } from '../ui/FileUpload';
import {
  Stethoscope,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertTriangle,
  FileText,
  Eye,
  X,
  Camera,
} from 'lucide-react';

interface SickLeaveViewProps {
  embedded?: boolean;
}

export const SickLeaveView: React.FC<SickLeaveViewProps> = ({ embedded = false }) => {
  const {
    sickLeaveRequests,
    addSickLeaveRequest,
    updateSickLeaveStatus,
    currentUser,
  } = useCinema();

  const isSupervisorOrManager = currentUser.role === 'ADMIN' || currentUser.role === 'SUPERVISOR';

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [viewDoctorCert, setViewDoctorCert] = useState<string | null>(null);
  const [rejectModalData, setRejectModalData] = useState<{ id: string; name: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Form State
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [medicalCertificate, setMedicalCertificate] = useState('');
  const [notes, setNotes] = useState('');

  // Filter requests
  const filteredRequests = useMemo(() => {
    return sickLeaveRequests.filter((req) => {
      const matchSearch =
        req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || req.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [sickLeaveRequests, searchTerm, statusFilter]);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      alert('Tanggal mulai, tanggal selesai, dan diagnosa alasan sakit wajib diisi.');
      return;
    }
    if (!medicalCertificate) {
      alert('Surat Keterangan Dokter (SKD) atau resep dokter wajib diunggah sebagai bukti sah.');
      return;
    }

    addSickLeaveRequest({
      dateStart: startDate,
      dateEnd: endDate,
      reason,
      description: description || 'Izin istirahat sakit',
      medicalCertificate,
      notes,
    });

    setIsApplyModalOpen(false);
    setReason('');
    setDescription('');
    setMedicalCertificate('');
    setNotes('');
  };

  const handleApprove = (id: string) => {
    updateSickLeaveStatus(id, 'APPROVED');
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalData) return;
    updateSickLeaveStatus(rejectModalData.id, 'REJECTED', rejectionReason || 'Bukti medis tidak memenuhi syarat');
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
              <Stethoscope className="w-5 h-5 text-rose-400" />
              <span>Izin Sakit & Surat Dokter (Sick Leave)</span>
            </h3>
          ) : (
            <h2 className="text-xl font-bold text-slate-100">Izin Sakit & Surat Dokter (Sick Leave)</h2>
          )}
          <p className="text-xs text-slate-400 mt-0.5">
            Pelaporan sakit Cinema Crew bioskop disertai bukti surat dokter resmi dan verifikasi audit
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsApplyModalOpen(true)}
          className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Ajukan Izin Sakit
        </button>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/20 shrink-0 mt-0.5 sm:mt-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200">Ketentuan Klaim Izin Sakit</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Setiap pengajuan izin sakit wajib melampirkan foto/scan Surat Keterangan Dokter (SKD) resmi klinik/rumah sakit untuk verifikasi payroll.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs shrink-0 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 whitespace-nowrap">
            Total Kasus: <strong className="text-white">{sickLeaveRequests.length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 whitespace-nowrap">
            Pending: <strong className="text-amber-400">{sickLeaveRequests.filter((r) => r.status === 'PENDING').length}</strong>
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama karyawan atau diagnosa sakit..."
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

      {/* Sick Leave Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Karyawan</th>
                <th className="p-3.5">Periode Sakit</th>
                <th className="p-3.5">Diagnosa Sakit</th>
                <th className="p-3.5">Surat Dokter</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Tanggal Lapor</th>
                <th className="p-3.5 text-right">Aksi Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Tidak ada catatan izin sakit yang sesuai
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
                      <div className="flex items-center gap-1.5 font-medium text-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-rose-400" />
                        <span>{req.dateStart} s/d {req.dateEnd}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <p className="text-slate-100 font-bold">{req.reason}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{req.description}</p>
                    </td>
                    <td className="p-3.5">
                      {req.medicalCertificate ? (
                        <button
                          type="button"
                          onClick={() => setViewDoctorCert(req.medicalCertificate)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-amber-400 border border-slate-700 hover:border-slate-600 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat Surat Dokter</span>
                        </button>
                      ) : (
                        <span className="text-slate-500 italic">Tidak ada bukti</span>
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

      {/* Modal Apply Sick Leave */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto scrollbar-none">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850 shrink-0">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-rose-400" />
                <span>Izin Sakit</span>
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
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                      Mulai Sakit <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                      Sampai Tanggal <span className="text-rose-400">*</span>
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

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Diagnosa / Alasan Sakit <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: Demam berdarah, tipes, radang tenggorokan akut..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Deskripsi Gejala & Anjuran Dokter
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Anjuran istirahat total / rawat jalan oleh dokter pemeriksa..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Upload Surat Dokter */}
                <FileUpload
                  label="Surat Keterangan Sakit dari Dokter (Wajib)"
                  required
                  value={medicalCertificate}
                  onChange={setMedicalCertificate}
                  helpText="Unggah foto atau scan surat keterangan dokter resmi atau resep obat"
                />

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Catatan Tambahan
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Catatan pendelegasian shift jika ada..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
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
                  Kembali
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl text-xs shadow-md transition-all"
                >
                  Kirim Permohonan Izin Sakit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Preview Surat Dokter */}
      {viewDoctorCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-4 relative shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="text-xs font-bold text-slate-200">Surat Keterangan Dokter (SKD)</span>
              <button
                type="button"
                onClick={() => setViewDoctorCert(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={viewDoctorCert}
              alt="Surat Dokter"
              className="w-full max-h-[70vh] object-contain rounded-xl border border-slate-800"
              referrerPolicy="no-referrer"
            />
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
                <span>Alasan Penolakan Izin Sakit</span>
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
                Memberikan alasan penolakan izin sakit untuk <strong className="text-white">{rejectModalData.name}</strong>:
              </p>

              <div>
                <textarea
                  rows={3}
                  required
                  placeholder="Misal: Surat dokter tidak memiliki kop/stempel resmi, tanggal surat tidak sesuai..."
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
