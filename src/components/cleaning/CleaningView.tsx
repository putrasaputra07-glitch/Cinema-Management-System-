import React, { useState, useMemo } from 'react';
import { useCinema } from '../../context/CinemaContext';
import { DailyCleaningReport, CleaningTaskItem, ApprovalStatus } from '../../types';
import { StatusBadge } from '../ui/Badge';
import { FileUpload } from '../ui/FileUpload';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  Camera,
  Search,
  CheckSquare,
  Square,
  Building,
  User,
  ShieldCheck,
  X,
} from 'lucide-react';

export const CleaningView: React.FC = () => {
  const {
    cleaningReports,
    updateCleaningTask,
    updateCleaningReportStatus,
    currentUser,
    employees,
  } = useCinema();

  const isSupervisorOrManager = currentUser.role === 'ADMIN' || currentUser.role === 'SUPERVISOR';

  // Active shift selection ('Pagi' | 'Siang' | 'Malam')
  const [activeShift, setActiveShift] = useState<'Pagi' | 'Siang' | 'Malam'>('Pagi');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Active Report
  const currentReport = useMemo(() => {
    return (
      cleaningReports.find((r) => r.shift === activeShift) ||
      cleaningReports[0] ||
      null
    );
  }, [cleaningReports, activeShift]);

  // Modal inspection / Task update
  const [activeTaskModal, setActiveTaskModal] = useState<CleaningTaskItem | null>(null);
  const [taskDone, setTaskDone] = useState(false);
  const [assignedPic, setAssignedPic] = useState('');
  const [photoEvidence, setPhotoEvidence] = useState('');
  const [findingNotes, setFindingNotes] = useState('');

  // Image zoom viewer
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Filter tasks in active report
  const filteredTasks = useMemo(() => {
    if (!currentReport) return [];
    return currentReport.tasks.filter((task) => {
      const matchSearch =
        task.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.picName && task.picName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchArea = selectedAreaFilter === 'ALL' || task.area === selectedAreaFilter;
      const matchStatus =
        selectedStatusFilter === 'ALL' ||
        (selectedStatusFilter === 'DONE' && task.status === 'DONE') ||
        (selectedStatusFilter === 'NOT_DONE' && task.status === 'NOT_DONE');

      return matchSearch && matchArea && matchStatus;
    });
  }, [currentReport, searchTerm, selectedAreaFilter, selectedStatusFilter]);

  // Unique areas in current report
  const uniqueAreas = useMemo(() => {
    if (!currentReport) return [];
    return Array.from(new Set(currentReport.tasks.map((t) => t.area)));
  }, [currentReport]);

  const openTaskModal = (task: CleaningTaskItem) => {
    setActiveTaskModal(task);
    setTaskDone(task.status === 'DONE');
    setAssignedPic(task.pic || currentUser.id);
    setPhotoEvidence(task.photoEvidence || '');
    setFindingNotes(task.notes || '');
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReport || !activeTaskModal) return;

    const crewObj = employees.find((e) => e.id === assignedPic || e.employeeId === assignedPic);
    const picName = crewObj ? crewObj.fullName : currentUser.name;

    const pad = (n: number) => n.toString().padStart(2, '0');
    const d = new Date();
    const currentTime = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    updateCleaningTask(currentReport.id, activeTaskModal.id, {
      status: taskDone ? 'DONE' : 'NOT_DONE',
      pic: assignedPic,
      picName,
      photoEvidence: photoEvidence || undefined,
      notes: findingNotes || undefined,
      time: taskDone ? currentTime : undefined,
    });

    setActiveTaskModal(null);
  };

  // Quick toggle status button directly in list
  const toggleQuickDone = (task: CleaningTaskItem) => {
    if (!currentReport) return;
    const nextStatus: 'DONE' | 'NOT_DONE' = task.status === 'DONE' ? 'NOT_DONE' : 'DONE';
    const pad = (n: number) => n.toString().padStart(2, '0');
    const d = new Date();
    const currentTime = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    updateCleaningTask(currentReport.id, task.id, {
      status: nextStatus,
      pic: currentUser.id,
      picName: currentUser.name,
      time: nextStatus === 'DONE' ? currentTime : undefined,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Daily Cleaning & Area Inspection</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Checklist kebersihan per shift untuk seluruh area cinema, auditorium hall, restroom, dan fasilitas penonton
          </p>
        </div>

        {/* Shift Selection Pills */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-2xl p-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveShift('Pagi')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeShift === 'Pagi'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Shift Pagi (Opening)
          </button>
          <button
            type="button"
            onClick={() => setActiveShift('Siang')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeShift === 'Siang'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Shift Siang (Operational)
          </button>
          <button
            type="button"
            onClick={() => setActiveShift('Malam')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeShift === 'Malam'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Shift Malam (Closing)
          </button>
        </div>
      </div>

      {/* Progress & Inspection Overview Card */}
      {currentReport && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Checklist Shift {currentReport.shift} • {currentReport.date}
                </span>
                <StatusBadge
                  status={currentReport.supervisorReview?.approvalStatus || 'PENDING'}
                  size="sm"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Supervisor Pemeriksa:{' '}
                <span className="text-slate-200 font-semibold">
                  {currentReport.supervisorReview?.reviewedByName || 'Menunggu Peninjauan'}
                </span>
                {currentReport.supervisorReview?.remarks && (
                  <span className="text-amber-300 ml-2">({currentReport.supervisorReview.remarks})</span>
                )}
              </p>
            </div>

            {/* Supervisor Approval Actions */}
            {isSupervisorOrManager && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateCleaningReportStatus(
                      currentReport.id,
                      'APPROVED',
                      'Semua area bioskop telah diperiksa dan bersih memenuhi standar SOP'
                    )
                  }
                  className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Approve Inspeksi
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateCleaningReportStatus(
                      currentReport.id,
                      'REJECTED',
                      'Perlu perbaikan pembersihan pada area toilet dan koridor hall'
                    )
                  }
                  className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <AlertCircle className="w-4 h-4" />
                  Minta Perbaikan
                </button>
              </div>
            )}
          </div>

          {/* Progress Bar Kebersihan Harian (% completed) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">
                Progress Penyelesaian: {currentReport.completedTasks} dari {currentReport.totalTasks} Tugas Selesai
              </span>
              <span className="text-amber-400 font-bold">{currentReport.completionPercentage}%</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${currentReport.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari area (Lobby, Toilet, Cinema Hall), deskripsi tugas, atau nama Cinema Crew PIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedAreaFilter}
            onChange={(e) => setSelectedAreaFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Semua Area ({uniqueAreas.length})</option>
            {uniqueAreas.map((area) => (
              <option key={area} value={area}>
                Area {area}
              </option>
            ))}
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="DONE">Selesai Bersih (Done)</option>
            <option value="NOT_DONE">Belum Selesai (Pending)</option>
          </select>
        </div>
      </div>

      {/* Task List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3.5 w-12 text-center">Cek</th>
                <th className="p-3.5">Area Fasilitas</th>
                <th className="p-3.5">Item Pekerjaan Kebersihan</th>
                <th className="p-3.5">PIC Cinema Crew Bertugas</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Bukti Foto</th>
                <th className="p-3.5">Temuan / Catatan</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Tidak ada tugas cleaning yang sesuai filter
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => toggleQuickDone(task)}
                        className="text-slate-400 hover:text-amber-400 transition-colors"
                        title={task.status === 'DONE' ? 'Tandai belum selesai' : 'Tandai sudah selesai'}
                      >
                        {task.status === 'DONE' ? (
                          <CheckSquare className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-500" />
                        )}
                      </button>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-100 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-amber-400" />
                        {task.area}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <p className="text-slate-300 font-medium">{task.task}</p>
                      {task.time && (
                        <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Jam Selesai: {task.time} WIB
                        </p>
                      )}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{task.picName || 'Belum ditugaskan'}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={task.status} size="sm" />
                    </td>
                    <td className="p-3.5">
                      {task.photoEvidence ? (
                        <button
                          type="button"
                          onClick={() => setZoomImage(task.photoEvidence!)}
                          className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300 hover:text-amber-300 flex items-center gap-1"
                          title="Lihat Foto Bukti"
                        >
                          <Camera className="w-3 h-3 text-emerald-400" /> Lihat Foto
                        </button>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Belum ada foto</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {task.notes ? (
                        <span className="text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px] font-medium block truncate max-w-[180px]">
                          {task.notes}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => openTaskModal(task)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-amber-400 border border-slate-700 text-[11px] font-semibold transition-colors"
                      >
                        Update / Foto
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Task Inspection / Photo Upload */}
      {activeTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg my-8 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
              <div>
                <h3 className="font-bold text-base text-slate-100">Update Bukti Kebersihan Area</h3>
                <p className="text-xs text-amber-400">
                  Area: {activeTaskModal.area} • {activeTaskModal.task}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTaskModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Status Tugas</label>
                  <select
                    value={taskDone ? 'DONE' : 'NOT_DONE'}
                    onChange={(e) => setTaskDone(e.target.value === 'DONE')}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="DONE">Selesai Bersih (DONE)</option>
                    <option value="NOT_DONE">Belum Selesai (NOT_DONE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">PIC Cinema Crew Bertugas</label>
                  <select
                    value={assignedPic}
                    onChange={(e) => setAssignedPic(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.position})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Upload Foto Bukti Kebersihan */}
              <FileUpload
                label="Unggah Foto Bukti Kebersihan Area"
                value={photoEvidence}
                onChange={setPhotoEvidence}
                helpText="Ambil foto kondisi area yang telah bersih, rapi, dan disanitasi"
              />

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Catatan Temuan / Kerusakan Fasilitas (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Misal: Baut sandaran kursi Hall 2 kendur, dispenser sabun wastafel macet..."
                  value={findingNotes}
                  onChange={(e) => setFindingNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTaskModal(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all"
                >
                  Simpan Status Checklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Zoom Modal */}
      {zoomImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-4 relative shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="text-xs font-bold text-slate-200">Foto Dokumentasi Kebersihan Area</span>
              <button
                type="button"
                onClick={() => setZoomImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={zoomImage}
              alt="Preview Dokumentasi"
              className="w-full max-h-[70vh] object-contain rounded-xl border border-slate-800"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
